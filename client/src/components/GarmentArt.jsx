import { useId } from 'react'
import { LOGO } from '../config.js'

// Drawn Mako product pictures for the size guide: black kit with cyan fin panels.
// Every garment is drawn on a 300 x 320 canvas, facing the viewer.

const INK = '#0c0e12'
const FIN = '#22e4f6'
const WHITE = '#f4f6f8'
const LOGO_RATIO = 456 / 1550

// Neck, shoulders and body shared by the tops.
const SHORT_SLEEVE =
  'M112 30 C125 44 175 44 188 30 L232 44 L272 94 L242 120 L226 102 L228 298 Q150 310 72 298 L74 102 L58 120 L28 94 L68 44 Z'
const LONG_SLEEVE =
  'M112 30 C125 44 175 44 188 30 L232 44 C250 60 258 90 264 130 L278 254 L252 258 L238 142 L228 118 L228 298 Q150 310 72 298 L72 118 L62 142 L48 258 L22 254 L36 130 C42 90 50 60 68 44 Z'

// Fin-shaped panels down each side, drawn for the left and mirrored for the right.
const SIDE_FIN = 'M76 104 C104 150 110 226 90 296 L80 297 C94 228 90 160 72 112 Z'
const SHOULDER_FIN = 'M68 44 C96 50 116 66 124 96 C104 76 88 66 62 62 Z'
const LONG_CUFF = 'M22 254 L48 258 L50 244 L24 240 Z'

const GARMENTS = {
  jersey: {
    label: 'Short-sleeved shirt',
    body: SHORT_SLEEVE,
    fins: [SIDE_FIN, SHOULDER_FIN, 'M28 94 L58 120 L64 113 L35 87 Z'],
    trims: ['M112 30 C125 44 175 44 188 30 L196 34 C178 58 122 58 104 34 Z'],
    logo: { x: 150, y: 76, w: 60 },
  },
  longSleeve: {
    label: 'Long-sleeved shirt',
    body: LONG_SLEEVE,
    fins: [SIDE_FIN, SHOULDER_FIN, LONG_CUFF],
    trims: ['M112 30 C125 44 175 44 188 30 L196 34 C178 58 122 58 104 34 Z'],
    logo: { x: 150, y: 76, w: 60 },
  },
  polo: {
    label: 'Polo shirt',
    body: SHORT_SLEEVE,
    fins: [SIDE_FIN, 'M28 94 L58 120 L64 113 L35 87 Z'],
    trims: [],
    logo: { x: 192, y: 92, w: 40 },
    details: (
      <>
        <path d="M144 40 H156 V118 H144 Z" fill={INK} stroke={WHITE} strokeOpacity="0.25" />
        {[62, 82, 102].map((y) => (
          <circle key={y} cx="150" cy={y} r="3" fill={WHITE} />
        ))}
        <path d="M112 30 L150 46 L126 74 L100 40 Z" fill={FIN} />
        <path d="M188 30 L150 46 L174 74 L200 40 Z" fill={FIN} />
        <path d="M112 30 C125 40 175 40 188 30 L150 46 Z" fill="#000" fillOpacity="0.5" />
      </>
    ),
  },
  hoodie: {
    label: 'Hoodie',
    body: LONG_SLEEVE,
    fins: [SIDE_FIN, LONG_CUFF, 'M72 284 Q150 296 228 284 L228 298 Q150 310 72 298 Z'],
    trims: [],
    logo: { x: 150, y: 168, w: 64 },
    behind: <path d="M98 44 C88 0 212 0 202 44 C186 30 114 30 98 44 Z" fill={INK} />,
    details: <path d="M98 210 H202 L216 268 H84 Z" fill="none" stroke={WHITE} strokeOpacity="0.28" strokeWidth="2" />,
    after: (
      <>
        <path d="M100 42 C100 16 200 16 200 42 C200 66 170 78 150 78 C130 78 100 66 100 42 Z" fill={FIN} />
        <path d="M114 42 C116 26 184 26 186 42 C184 58 166 66 150 66 C134 66 116 58 114 42 Z" fill="#050608" />
        <path d="M136 76 V128 M164 76 V128" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  jacket: {
    label: 'Track jacket',
    body: LONG_SLEEVE,
    fins: [SIDE_FIN, SHOULDER_FIN, LONG_CUFF],
    trims: ['M114 18 H186 L190 40 C172 50 128 50 110 40 Z'],
    logo: { x: 116, y: 82, w: 40 },
    details: <path d="M148.5 40 H151.5 V302 H148.5 Z" fill={WHITE} />,
  },
  shorts: {
    label: 'Shorts',
    body: 'M78 36 H222 L252 256 H164 L150 138 L136 256 H48 Z',
    fins: ['M78 56 L48 256 H62 L90 56 Z', 'M50 240 H138 L136 256 H48 Z'],
    trims: ['M78 36 H222 L224 54 H76 Z'],
    logo: { x: 96, y: 228, w: 46 },
    details: <path d="M150 54 V138" stroke="#000" strokeOpacity="0.4" strokeWidth="2" />,
  },
  trousers: {
    label: 'Trousers',
    body: 'M94 20 H206 L218 306 H162 L150 88 L138 306 H82 Z',
    fins: ['M94 38 L82 306 H90 L101 38 Z', 'M82 292 H138 V306 H82 Z'],
    trims: ['M94 20 H206 L207 38 H93 Z'],
    logo: { x: 120, y: 66, w: 34 },
  },
  leggings: {
    label: 'Leggings',
    body: 'M106 20 H194 C196 120 192 220 186 306 H160 L150 96 L140 306 H114 C108 220 104 120 106 20 Z',
    fins: ['M106 38 C106 130 110 220 114 306 H120 C114 220 112 130 113 38 Z'],
    trims: ['M106 20 H194 L194 38 H106 Z'],
    logo: { x: 128, y: 62, w: 30 },
  },
  cap: {
    label: 'Cap',
    body: 'M66 196 C62 96 238 96 234 196 Z',
    fins: ['M150 98 C176 100 200 140 204 196 H186 C182 150 166 118 150 112 Z'],
    trims: [],
    logo: { x: 150, y: 170, w: 70 },
    zoom: 1.35,
    after: (
      <>
        <path d="M150 100 V140" stroke="#000" strokeOpacity="0.45" strokeWidth="2" fill="none" />
        <circle cx="150" cy="100" r="7" fill={FIN} />
        <path d="M48 196 Q150 176 252 196 Q270 230 240 236 Q150 214 60 236 Q30 230 48 196 Z" fill={INK} stroke={WHITE} strokeOpacity="0.3" strokeWidth="1.5" />
        <path d="M60 230 Q150 208 240 230" stroke={FIN} strokeWidth="3" fill="none" />
      </>
    ),
  },
  socks: {
    label: 'Socks',
    body: 'M116 20 H184 V196 L240 232 C266 248 258 296 222 296 H156 C128 296 116 276 116 250 Z',
    fins: ['M116 34 H184 V44 H116 Z', 'M116 56 H184 V66 H116 Z', 'M208 260 C230 256 252 262 256 280 C252 292 240 296 222 296 H204 C198 282 198 268 208 260 Z'],
    trims: ['M116 20 H184 V30 H116 Z'],
    logo: { x: 150, y: 120, w: 50 },
    details: <path d="M116 250 C116 276 128 296 156 296 H170 C150 290 140 270 140 250 Z" fill={FIN} />,
  },
  quarterZip: {
    label: 'Quarter zip top',
    body: LONG_SLEEVE,
    fins: [SIDE_FIN, SHOULDER_FIN, LONG_CUFF],
    trims: ['M112 14 H188 L192 36 C172 46 128 46 108 36 Z'],
    logo: { x: 198, y: 84, w: 42 },
    details: (
      <>
        <path d="M148.5 36 H151.5 V114 H148.5 Z" fill={WHITE} />
        <rect x="146" y="108" width="8" height="14" rx="2" fill={WHITE} />
      </>
    ),
  },
  managerJacket: managerJacket('Manager jacket', 290),
  managerLong: { ...managerJacket('Manager jacket, 3/4 length', 360), zoom: 0.8 },
  vest: {
    label: 'Athletics vest',
    body: 'M106 24 H132 C136 64 164 64 168 24 H194 C196 70 212 104 236 118 L232 300 Q150 312 68 300 L64 118 C88 104 104 70 106 24 Z',
    fins: [SIDE_FIN, 'M106 24 C104 70 88 104 64 118 L72 128 C98 112 114 74 114 24 Z'],
    trims: ['M132 24 C136 64 164 64 168 24 L174 24 C170 72 130 72 126 24 Z'],
    logo: { x: 150, y: 104, w: 54 },
  },
  baseLayer: {
    label: 'Tight fit undershirt',
    body: 'M120 30 C132 40 168 40 180 30 L220 42 C238 58 244 90 248 130 L262 256 L242 258 L228 140 L218 116 L216 298 Q150 306 84 298 L82 116 L72 140 L58 258 L38 256 L52 130 C56 90 62 58 80 42 Z',
    fins: ['M82 118 L86 298 L93 298 L89 118 Z', 'M38 256 L58 258 L59 247 L39 245 Z', 'M80 42 C96 46 106 56 110 70 L84 66 Z'],
    trims: ['M120 14 H180 L182 32 C168 40 132 40 118 32 Z'],
    logo: { x: 150, y: 72, w: 50 },
  },
  bowlsShorts: {
    label: 'Bowls shorts',
    body: 'M76 30 H224 L246 236 H162 L150 120 L138 236 H54 Z',
    fins: ['M56 224 H138 L137 236 H54 Z'],
    trims: ['M76 30 H224 L225 44 H75 Z'],
    logo: { x: 96, y: 206, w: 40 },
    details: <path d="M150 44 V104 M84 54 C100 60 108 74 110 92 M216 54 C200 60 192 74 190 92" stroke={WHITE} strokeOpacity="0.3" strokeWidth="2" fill="none" />,
    after: <path d="M100 28 V46 M200 28 V46 M128 28 V46 M172 28 V46" stroke={INK} strokeWidth="4" />,
  },
  bowlsTrousers: {
    label: 'Bowls trousers',
    body: 'M92 20 H208 L218 306 H162 L150 92 L138 306 H82 Z',
    fins: ['M83 294 H138 V306 H82 Z'],
    trims: ['M92 20 H208 L209 34 H91 Z'],
    logo: { x: 120, y: 64, w: 32 },
    details: <path d="M150 34 V84 M116 44 L110 306 M184 44 L190 306 M98 42 C110 46 116 56 118 70 M202 42 C190 46 184 56 182 70" stroke={WHITE} strokeOpacity="0.2" strokeWidth="2" fill="none" />,
    after: <path d="M110 18 V36 M190 18 V36 M134 18 V36 M166 18 V36" stroke={INK} strokeWidth="4" />,
  },
}

// A padded touchline jacket with a high collar, full zip and quilted panels.
function managerJacket(label, hem) {
  return {
    label,
    body: `M108 24 C125 34 175 34 192 24 L236 42 C256 60 262 92 266 132 L280 256 L254 260 L240 146 L232 124 L234 ${hem} Q150 ${hem + 10} 66 ${hem} L68 124 L60 146 L46 260 L20 256 L34 132 C38 92 44 60 64 42 Z`,
    fins: ['M20 256 L46 260 L48 246 L22 242 Z', 'M64 42 C90 48 108 58 116 76 L60 70 Z'],
    trims: [],
    logo: { x: 198, y: 96, w: 44 },
    details: (
      <>
        {Array.from({ length: Math.floor((hem - 80) / 36) + 1 }, (_, i) => (
          <path key={i} d={`M0 ${92 + i * 36} H300`} stroke="#000" strokeOpacity="0.55" strokeWidth="2" />
        ))}
        <path d={`M148.5 30 H151.5 V${hem + 10} H148.5 Z`} fill={WHITE} />
        <path d={`M82 ${hem - 70} L112 ${hem - 76} M218 ${hem - 70} L188 ${hem - 76}`} stroke={WHITE} strokeOpacity="0.35" strokeWidth="3" />
      </>
    ),
    after: <path d="M106 2 H194 L196 30 C176 42 124 42 104 30 Z" fill={INK} stroke={FIN} strokeWidth="3" />,
  }
}

// Measuring lines for the size guide: A is the length, B is the width.
const TOP_GUIDE = { a: [208, 40, 208, 296], b: [76, 112, 224, 112] }
const GUIDES = {
  jersey: TOP_GUIDE,
  longSleeve: TOP_GUIDE,
  polo: TOP_GUIDE,
  hoodie: TOP_GUIDE,
  jacket: TOP_GUIDE,
  quarterZip: TOP_GUIDE,
  managerJacket: { a: [212, 34, 212, 288], b: [70, 128, 230, 128] },
  managerLong: { a: [212, 34, 212, 358], b: [70, 128, 230, 128] },
  vest: { a: [182, 26, 182, 298], b: [66, 124, 234, 124] },
  baseLayer: { a: [198, 38, 198, 296], b: [84, 118, 216, 118] },
  shorts: { a: [236, 36, 266, 256], b: [78, 48, 222, 48] },
  trousers: { a: [218, 20, 232, 306], b: [94, 30, 206, 30] },
  leggings: { a: [206, 20, 200, 306], b: [106, 30, 194, 30] },
  bowlsShorts: { a: [236, 30, 260, 236], b: [76, 52, 224, 52] },
  bowlsTrousers: { a: [220, 20, 232, 306], b: [92, 42, 208, 42] },
}
const GUIDE_COLOUR = '#ffd500'

function GuideLine({ points, letter, marker }) {
  const [x1, y1, x2, y2] = points
  const vertical = Math.abs(y2 - y1) > Math.abs(x2 - x1)
  // Labels sit beside the line, away from the logo in the middle.
  const cx = vertical ? (x1 + x2) / 2 + 16 : x1 + 24
  const cy = vertical ? (y1 + y2) / 2 : y1 - 14
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={GUIDE_COLOUR} strokeWidth="2.5" strokeDasharray="6 4" markerStart={`url(#${marker})`} markerEnd={`url(#${marker})`} />
      <circle cx={cx} cy={cy} r="11" fill={GUIDE_COLOUR} />
      <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="sans-serif" fill="#000">
        {letter}
      </text>
    </g>
  )
}

const SYMMETRIC = new Set(['jersey', 'longSleeve', 'polo', 'hoodie', 'jacket', 'shorts', 'trousers', 'leggings', 'quarterZip', 'managerJacket', 'managerLong', 'vest', 'baseLayer', 'bowlsShorts', 'bowlsTrousers'])

/** A drawn Mako garment. Set `guides` to show the A (length) and B (width) measuring lines. */
export default function GarmentArt({ garment = 'jersey', guides = false, className }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const g = GARMENTS[garment] ?? GARMENTS.jersey
  const mirrored = SYMMETRIC.has(garment)
  const clip = `garment-clip-${uid}`
  const shade = `garment-shade-${uid}`
  const marker = `garment-arrow-${uid}`
  const logoH = g.logo.w * LOGO_RATIO
  const lines = guides && GUIDES[garment]

  return (
    <svg viewBox="0 0 300 320" className={className} role="img" aria-label={`Mako ${g.label.toLowerCase()}${lines ? ', showing measurements A and B' : ''}`}>
      <defs>
        <clipPath id={clip}>
          <path d={g.body} />
        </clipPath>
        <linearGradient id={shade} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.35" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
        <marker id={marker} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <circle cx="5" cy="5" r="4" fill={GUIDE_COLOUR} />
        </marker>
      </defs>

      <g transform={g.zoom ? `translate(150 160) scale(${g.zoom}) translate(-150 -160)` : undefined}>
        {g.behind}
        <g clipPath={`url(#${clip})`}>
          <rect width="300" height="320" fill={INK} />
          {g.fins.map((d) => (
            <g key={d} fill={FIN}>
              <path d={d} />
              {mirrored && <path d={d} transform="translate(300 0) scale(-1 1)" />}
            </g>
          ))}
          {g.details}
          <rect width="300" height="320" fill={`url(#${shade})`} />
        </g>
        {g.trims.map((d) => (
          <path key={d} d={d} fill={WHITE} />
        ))}
        <path d={g.body} fill="none" stroke="#000" strokeOpacity="0.6" strokeWidth="1.5" />
        {g.after}
        <image href={LOGO} x={g.logo.x - g.logo.w / 2} y={g.logo.y - logoH / 2} width={g.logo.w} height={logoH} />
        {lines && (
          <>
            <GuideLine points={lines.a} letter="A" marker={marker} />
            <GuideLine points={lines.b} letter="B" marker={marker} />
          </>
        )}
      </g>
    </svg>
  )
}
