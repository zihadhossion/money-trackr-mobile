/**
 * The app's type scale.
 *
 * Six sizes, no more. Every value is an exact size from Apple's Dynamic Type
 * ladder, and each one also lands on a Material 3 token — so the same numbers
 * read as native on both platforms. Before this file the app used fourteen
 * sizes with nine separate steps between 10 and 18; a 1px difference carries no
 * hierarchy, it just makes two screens disagree.
 *
 * Picking a size: go by how much the words matter, not by how they look in one
 * card. If a role is not listed on a token below, it belongs to the token
 * nearest in importance — don't add a seventh size.
 *
 * Emoji glyphs (category icons, the form preview) are artwork, not text. Their
 * dimensions belong in shapes.ts, even though React Native sizes them with
 * fontSize.
 */

/**
 * 11 is Apple's hard floor — no text goes below it, at any accessibility
 * setting. The tab bar sits exactly here.
 */
export const fontSize = {
  /** Badges, tab labels, chart axis ticks, uppercase filter chips. */
  caption: 11,
  /** Dates, notes, muted helper text, form labels, chart legends. */
  meta: 13,
  /** Default body copy, text inputs, buttons, list-row titles. */
  body: 15,
  /** Amounts, section titles, row totals, sheet and form titles. */
  emphasis: 17,
  /** Screen titles. */
  title: 22,
  /** The login hero — one per screen at most, usually zero. */
  display: 28,
} as const;

/**
 * Four weights. iOS builds hierarchy from weight far more than from size
 * (Headline and Body are both 17pt and differ only here), so reach for a
 * heavier weight before a larger size.
 */
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * Only for text that wraps to a second line. Single-line labels look better
 * with the platform default, so leave lineHeight off them.
 *
 * Roughly 1.4x the size — below about 1.3x, wrapped lines start to collide.
 */
export const lineHeight = {
  caption: 16,
  meta: 18,
  body: 21,
  emphasis: 24,
  title: 28,
  display: 34,
} as const;

/**
 * React Native scales every <Text> with the OS font-size setting by default.
 * At the largest setting that is over 3x, which breaks any fixed-height row —
 * and this app is full of them (see shapes.ts). Capping at 1.35 keeps large
 * type usable without collapsing the layout, and matches what most design
 * systems settle on.
 *
 * Pass to <Text maxFontSizeMultiplier={MAX_FONT_SCALE}>.
 */
export const MAX_FONT_SCALE = 1.35;
