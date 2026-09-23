import type { ProjectPlacement } from './ProjectPattern'

// Figma 92:7176 text positions relative to the fabric's (305, 280.032) origin,
// in 50px stitch units. Full & false follows the existing one-stitch shift.
export const projectTitles: Record<string, { text: string; left: number; top: number }> = {
  'full-false': { text: 'full & false', left: 7.66, top: 9.78 },
  'soft-copy-deep-copy': { text: 'Soft\nCopy\n&\nDeep\nCopy', left: 23.92, top: 6.04 },
  hangsha: { text: '행샤', left: 9.42, top: 21.38 },
  hourglass: { text: '하지 못한 말', left: 2.62, top: 33.14 },
  adreboa: { text: 'Adreboa', left: 17.46, top: 32.48 },
  // No text node in Figma: use the same below-pattern treatment as Adreboa.
  'la-tourette': { text: 'La Tourette', left: 2.9, top: 50.48 },
}

export function getProjectTitleRevealCount(
  project: ProjectPlacement,
  rowCount: number,
  rowOffset: number,
  castOn: number,
): number {
  // Bottom-to-top, alternating rows: the top project row is revealed last.
  const revealRow = rowCount - rowOffset - project.startRow - 1
  const lastColumn = revealRow % 2 === 1
    ? castOn - project.startColumn - 1
    : project.startColumn + project.columns - 1

  return revealRow * castOn + lastColumn + 1
}
