import { useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import { KitAsk, KitClosing, KitPicker, KitReasons } from '../components/KitDesignerIntro.jsx'
import { cx } from '../lib/format.js'
import { useSeo } from '../hooks/useSeo.js'

const STORAGE_KEY = 'mako-kit-designs'
const MAX_LOGO_BYTES = 5 * 1024 * 1024
const MAX_LOGO_SIDE = 500

const topBody = (neck) =>
  `M140 40 C160 ${neck} 240 ${neck} 260 40 L318 62 L388 150 L338 190 L306 150 L306 410 Q200 422 94 410 L94 150 L62 190 L12 150 L82 62 Z`
const vestBody = (neck) =>
  `M130 40 L160 40 C165 ${neck} 235 ${neck} 240 40 L270 40 C272 90 290 130 318 150 L312 410 Q200 422 88 410 L82 150 C110 130 128 90 130 40 Z`
const SHORTS_BODY = 'M80 60 H320 L362 340 H228 L200 190 L172 340 H38 Z'
const CUFFS = ['M12 150 L62 190 L70 180 L21 139 Z', 'M388 150 L338 190 L330 180 L379 139 Z']
const CREW_BACK = 'M140 40 C160 52 240 52 260 40 L270 44 C245 66 155 66 130 44 Z'
const TOP_LAYOUT = { logoY: 140, numberY: 255, initials: [262, 385], nameY: 125, backNumberY: 265 }

const GARMENTS = {
  football: {
    label: 'Football shirt',
    front: topBody(72),
    back: topBody(52),
    trimFront: ['M140 40 C160 72 240 72 260 40 L270 44 C245 88 155 88 130 44 Z', ...CUFFS],
    trimBack: [CREW_BACK, ...CUFFS],
    layout: TOP_LAYOUT,
  },
  rugby: {
    label: 'Rugby shirt',
    front: topBody(88),
    back: topBody(52),
    trimFront: ['M132 42 L196 116 L150 130 L112 54 Z', 'M268 42 L204 116 L250 130 L288 54 Z', 'M192 104 H208 V182 H192 Z', ...CUFFS],
    trimBack: [CREW_BACK, ...CUFFS],
    layout: { ...TOP_LAYOUT, logoY: 165 },
  },
  polo: {
    label: 'Training polo',
    front: topBody(88),
    back: topBody(52),
    trimFront: ['M140 40 L196 104 L160 116 L122 50 Z', 'M260 40 L204 104 L240 116 L278 50 Z', 'M193 96 H207 V170 H193 Z', ...CUFFS],
    trimBack: [CREW_BACK, ...CUFFS],
    layout: { ...TOP_LAYOUT, logoY: 160 },
  },
  vest: {
    label: 'Running vest',
    front: vestBody(95),
    back: vestBody(72),
    trimFront: [
      'M160 40 C165 95 235 95 240 40 L250 40 C246 112 154 112 150 40 Z',
      'M130 40 C128 90 110 130 82 150 L92 158 C120 136 140 96 142 40 Z',
      'M270 40 C272 90 290 130 318 150 L308 158 C280 136 260 96 258 40 Z',
    ],
    trimBack: [
      'M160 40 C165 72 235 72 240 40 L250 40 C246 90 154 90 150 40 Z',
      'M130 40 C128 90 110 130 82 150 L92 158 C120 136 140 96 142 40 Z',
      'M270 40 C272 90 290 130 318 150 L308 158 C280 136 260 96 258 40 Z',
    ],
    layout: { ...TOP_LAYOUT, logoY: 165, numberY: 275, nameY: 145, backNumberY: 280 },
  },
  shorts: {
    label: 'Shorts',
    front: SHORTS_BODY,
    back: SHORTS_BODY,
    trimFront: ['M80 60 H320 L323 84 H77 Z', 'M41 318 H174 L172 340 H38 Z', 'M226 318 H359 L362 340 H228 Z'],
    trimBack: ['M80 60 H320 L323 84 H77 Z', 'M41 318 H174 L172 340 H38 Z', 'M226 318 H359 L362 340 H228 Z'],
    layout: { logoY: 125, numberY: 285, numberX: 112, initials: [288, 295], nameY: 125, backNumberY: 215 },
  },
}

const PATTERNS = [
  ['solid', 'Solid'],
  ['stripes', 'Stripes'],
  ['hoops', 'Hoops'],
  ['halves', 'Halves'],
  ['quarters', 'Quarters'],
  ['sash', 'Sash'],
  ['chevron', 'Chevron'],
  ['panels', 'Side panels'],
]

const PALETTE = ['#070708', '#ffffff', '#8e939b', '#22e4f6', '#0b3d91', '#1e88e5', '#0f7b3f', '#7ac943', '#ffd500', '#ff8a00', '#d71920', '#7a1230', '#5b2a86', '#ec4899']

const FONTS = [
  ['Anton, Impact, sans-serif', 'Block'],
  ['Manrope, Arial, sans-serif', 'Modern'],
  ['Georgia, serif', 'Classic'],
  ['"Courier New", monospace', 'Varsity'],
]

const LOGO_PLACES = [
  ['right', "Wearer's right"],
  ['center', 'Centre'],
  ['left', "Wearer's left"],
]

const TABS = ['Item', 'Style', 'Colours', 'Logo', 'Text', 'My designs']

const DEFAULT_DESIGN = {
  garment: 'football',
  pattern: 'stripes',
  primary: '#070708',
  secondary: '#22e4f6',
  trim: '#ffffff',
  textColor: '#ffffff',
  font: FONTS[0][0],
  name: '',
  number: '',
  initials: '',
  logo: null,
  logoPlace: 'left',
  logoSize: 56,
}

function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

// Shrinks uploads so saved designs fit in browser storage.
function resizeLogo(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_LOGO_SIDE / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That image could not be read.'))
    }
    img.src = url
  })
}

function svgToImage(svg) {
  const copy = svg.cloneNode(true)
  copy.setAttribute('width', '1000')
  copy.setAttribute('height', '1100')
  const source = new XMLSerializer().serializeToString(copy)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image export failed.'))
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`
  })
}

function PatternShapes({ pattern, color, mirrored }) {
  const shapes = {
    solid: null,
    stripes: Array.from({ length: 5 }, (_, i) => <rect key={i} x={20 + i * 80} y="0" width="40" height="440" />),
    hoops: Array.from({ length: 6 }, (_, i) => <rect key={i} x="0" y={40 + i * 76} width="400" height="38" />),
    halves: <rect x="200" y="0" width="200" height="440" />,
    quarters: (
      <>
        <rect x="200" y="0" width="200" height="225" />
        <rect x="0" y="225" width="200" height="215" />
      </>
    ),
    sash: <polygon points="280,0 360,0 120,440 40,440" />,
    chevron: <polygon points="0,110 200,270 400,110 400,180 200,340 0,180" />,
    panels: (
      <>
        <rect x="0" y="0" width="132" height="440" />
        <rect x="268" y="0" width="132" height="440" />
      </>
    ),
  }
  return (
    <g fill={color} transform={mirrored ? 'translate(400 0) scale(-1 1)' : undefined}>
      {shapes[pattern]}
    </g>
  )
}

function KitFace({ design, side, svgRef }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const garment = GARMENTS[design.garment]
  const body = garment[side]
  const trims = side === 'front' ? garment.trimFront : garment.trimBack
  const { layout } = garment
  const clipId = `kit-clip-${uid}`
  const shadeId = `kit-shade-${uid}`
  const logoX = { left: 262, center: 200, right: 138 }[design.logoPlace]
  const textProps = { fill: design.textColor, fontFamily: design.font, textAnchor: 'middle', fontWeight: 700 }

  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" className="h-full w-full" role="img" aria-label={`${garment.label}, ${side}`}>
      <defs>
        <clipPath id={clipId}>
          <path d={body} />
        </clipPath>
        <linearGradient id={shadeId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.3" />
          <stop offset="0.28" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect width="400" height="440" fill={design.primary} />
        <PatternShapes pattern={design.pattern} color={design.secondary} mirrored={side === 'back'} />
        {trims.map((d) => (
          <path key={d} d={d} fill={design.trim} />
        ))}
        <rect width="400" height="440" fill={`url(#${shadeId})`} />
      </g>
      {side === 'front' && design.garment !== 'vest' && design.garment !== 'shorts' &&
        trims.slice(0, -2).map((d) => <path key={`collar-${d}`} d={d} fill={design.trim} />)}
      <path d={body} fill="none" stroke="#f4f1ea" strokeOpacity="0.32" strokeWidth="1.5" />

      {side === 'front' ? (
        <>
          {design.logo && (
            <image
              href={design.logo}
              x={logoX - design.logoSize / 2}
              y={layout.logoY - design.logoSize / 2}
              width={design.logoSize}
              height={design.logoSize}
              preserveAspectRatio="xMidYMid meet"
            />
          )}
          {design.number && (
            <text x={layout.numberX ?? 200} y={layout.numberY} fontSize="62" {...textProps}>
              {design.number}
            </text>
          )}
          {design.initials && (
            <text x={layout.initials[0]} y={layout.initials[1]} fontSize="20" {...textProps}>
              {design.initials}
            </text>
          )}
        </>
      ) : (
        <>
          {design.name && (
            <text x="200" y={layout.nameY} fontSize="30" letterSpacing="2" {...textProps}>
              {design.name}
            </text>
          )}
          {design.number && (
            <text x="200" y={layout.backNumberY} fontSize="120" {...textProps}>
              {design.number}
            </text>
          )}
        </>
      )}
    </svg>
  )
}

function ColourPicker({ label, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-bold">{label}</legend>
      <div className="flex flex-wrap items-center gap-2">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={`${label}: ${c}`}
            aria-pressed={value === c}
            style={{ backgroundColor: c }}
            className={cx('h-8 w-8 rounded-full border border-bone/30 transition-transform hover:scale-110', value === c && 'ring-2 ring-blaze ring-offset-2 ring-offset-coal')}
          />
        ))}
        <label className="ml-1 flex items-center gap-2 text-xs font-semibold text-mute">
          Custom
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-9 cursor-pointer rounded border border-line bg-transparent" />
        </label>
      </div>
    </fieldset>
  )
}

function OptionButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx('rounded-xl border px-4 py-3 text-sm font-bold transition-colors', active ? 'border-blaze bg-blaze text-ink' : 'border-line bg-ink hover:border-blaze')}
    >
      {children}
    </button>
  )
}

export default function KitDesigner() {
  useSeo({ title: 'Kit Designer', description: 'Design your own sports kit with Mako Sports. Choose a style and colours, then add your logo, names, numbers and initials.' })

  const [design, setDesign] = useState(DEFAULT_DESIGN)
  const [tab, setTab] = useState('Item')
  const [angle, setAngle] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [title, setTitle] = useState('')
  const [saved, setSaved] = useState(readSaved)
  const [notice, setNotice] = useState(null)
  const dragStart = useRef(null)
  const frontRef = useRef(null)
  const backRef = useRef(null)

  const showingBack = Math.abs(Math.round(angle / 180)) % 2 === 1
  const update = (patch) => setDesign((d) => ({ ...d, ...patch }))

  function persist(next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setSaved(next)
      return true
    } catch {
      setNotice({ error: true, text: 'Your browser storage is full. Delete a saved design and try again.' })
      return false
    }
  }

  function saveDesign() {
    const entry = {
      id: crypto.randomUUID(),
      title: title.trim() || `${GARMENTS[design.garment].label} design`,
      savedAt: new Date().toISOString(),
      design,
    }
    if (persist([entry, ...saved])) {
      setTitle('')
      setNotice({ text: `Saved "${entry.title}" on this device.` })
    }
  }

  async function handleLogo(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setNotice({ error: true, text: 'Please upload a PNG, JPG or WebP image.' })
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      setNotice({ error: true, text: 'Please upload an image under 5 MB.' })
      return
    }
    try {
      update({ logo: await resizeLogo(file) })
      setAngle(0)
      setNotice(null)
    } catch (err) {
      setNotice({ error: true, text: err.message })
    }
  }

  async function downloadDesign() {
    try {
      const [front, back] = await Promise.all([svgToImage(frontRef.current), svgToImage(backRef.current)])
      const canvas = document.createElement('canvas')
      canvas.width = 2000
      canvas.height = 1100
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#0e0f11'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(front, 0, 0, 1000, 1100)
      ctx.drawImage(back, 1000, 0, 1000, 1100)
      const link = document.createElement('a')
      link.download = 'mako-kit-design.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      setNotice({ text: 'Your design image has been downloaded.' })
    } catch {
      setNotice({ error: true, text: 'The image could not be created. Please try again.' })
    }
  }

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = { x: e.clientX, angle }
    setDragging(true)
  }

  function onPointerMove(e) {
    if (dragStart.current) setAngle(dragStart.current.angle + (e.clientX - dragStart.current.x) * 0.6)
  }

  function onPointerUp() {
    dragStart.current = null
    setDragging(false)
    setAngle((a) => Math.round(a / 180) * 180)
  }

  // A tile on the landing grid: load that item into the designer and bring it into view.
  function chooseItem(item) {
    update({ garment: item.design })
    setAngle(0)
    setTab('Style')
    setNotice({ text: `${item.label}: now choose a style and colours.` })
    document.getElementById('designer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="pt-16 md:pt-24">
      <nav aria-label="Breadcrumb" className="container-x pb-4 pt-6 text-xs font-bold uppercase tracking-widest text-mute">
        <Link to="/" className="hover:text-bone">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-bone">Kit Designer</span>
      </nav>

      <header className="container-x">
        <h1 className="font-display text-5xl uppercase leading-none md:text-7xl">
          3D Kit <span className="text-blaze">Designer</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-bone/80">Pick your colours, then add your logo, numbers, names and initials in a few simple steps.</p>
        <p className="mt-1 max-w-2xl text-bone/70">Choose your sport or team wear item below and start designing your kit today.</p>
      </header>

      <div className="container-x py-10">
        <KitPicker onChoose={chooseItem} />
      </div>

      <section id="designer" className="container-x scroll-mt-24 pb-16 pt-4" aria-labelledby="designer-title">
      <h2 id="designer-title" className="font-display text-3xl uppercase md:text-4xl">
        Design your <span className="text-blaze">{GARMENTS[design.garment].label.toLowerCase()}</span>
      </h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-label="Kit preview">
          <div className="rounded-2xl border border-line bg-steel p-4 lg:sticky lg:top-24">
            <div
              className={cx('mx-auto aspect-[400/440] max-h-[68vh] w-full max-w-xl touch-pan-y select-none', dragging ? 'cursor-grabbing' : 'cursor-grab')}
              style={{ perspective: 1200 }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div
                className={cx('relative h-full w-full', !dragging && 'transition-transform duration-700 ease-out-expo')}
                style={{ transform: `rotateY(${angle}deg)`, transformStyle: 'preserve-3d' }}
              >
                <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                  <KitFace design={design} side="front" svgRef={frontRef} />
                </div>
                <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <KitFace design={design} side="back" svgRef={backRef} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <OptionButton active={!showingBack} onClick={() => setAngle(0)}>Front</OptionButton>
              <OptionButton active={showingBack} onClick={() => setAngle(180)}>Back</OptionButton>
              <span className="w-full text-center text-xs text-mute sm:ml-2 sm:w-auto">Drag the kit to turn it</span>
            </div>
          </div>
        </section>

        <section className="min-w-0 lg:col-span-5" aria-label="Design options">
          <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-line bg-coal p-1" role="tablist">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cx('shrink-0 rounded-lg px-3 py-2 text-sm font-bold transition-colors', tab === t ? 'bg-blaze text-ink' : 'text-bone/75 hover:text-bone')}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-6 rounded-2xl border border-line bg-coal p-5" role="tabpanel" aria-label={tab}>
            {tab === 'Item' && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(GARMENTS).map(([key, g]) => (
                  <OptionButton key={key} active={design.garment === key} onClick={() => update({ garment: key })}>
                    {g.label}
                  </OptionButton>
                ))}
              </div>
            )}

            {tab === 'Style' && (
              <div className="grid grid-cols-2 gap-2">
                {PATTERNS.map(([key, label]) => (
                  <OptionButton key={key} active={design.pattern === key} onClick={() => update({ pattern: key })}>
                    {label}
                  </OptionButton>
                ))}
              </div>
            )}

            {tab === 'Colours' && (
              <>
                <ColourPicker label="Main colour" value={design.primary} onChange={(primary) => update({ primary })} />
                <ColourPicker label="Pattern colour" value={design.secondary} onChange={(secondary) => update({ secondary })} />
                <ColourPicker label="Collar and trim" value={design.trim} onChange={(trim) => update({ trim })} />
              </>
            )}

            {tab === 'Logo' && (
              <>
                <label className="btn btn-primary w-full cursor-pointer">
                  <Upload size={16} />
                  <span>{design.logo ? 'Replace logo' : 'Upload logo'}</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogo} className="sr-only" />
                </label>
                <p className="text-xs text-mute">PNG, JPG or WebP, up to 5 MB. Only upload a logo you have the right to use.</p>
                {design.logo && (
                  <>
                    <div>
                      <p className="mb-3 text-sm font-bold">Position</p>
                      <div className="grid grid-cols-3 gap-2">
                        {LOGO_PLACES.map(([key, label]) => (
                          <OptionButton key={key} active={design.logoPlace === key} onClick={() => update({ logoPlace: key })}>
                            {label}
                          </OptionButton>
                        ))}
                      </div>
                    </div>
                    <label className="block text-sm font-bold">
                      Size
                      <input type="range" min="28" max="120" value={design.logoSize} onChange={(e) => update({ logoSize: Number(e.target.value) })} className="mt-3 w-full accent-[var(--color-blaze)]" />
                    </label>
                    <button type="button" onClick={() => update({ logo: null })} className="inline-flex items-center gap-2 text-sm font-bold text-mute hover:text-bone">
                      <Trash2 size={15} /> Remove logo
                    </button>
                  </>
                )}
              </>
            )}

            {tab === 'Text' && (
              <>
                <label className="block text-sm font-bold">
                  Name (back)
                  <input className="input mt-2" maxLength={12} value={design.name} onFocus={() => setAngle(180)} onChange={(e) => update({ name: e.target.value.toUpperCase() })} placeholder="e.g. TAYLOR" />
                </label>
                <label className="block text-sm font-bold">
                  Number (front and back)
                  <input className="input mt-2" inputMode="numeric" maxLength={2} value={design.number} onChange={(e) => update({ number: e.target.value.replace(/\D/g, '') })} placeholder="e.g. 10" />
                </label>
                <label className="block text-sm font-bold">
                  Initials (front)
                  <input className="input mt-2" maxLength={3} value={design.initials} onFocus={() => setAngle(0)} onChange={(e) => update({ initials: e.target.value.toUpperCase() })} placeholder="e.g. JT" />
                </label>
                <div>
                  <p className="mb-3 text-sm font-bold">Font</p>
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS.map(([value, label]) => (
                      <OptionButton key={value} active={design.font === value} onClick={() => update({ font: value })}>
                        <span style={{ fontFamily: value }}>{label}</span>
                      </OptionButton>
                    ))}
                  </div>
                </div>
                <ColourPicker label="Text colour" value={design.textColor} onChange={(textColor) => update({ textColor })} />
              </>
            )}

            {tab === 'My designs' && (
              <>
                <div className="flex gap-2">
                  <input className="input" maxLength={40} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name this design" aria-label="Design name" />
                  <button type="button" onClick={saveDesign} className="grid w-14 shrink-0 place-items-center rounded-xl bg-blaze text-ink hover:bg-blaze-dark" aria-label="Save design">
                    <Save size={18} />
                  </button>
                </div>
                <p className="text-xs text-mute">Designs are saved in this browser, on this device only.</p>
                {saved.length === 0 ? (
                  <p className="text-sm text-mute">No saved designs yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {saved.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-ink px-4 py-3">
                        <button
                          type="button"
                          className="min-w-0 truncate text-left text-sm font-bold hover:text-blaze"
                          onClick={() => {
                            setDesign({ ...DEFAULT_DESIGN, ...s.design })
                            setNotice({ text: `Loaded "${s.title}".` })
                          }}
                        >
                          {s.title}
                        </button>
                        <button type="button" onClick={() => persist(saved.filter((x) => x.id !== s.id))} className="shrink-0 text-mute hover:text-red-400" aria-label={`Delete ${s.title}`}>
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          {notice && (
            <p role="status" className={cx('mt-3 text-sm font-semibold', notice.error ? 'text-red-400' : 'text-blaze')}>
              {notice.text}
            </p>
          )}

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={downloadDesign} className="btn btn-primary">
              <Download size={16} />
              <span>Download</span>
            </button>
            <Link to="/contact" className="btn btn-ghost">
              <span>Get a quote</span>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => {
              setDesign(DEFAULT_DESIGN)
              setAngle(0)
              setNotice(null)
            }}
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-mute hover:text-bone"
          >
            <RotateCcw size={15} /> Start again
          </button>
        </section>
      </div>
      </section>

      <KitReasons />
      <KitAsk />
      <KitClosing />
    </div>
  )
}
