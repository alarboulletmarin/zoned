/** L'indice de la première carte dont le milieu se trouve sous le pointeur. */
export function slotInDay(day: Element, clientY: number, draggedIndex: number): number | undefined {
  for (const card of day.querySelectorAll<HTMLElement>("[data-session-index]")) {
    const index = Number(card.dataset.sessionIndex);
    if (index === draggedIndex) continue;
    const box = card.getBoundingClientRect();
    if (clientY < box.top + box.height / 2) return index;
  }
  return undefined;
}

/** Le même aperçu suit le doigt dans le plan et dans le tableau de la semaine. */
export function createSessionDragGhost(card: HTMLElement): HTMLElement {
  const ghost = card.cloneNode(true) as HTMLElement;
  ghost.classList.add("zn-session-drag-ghost");
  ghost.inert = true;
  ghost.removeAttribute("draggable");
  ghost.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
  ghost.style.inlineSize = `${card.offsetWidth}px`;
  document.body.appendChild(ghost);
  return ghost;
}
