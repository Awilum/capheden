/**
 * Frames of rising steam, generated so the animation stays deterministic (and
 * therefore testable) instead of shipping a sprite sheet.
 */
export function steamFrames(step, width = 11, rows = 3) {
  const safeWidth = Math.max(3, Math.round(width));
  const lines = [];
  // Built bottom-up so the result reads top-to-bottom like real steam.
  for (let row = rows - 1; row >= 0; row--) {
    const cells = Array.from({ length: safeWidth }, () => ' ');
    const offset = (((step + row * 2) % safeWidth) + safeWidth) % safeWidth;
    for (let puff = 0; puff < 3; puff++) {
      const x = (offset + puff * 4) % safeWidth;
      cells[x] = '~';
    }
    lines.push(cells.join(''));
  }
  return lines;
}
const SPINNER_FRAMES = ['☕', '🫖', '☕'];
/** Small idle indicator shown while caffeinate is being started or stopped. */
export function spinnerFrame(step) {
  return (
    SPINNER_FRAMES[
      ((step % SPINNER_FRAMES.length) + SPINNER_FRAMES.length) % SPINNER_FRAMES.length
    ] ?? '☕'
  );
}
/**
 * Position of the travelling highlight used by the progress bar of an
 * indefinite session. The block wraps around without ever splitting.
 */
export function marqueeRange(width, step, size = 3) {
  const safeWidth = Math.max(4, Math.round(width));
  const blockSize = Math.max(2, Math.min(Math.floor(safeWidth / 2), Math.round(size)));
  const travel = safeWidth - blockSize + 1;
  const start = ((((step % travel) + travel) % travel) | 0) + 1;
  return { start: start - 1, size: blockSize };
}
//# sourceMappingURL=animation.js.map
