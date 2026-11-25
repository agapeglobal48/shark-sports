// Size charts shown on the Size guide page, keyed by shop category slug.
// Enter BODY measurements (the customer's body, not the garment) in centimetres.
// A chart with no rows shows "coming soon" on the site.
//
// Example row for hoodies: { size: 'M', chest: 102, waist: 88, length: 72 }

export const MEASUREMENTS = {
  chest: { label: 'Chest', unit: 'cm', how: 'Measure around the fullest part of your chest, under your arms, keeping the tape level.' },
  waist: { label: 'Waist', unit: 'cm', how: 'Measure around your natural waistline, the narrowest part of your body.' },
  hips: { label: 'Hips', unit: 'cm', how: 'Stand with your feet together and measure around the widest part of your hips.' },
  insideLeg: { label: 'Inside leg', unit: 'cm', how: 'Measure from the top of your inner thigh down to the bottom of your ankle.' },
  length: { label: 'Body length', unit: 'cm', how: 'Measure from the highest point of your shoulder down to where you want the hem to sit.' },
  head: { label: 'Head', unit: 'cm', how: 'Measure around your head, just above your ears and eyebrows.' },
  shoe: { label: 'UK shoe size', unit: 'UK', how: 'Use your usual UK shoe size.' },
}

export const SIZE_CHARTS = {
  hoodies: { measures: ['chest', 'waist', 'length'], finder: 'chest', rows: [] },
  jerseys: { measures: ['chest', 'waist', 'length'], finder: 'chest', rows: [] },
  shirts: { measures: ['chest', 'waist', 'length'], finder: 'chest', rows: [] },
  trousers: { measures: ['waist', 'hips', 'insideLeg'], finder: 'waist', rows: [] },
  hats: { measures: ['head'], finder: 'head', rows: [] },
  socks: { measures: ['shoe'], finder: 'shoe', rows: [] },
}

// Used for any new category that has no chart above yet.
export const DEFAULT_CHART = { measures: ['chest', 'waist'], finder: 'chest', rows: [] }
