import { zoneCode, zoneTone } from "@/lib/sessionFacts";

/**
 * La puce de zone compacte : le code écrit (`Z1`, `Z1-Z2`, `Z5`), sur la
 * teinte de la zone la plus haute qu'elle couvre. Le code est toujours
 * écrit, la teinte ne fait que le doubler. Sans zone, un tiret sur hachures.
 */
export function ZoneChip({ zone, className }: { zone: string | null | undefined; className?: string }) {
  const code = zoneCode(zone);
  const tone = zoneTone(zone);
  return (
    <span className={className ? `zn-zchip ${className}` : "zn-zchip"} data-zone={tone ?? "none"}>
      {code ?? "-"}
    </span>
  );
}
