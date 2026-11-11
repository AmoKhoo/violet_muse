// Violet theme — THE single source of truth for the site's colours.
// Change a value here AND in app/globals.css (the same tokens, same names)
// and the whole site — public pages and all four panels — updates.
// The owner can change the theme later by editing this file (or, later, from
// the admin panel, which will write to these same tokens).
//
// Palette (soft violet + muted teal on warm cream — never harsh purple,
// never dark-mode-only):
export const theme = {
  // Primary — soft violet / lavender
  violet: '#8B7BC7',
  violetAccent: '#A78BFA',
  violetLight: '#EDE9F7',
  violetSoft: '#F4F1FA',
  // Deep plum — headings and primary text
  plum: '#4C3A7A',
  plumDark: '#372A5C',
  // Background — warm off-white / cream
  background: '#FBF8F5',
  surface: '#FFFFFF',
  cardTint: '#F7F4FC',
  // Secondary — muted teal / sage (calm secondary accents, success states)
  teal: '#6FA8A0',
  tealDark: '#4E7D76',
  tealLight: '#E6F2EF',
  // Text + borders
  text: '#2E2A3A',
  textMuted: '#6E6A7E',
  border: '#E3DEF0',
  borderSoft: '#EEEAF7',
  // Status
  success: '#6FA8A0',
  warning: '#C9A227',
  danger: '#C26A6A',
} as const;

export type Theme = typeof theme;
