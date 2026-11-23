// App-wide settings. Override with VITE_* variables in client/.env when deploying.

export const API_URL = import.meta.env.VITE_API_URL || '/api'

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD || 'bel0mpgs'
const HERO_ID = 'shark-sports/site/hero'
const videoBase = `https://res.cloudinary.com/${CLOUD}/video/upload`

// Cloudinary compresses the 24 MB original to ~2.5 MB (desktop) / ~0.9 MB (mobile).
export const HERO_VIDEO = {
  desktop: `${videoBase}/ac_none,q_auto,vc_auto,w_1600,c_limit/${HERO_ID}.mp4`,
  mobile: `${videoBase}/ac_none,q_auto,vc_auto,w_720,c_limit/${HERO_ID}.mp4`,
  poster: `${videoBase}/so_1,q_auto,f_auto,w_1600,c_limit/${HERO_ID}.jpg`,
}

export const LOGO = '/mako-logo.png'

// Shown in the shop's size filter.
export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']

// Shown in the shop's price filter (pence).
export const PRICE_RANGES = [
  { label: 'Under £20', min: null, max: 1999 },
  { label: '£20 – £40', min: 2000, max: 3999 },
  { label: '£40 – £60', min: 4000, max: 5999 },
  { label: '£60+', min: 6000, max: null },
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
]
