/**
 * Garde-fou : aucun `catch` muet dans l'interface.
 *
 * Regle de la maison, posee le 20 septembre 2026 : dans `src/pages`,
 * `src/components` et `src/hooks`, un `catch` doit faire l'une de ces trois
 * choses, sans quoi une action qui echoue ne laisse rien a l'ecran et la
 * personne se demande ce qui n'a pas marche.
 *
 *   1. le DIRE : `toast.failure(...)`, `toast.error(...)`, un etat d'erreur
 *      (`setError`, `setFailed`, `setInvalidFile`...), un `onError(...)` remonte
 *      au parent, ou relancer (`throw`, `reject`) pour qu'un autre le dise ;
 *   2. ou porter un COMMENTAIRE qui justifie le silence : une feuille de
 *      partage refermee, une lecture de localStorage qui retombe sur sa valeur
 *      par defaut, un `AbortError` attendu.
 *
 * Le commentaire n'est pas une formalite : c'est la trace, relue au diff, que
 * le silence est un choix et pas un oubli. Un `catch {}` nu, ou un `catch` qui
 * ne fait que `console.warn`, est refuse.
 *
 * `src/lib` n'est pas dans le perimetre : une bibliotheque ne parle pas a
 * l'ecran, elle repond un `Outcome` ou leve une `AppFailure` (lib/failure.ts),
 * et c'est l'appelant qui dit.
 *
 * Analyse par l'API TypeScript plutot que par expression reguliere : un
 * `catch` s'etend sur plusieurs lignes et une regex ne sait pas ou il finit.
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import ts from "typescript";

const ROOT = join(import.meta.dirname, "..");
const ROOTS = ["src/pages", "src/components", "src/hooks"];
const EXT = [".ts", ".tsx"];

/** Ce qui compte comme "dire". Un appel dont le texte contient l'un d'eux. */
const SURFACES: RegExp[] = [
  /\btoast\.(failure|error|warning|dismiss)\(/,
  // un etat d'erreur : setError, setFailed, setInvalidFile, setAnalysisFailed...
  /\bset(?=[A-Z])\w*(Error|Errors|Failed|Failure|Invalid|Unavailable)\w*\(/,
  // un rapport remonte ou delegue : onError, reportExportFailure, notifyError...
  /\b\w+(Failure|Failed|Error)\(/,
  /\breject\(/,
];

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (EXT.some((e) => name.endsWith(e)) && !/\.test\.tsx?$/.test(name)) out.push(full);
  }
}

interface Finding {
  file: string;
  line: number;
  text: string;
}

function hasComment(source: string, block: ts.Block): boolean {
  // Le texte entre les accolades, commentaires compris : `getText()` les
  // exclut aux bords, d'ou la lecture directe dans la source.
  const inner = source.slice(block.getStart() + 1, block.getEnd() - 1);
  return /\/\/|\/\*/.test(inner);
}

function surfaces(block: ts.Block): boolean {
  let found = false;
  const visit = (node: ts.Node): void => {
    if (found) return;
    if (ts.isThrowStatement(node)) {
      found = true;
      return;
    }
    if (ts.isCallExpression(node)) {
      const text = node.expression.getText();
      if (SURFACES.some((re) => re.test(text + "("))) {
        found = true;
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(block);
  return found;
}

function check(file: string): Finding[] {
  const source = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const findings: Finding[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isCatchClause(node)) {
      const block = node.block;
      if (!surfaces(block) && !hasComment(source, block)) {
        const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
        const firstLine = block.getText().split("\n").slice(0, 2).join(" ").replace(/\s+/g, " ").trim();
        findings.push({ file: relative(ROOT, file), line: line + 1, text: firstLine.slice(0, 90) });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return findings;
}

const files: string[] = [];
for (const root of ROOTS) walk(join(ROOT, root), files);

const findings = files.flatMap(check);

if (findings.length === 0) {
  console.log(`Surface des erreurs : ${files.length} fichiers, aucun catch muet.`);
  process.exit(0);
}

console.error(`${findings.length} catch muet(s). Chacun doit dire l'echec (toast.failure, un etat d'erreur, onError, throw) ou porter un commentaire qui justifie le silence.\n`);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  ${f.text}`);
}
process.exit(1);
