/**
 * One place for every colour, so the whole app feels like the same product.
 * Semantic names instead of raw hex at the call site.
 */
export const theme = {
  color: {
    /** Vietnamese dark-roast brown, the brand colour. */
    coffee: '#C98B4B',
    /** Lighter roast, used for the wordmark. */
    caramel: '#E0A96D',
    /** Panel borders. */
    border: '#7A5B3C',
    /** Secondary information. */
    muted: '#9A9184',
    /** Barely-there separator lines. */
    faint: '#5C5548',
    /** Primary text. */
    cream: '#F5E9DA',
    /** Active / awake. */
    awake: '#7BE08A',
    /** Confirmation, "this will end soon". */
    warn: '#F5C451',
    /** Stopping, errors. */
    danger: '#F0766C',
    /** Informational accents (mode labels). */
    info: '#86B6DE',
  },
};
/** Progress bar colour shifts as a session runs out. */
export function progressColor(progress) {
  if (progress >= 0.85) return theme.color.danger;
  if (progress >= 0.6) return theme.color.warn;
  return theme.color.awake;
}
//# sourceMappingURL=theme.js.map
