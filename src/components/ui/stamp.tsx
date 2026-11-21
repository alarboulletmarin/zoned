/**
 * Le tampon : l'encre remplit la marque depuis le centre, puis la coche se
 * trace, puis le tout se retire sur la marque telle qu'elle est désormais.
 * Geste : une séance vient d'être close. Monté le temps d'un seul passage,
 * sous un parent qui porte `data-just-done` et `position: relative`
 * (stamp.css). Une seule implémentation, au cockpit comme dans la semaine et
 * le calendrier d'un plan.
 */
export function Stamp({ onDone }: { onDone?: () => void }) {
  return (
    <span
      className="zn-stamp"
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onDone?.();
      }}
    >
      <svg className="zn-stamp__check" viewBox="0 0 24 24" focusable="false">
        <path d="M5 12.5l4.5 4.5L19 7" pathLength={1} />
      </svg>
    </span>
  );
}
