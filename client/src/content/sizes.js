// Size guides: one page per product type, at /size-guide/<slug>.
//
// HOW TO ADD MEASUREMENTS
// Each product has a `charts` object with one entry per size range (youth, adult, ladies, slim).
// Fill in each size row with your measurements in CENTIMETRES. Inches are worked out on the site.
// 'To fit' columns are the wearer's body size and can be a range, e.g. chestToFit: '86-91'.
// 'Across' columns are the garment laid flat, measured from side to side.
// A range with no numbers yet shows "measurements coming soon".
//
// Example: { size: 'Medium Adult', chestToFit: '96-101', length: 74, chestAcross: 52, waistAcross: 50, hipAcross: 51, sleeve: 21 }

export const COLUMNS = {
  chestToFit: { label: "Chest 'to fit'", how: 'Measure around the fullest part of your chest, under your arms, keeping the tape level.' },
  bustToFit: { label: "Bust 'to fit'", how: 'Measure around the fullest part of your bust, keeping the tape level.' },
  waistToFit: { label: "Waist 'to fit'", how: 'Measure around your natural waistline, the narrowest part of your body.' },
  hipToFit: { label: "Hip 'to fit'", how: 'Stand with your feet together and measure around the widest part of your hips.' },
  age: { label: 'Average age', unit: 'years' },
  length: { label: 'Length' },
  chestAcross: { label: 'Chest across' },
  waistAcross: { label: 'Waist across' },
  hipAcross: { label: 'Hip across' },
  waistHipAcross: { label: 'Waist & hip across' },
  sleeve: { label: 'Sleeve' },
  insideLeg: { label: 'Inside leg', how: 'Measure from the top of your inner thigh down to the bottom of your ankle.' },
}

export const RANGE_LABELS = { youth: 'Youth', adult: 'Adult', ladies: 'Ladies', slim: 'Slim fit' }

const SIZES = {
  youth: ['4X Small Youth', '3X Small Youth', '2X Small Youth', 'Extra Small Youth', 'Small Youth', 'Medium Youth', 'Large Youth', 'Extra Large Youth'],
  adult: ['Small Adult', 'Medium Adult', 'Large Adult', 'Extra Large Adult', '2X Large Adult', '3X Large Adult', '4X Large Adult', '5X Large Adult'],
  ladies: ["Ladies' 6", "Ladies' 8", "Ladies' 10", "Ladies' 12", "Ladies' 14", "Ladies' 16", "Ladies' 18", "Ladies' 20"],
  slim: ['Slim Fit Small Youth', 'Slim Fit Medium Youth', 'Slim Fit Large Youth', 'Slim Fit Extra Large Youth', 'Slim Fit Small Adult', 'Slim Fit Medium Adult', 'Slim Fit Large Adult', 'Slim Fit Extra Large Adult'],
}

// Columns for each kind of garment and size range.
const LAYOUTS = {
  top: {
    youth: ['chestToFit', 'age', 'length', 'chestAcross', 'waistHipAcross', 'sleeve'],
    adult: ['chestToFit', 'length', 'chestAcross', 'waistAcross', 'hipAcross', 'sleeve'],
    ladies: ['bustToFit', 'length', 'chestAcross', 'waistAcross', 'hipAcross', 'sleeve'],
    slim: ['chestToFit', 'length', 'chestAcross', 'waistAcross', 'hipAcross', 'sleeve'],
  },
  vest: {
    youth: ['chestToFit', 'age', 'length', 'chestAcross', 'waistHipAcross'],
    adult: ['chestToFit', 'length', 'chestAcross', 'waistAcross', 'hipAcross'],
    ladies: ['bustToFit', 'length', 'chestAcross', 'waistAcross', 'hipAcross'],
    slim: ['chestToFit', 'length', 'chestAcross', 'waistAcross', 'hipAcross'],
  },
  shorts: {
    youth: ['waistToFit', 'age', 'length', 'waistAcross', 'hipAcross'],
    adult: ['waistToFit', 'hipToFit', 'length', 'waistAcross', 'hipAcross'],
    ladies: ['waistToFit', 'hipToFit', 'length', 'waistAcross', 'hipAcross'],
    slim: ['waistToFit', 'hipToFit', 'length', 'waistAcross', 'hipAcross'],
  },
  trousers: {
    youth: ['waistToFit', 'age', 'length', 'insideLeg', 'waistAcross', 'hipAcross'],
    adult: ['waistToFit', 'hipToFit', 'length', 'insideLeg', 'waistAcross', 'hipAcross'],
    ladies: ['waistToFit', 'hipToFit', 'length', 'insideLeg', 'waistAcross', 'hipAcross'],
    slim: ['waistToFit', 'hipToFit', 'length', 'insideLeg', 'waistAcross', 'hipAcross'],
  },
}

// What measurements A and B on the picture are, for each kind of garment.
export const GUIDES = {
  top: { a: 'length', b: 'chestAcross', aText: 'from the highest point of the shoulder, next to the collar, straight down to the hem', bText: 'straight across the chest, from armpit to armpit' },
  vest: { a: 'length', b: 'chestAcross', aText: 'from the highest point of the shoulder strap straight down to the hem', bText: 'straight across the chest, from armpit to armpit' },
  shorts: { a: 'length', b: 'waistAcross', aText: 'down the side, from the top of the waistband to the hem', bText: 'straight across the top of the waistband, unstretched' },
  trousers: { a: 'length', b: 'waistAcross', aText: 'down the side, from the top of the waistband to the hem', bText: 'straight across the top of the waistband, unstretched' },
}

function charts(kind, ranges) {
  return Object.fromEntries(ranges.map((r) => [r, { columns: LAYOUTS[kind][r], rows: SIZES[r].map((size) => ({ size })) }]))
}

const ALL = ['youth', 'adult', 'ladies', 'slim']

export const SIZE_PRODUCTS = [
  { slug: 'long-sleeved-football-shirts', name: 'Long sleeved football shirts', garment: 'longSleeve', kind: 'top', charts: charts('top', ALL) },
  { slug: 'short-sleeved-football-shirts', name: 'Short sleeved football shirts', garment: 'jersey', kind: 'top', charts: charts('top', ALL) },
  { slug: 'football-shorts', name: 'Football shorts', garment: 'shorts', kind: 'shorts', charts: charts('shorts', ['youth', 'adult', 'ladies']) },
  { slug: 'bowls-and-polo-shirts', name: 'Bowls shirts or polo shirts', garment: 'polo', kind: 'top', charts: charts('top', ALL) },
  { slug: 'tracksuit-and-rain-jackets', name: 'Tracksuit or rain jackets', garment: 'jacket', kind: 'top', charts: charts('top', ['youth', 'adult', 'ladies']) },
  { slug: 'tracksuit-bottoms', name: 'Tracksuit bottoms', garment: 'trousers', kind: 'trousers', charts: charts('trousers', ['youth', 'adult', 'ladies']) },
  { slug: 'quarter-zip-training-tops', name: 'Quarter zip training tops', garment: 'quarterZip', kind: 'top', charts: charts('top', ALL) },
  { slug: 'tight-fit-training-bottoms', name: 'Tight fit training bottoms', garment: 'leggings', kind: 'trousers', charts: charts('trousers', ['youth', 'adult', 'ladies']) },
  { slug: 'hoodies-and-sweatshirts', name: 'Hoodies or sweatshirts', garment: 'hoodie', kind: 'top', charts: charts('top', ALL) },
  { slug: 'manager-jackets-standard', name: 'Manager jackets – standard length', garment: 'managerJacket', kind: 'top', charts: charts('top', ['youth', 'adult', 'ladies']) },
  { slug: 'manager-jackets-three-quarter', name: 'Manager jackets – 3/4 length', garment: 'managerLong', kind: 'top', charts: charts('top', ['adult', 'ladies']) },
  { slug: 'athletics-vests', name: 'Athletics vests', garment: 'vest', kind: 'vest', charts: charts('vest', ALL) },
  { slug: 'tight-fit-undershirts', name: 'Tight fit undershirts', garment: 'baseLayer', kind: 'top', charts: charts('top', ['youth', 'adult', 'ladies']) },
  { slug: 'bowls-shorts', name: 'Bowls shorts', garment: 'bowlsShorts', kind: 'shorts', charts: charts('shorts', ['adult', 'ladies']) },
  { slug: 'bowls-trousers', name: 'Bowls trousers', garment: 'bowlsTrousers', kind: 'trousers', charts: charts('trousers', ['adult', 'ladies']) },
]

/** True once at least one size in the range has a measurement filled in. */
export const hasMeasurements = (chart) => chart.rows.some((row) => chart.columns.some((c) => row[c] != null && row[c] !== ''))
