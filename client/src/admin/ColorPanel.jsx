import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ImagePlus, Minus, Plus, Star, Trash2, UploadCloud, X } from 'lucide-react'
import { adminApi } from '../api/client.js'
import { cldImage, cx, formatPrice } from '../lib/format.js'
import { Button, Card, Field, Input, PriceInput, useConfirm, useToast } from './ui.jsx'
import { SIZE_PRESETS, penceToPounds, poundsToPence } from './helpers.js'

const MAX_IMAGE_MB = 10
const MAX_VIDEO_MB = 100

// ─── One colour: name, swatch, photos, sizes ─────────────

export default function ColorPanel({ product, color, index, count, onChange, onDelete, onMove }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [name, setName] = useState(color.name)
  const [hex, setHex] = useState(color.hexCode || '#000000')

  async function save(changes) {
    try {
      const updated = await adminApi.updateColor(color.id, changes)
      onChange(updated)
    } catch (err) {
      toast(err.status === 409 ? 'This product already has a colour with that name' : err.message, 'error')
      setName(color.name)
    }
  }

  async function remove() {
    const ok = await confirm({
      title: `Delete the colour “${color.name}”?`,
      message: `Its ${color.variants.length} size(s) and ${color.media.length} photo(s) will be deleted too.`,
    })
    if (!ok) return
    try {
      await adminApi.deleteColor(color.id)
      onDelete()
      toast(`${color.name} deleted`)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const stock = color.variants.reduce((n, v) => n + v.stock, 0)

  return (
    <Card>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-line transition hover:border-bone/50" title="Pick the swatch colour">
          <span className="absolute inset-0" style={{ background: hex }} />
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            onBlur={() => hex !== color.hexCode && save({ hexCode: hex })}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Swatch colour"
          />
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && name.trim() !== color.name && save({ name: name.trim() })}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="max-w-xs text-base font-bold"
          aria-label="Colour name"
        />
        <span className="text-sm text-mute">{stock} in stock</span>
        <div className="ml-auto flex gap-1">
          <Button size="sm" variant="ghost" icon={ArrowUp} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move colour up" />
          <Button size="sm" variant="ghost" icon={ArrowDown} disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move colour down" />
          <Button size="sm" variant="danger" icon={Trash2} onClick={remove}>
            Delete colour
          </Button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-mute">Photos</h3>
          <MediaManager productId={product.id} colorId={color.id} media={color.media} onChange={(media) => onChange({ ...color, media })} />
        </div>
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-mute">Sizes & stock</h3>
          <SizesTable product={product} color={color} onChange={(variants) => onChange({ ...color, variants })} />
        </div>
      </div>
    </Card>
  )
}

// ─── Photos / videos with upload, reorder, delete ────────

export function MediaManager({ productId, colorId, media, onChange }) {
  const toast = useToast()
  const confirm = useConfirm()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(null) // 0..1 while uploading

  async function upload(fileList) {
    const files = [...fileList]
    if (!files.length) return
    const bad = files.find((f) => !/^(image|video)\//.test(f.type))
    if (bad) return toast(`${bad.name} isn't an image or video`, 'error')
    const tooBig = files.find((f) => f.size > (f.type.startsWith('video') ? MAX_VIDEO_MB : MAX_IMAGE_MB) * 1024 * 1024)
    if (tooBig) return toast(`${tooBig.name} is too large (max ${MAX_IMAGE_MB} MB for images, ${MAX_VIDEO_MB} MB for videos)`, 'error')

    setProgress(0)
    try {
      // Upload in batches of 10 (the server's limit per request).
      let all = [...media]
      for (let i = 0; i < files.length; i += 10) {
        const batch = files.slice(i, i + 10)
        const added = await adminApi.uploadMedia(productId, batch, {
          colorId,
          onProgress: (p) => setProgress((i + p * batch.length) / files.length),
        })
        all = [...all, ...added]
        onChange(all)
      }
      toast(`${files.length} file${files.length === 1 ? '' : 's'} uploaded`)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function move(index, dir) {
    const j = index + dir
    if (j < 0 || j >= media.length) return
    const next = [...media]
    ;[next[index], next[j]] = [next[j], next[index]]
    const ordered = next.map((m, i) => ({ ...m, sortOrder: i }))
    onChange(ordered)
    try {
      await Promise.all(ordered.filter((m, i) => media[i]?.id !== m.id).map((m) => adminApi.updateMedia(m.id, { sortOrder: m.sortOrder })))
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function makeMain(index) {
    const next = [media[index], ...media.filter((_, i) => i !== index)].map((m, i) => ({ ...m, sortOrder: i }))
    onChange(next)
    try {
      await Promise.all(next.map((m) => adminApi.updateMedia(m.id, { sortOrder: m.sortOrder })))
      toast('Main photo updated')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function remove(m) {
    const ok = await confirm({ title: `Delete this ${m.type === 'VIDEO' ? 'video' : 'photo'}?`, message: 'It will also be removed from Cloudinary.' })
    if (!ok) return
    try {
      await adminApi.deleteMedia(m.id)
      onChange(media.filter((x) => x.id !== m.id))
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div>
      {media.length > 0 && (
        <ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          <AnimatePresence initial={false}>
            {media.map((m, i) => (
              <motion.li
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-steel"
              >
                {m.type === 'VIDEO' ? (
                  <video src={m.url} muted playsInline className="h-full w-full object-cover" />
                ) : (
                  <img src={cldImage(m.url, 300)} alt={m.altText || ''} className="h-full w-full object-cover" />
                )}
                {i === 0 && colorId && <span className="absolute left-1.5 top-1.5 rounded-md bg-blaze px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-ink">Main</span>}
                {m.type === 'VIDEO' && <span className="absolute left-1.5 top-1.5 rounded-md bg-ink/80 px-1.5 py-0.5 text-[10px] font-extrabold uppercase">Video</span>}

                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-linear-to-t from-ink/90 to-transparent p-1.5 pt-6 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                  <div className="flex gap-0.5">
                    <MediaBtn label="Move left" disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowLeft size={14} />
                    </MediaBtn>
                    <MediaBtn label="Move right" disabled={i === media.length - 1} onClick={() => move(i, 1)}>
                      <ArrowRight size={14} />
                    </MediaBtn>
                  </div>
                  <div className="flex gap-0.5">
                    {i > 0 && colorId && (
                      <MediaBtn label="Make main photo" onClick={() => makeMain(i)}>
                        <Star size={14} />
                      </MediaBtn>
                    )}
                    <MediaBtn label="Delete" onClick={() => remove(m)} danger>
                      <X size={14} />
                    </MediaBtn>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          upload(e.dataTransfer.files)
        }}
        disabled={progress != null}
        className={cx(
          'relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
          dragging ? 'border-blaze bg-blaze/10' : 'border-line hover:border-bone/40 hover:bg-bone/[0.02]',
        )}
      >
        {progress != null ? (
          <>
            <UploadCloud className="animate-bounce text-blaze" />
            <span className="text-sm font-bold">Uploading… {Math.round(progress * 100)}%</span>
            <span className="absolute inset-x-0 bottom-0 h-1 bg-line">
              <motion.span className="block h-full bg-blaze" animate={{ width: `${progress * 100}%` }} />
            </span>
          </>
        ) : (
          <>
            <ImagePlus className={dragging ? 'text-blaze' : 'text-mute'} />
            <span className="text-sm font-bold">{dragging ? 'Drop to upload' : 'Drag photos here or click to choose'}</span>
            <span className="text-xs text-mute">
              JPG, PNG, WebP or video · up to {MAX_IMAGE_MB} MB per photo, {MAX_VIDEO_MB} MB per video
            </span>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/quicktime" hidden onChange={(e) => upload(e.target.files)} />
    </div>
  )
}

function MediaBtn({ children, label, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cx('grid h-7 w-7 place-items-center rounded-md bg-ink/80 transition-colors disabled:opacity-30', danger ? 'hover:bg-red-500 hover:text-ink' : 'hover:bg-bone hover:text-ink')}
    >
      {children}
    </button>
  )
}

// ─── Sizes with stock, price override and SKU ───────────

function SizesTable({ product, color, onChange }) {
  const toast = useToast()
  const [newSize, setNewSize] = useState('')
  const [busy, setBusy] = useState(false)
  const variants = color.variants

  async function addSizes(sizes) {
    const existing = new Set(variants.map((v) => v.size.toLowerCase()))
    const toAdd = sizes.map((s) => s.trim()).filter((s) => s && !existing.has(s.toLowerCase()))
    if (!toAdd.length) return toast('Those sizes are already added', 'error')
    setBusy(true)
    let all = [...variants]
    try {
      for (const size of toAdd) {
        const v = await adminApi.addVariant(color.id, { size, stock: 0 })
        all = [...all, v]
        onChange(all)
      }
      setNewSize('')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const replace = (v) => onChange(variants.map((x) => (x.id === v.id ? v : x)))
  const removeRow = (id) => onChange(variants.filter((x) => x.id !== id))

  return (
    <div>
      {variants.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[460px] text-sm">
            <thead className="bg-steel/50 text-[11px] uppercase tracking-widest text-mute">
              <tr>
                <th className="px-3 py-2 text-left font-bold">Size</th>
                <th className="px-3 py-2 text-left font-bold">Stock</th>
                <th className="px-3 py-2 text-left font-bold" title="Leave empty to use the product price">
                  Price
                </th>
                <th className="px-3 py-2 text-left font-bold">SKU</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <AnimatePresence initial={false}>
                {variants.map((v) => (
                  <VariantRow key={v.id} variant={v} productPrice={product.pricePence} onSaved={replace} onDeleted={() => removeRow(v.id)} />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-mute">No sizes yet. Add some below.</p>
      )}

      <div className="mt-3 flex gap-2">
        <Input
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addSizes(newSize.split(','))
            }
          }}
          placeholder="Add size, e.g. M (or M, L, XL)"
          aria-label="New size"
        />
        <Button type="button" icon={Plus} loading={busy} onClick={() => addSizes(newSize.split(','))} disabled={!newSize.trim()}>
          Add
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-mute">Quick add:</span>
        {SIZE_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            disabled={busy}
            onClick={() => addSizes(p.sizes)}
            className="rounded-full border border-line px-2.5 py-1 text-xs font-bold text-bone/80 transition hover:border-blaze hover:text-bone disabled:opacity-40"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function VariantRow({ variant, productPrice, onSaved, onDeleted }) {
  const toast = useToast()
  const [stock, setStock] = useState(String(variant.stock))
  const [price, setPrice] = useState(penceToPounds(variant.pricePence))
  const [sku, setSku] = useState(variant.sku)
  const [size, setSize] = useState(variant.size)
  const [flash, setFlash] = useState(false)

  async function save(changes) {
    try {
      const v = await adminApi.updateVariant(variant.id, changes)
      onSaved({ ...variant, ...v })
      setStock(String(v.stock))
      setFlash(true)
      setTimeout(() => setFlash(false), 700)
    } catch (err) {
      toast(err.status === 409 ? 'That size or SKU is already used' : err.message, 'error')
      setStock(String(variant.stock))
      setPrice(penceToPounds(variant.pricePence))
      setSku(variant.sku)
      setSize(variant.size)
    }
  }

  function commitStock(value = stock) {
    const n = Number.parseInt(value, 10)
    if (Number.isNaN(n) || n < 0) return setStock(String(variant.stock))
    if (n !== variant.stock) save({ stock: n })
  }

  function commitPrice() {
    const p = poundsToPence(price)
    if (Number.isNaN(p)) return setPrice(penceToPounds(variant.pricePence))
    if (p !== variant.pricePence) save({ pricePence: p })
  }

  async function remove() {
    try {
      await adminApi.deleteVariant(variant.id)
      onDeleted()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const blurOnEnter = (e) => e.key === 'Enter' && e.currentTarget.blur()
  const cell = 'h-9 rounded-lg border border-transparent bg-transparent px-2 outline-none transition-colors hover:border-line focus:border-blaze focus:bg-ink'

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backgroundColor: flash ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0)' }}
      exit={{ opacity: 0 }}
    >
      <td className="px-1.5 py-1">
        <input value={size} onChange={(e) => setSize(e.target.value)} onBlur={() => size.trim() && size.trim() !== variant.size && save({ size: size.trim() })} onKeyDown={blurOnEnter} className={cx(cell, 'w-24 font-bold')} aria-label="Size" />
      </td>
      <td className="px-1.5 py-1">
        <div className="flex items-center">
          <button type="button" onClick={() => variant.stock > 0 && save({ stockChange: -1 })} className="grid h-8 w-7 place-items-center rounded-md text-mute hover:bg-bone/10 hover:text-bone" aria-label="One less">
            <Minus size={13} />
          </button>
          <input
            value={stock}
            inputMode="numeric"
            onChange={(e) => setStock(e.target.value.replace(/\D/g, ''))}
            onBlur={() => commitStock()}
            onKeyDown={blurOnEnter}
            className={cx(cell, 'w-14 text-center tabular-nums', variant.stock === 0 && 'text-red-400', variant.stock > 0 && variant.stock <= 5 && 'text-amber-400')}
            aria-label="Stock"
          />
          <button type="button" onClick={() => save({ stockChange: 1 })} className="grid h-8 w-7 place-items-center rounded-md text-mute hover:bg-bone/10 hover:text-bone" aria-label="One more">
            <Plus size={13} />
          </button>
        </div>
      </td>
      <td className="px-1.5 py-1">
        <div className="w-24">
          <PriceInput value={price} onChange={setPrice} onBlur={commitPrice} onKeyDown={blurOnEnter} placeholder={formatPrice(productPrice).slice(1)} className="h-9 border-transparent bg-transparent py-1 hover:border-line" aria-label="Price for this size" />
        </div>
      </td>
      <td className="px-1.5 py-1">
        <input value={sku} onChange={(e) => setSku(e.target.value)} onBlur={() => sku.trim() && sku.trim() !== variant.sku && save({ sku: sku.trim() })} onKeyDown={blurOnEnter} className={cx(cell, 'w-full min-w-36 font-mono text-xs text-mute')} aria-label="SKU" />
      </td>
      <td className="px-1.5 py-1 text-right">
        <button type="button" onClick={remove} className="grid h-8 w-8 place-items-center rounded-md text-mute hover:bg-red-500/15 hover:text-red-400" aria-label={`Delete size ${variant.size}`}>
          <Trash2 size={14} />
        </button>
      </td>
    </motion.tr>
  )
}

// ─── Add a colour ────────────────────────────────────────

export function AddColorForm({ product, onAdded }) {
  const toast = useToast()
  const [open, setOpen] = useState(product.colors.length === 0)
  const [name, setName] = useState('')
  const [hex, setHex] = useState('#0b0b0c')
  const [sizes, setSizes] = useState(() => product.colors[0]?.variants.map((v) => v.size) ?? [])
  const [saving, setSaving] = useState(false)

  const sourceSizes = product.colors[0]?.variants.map((v) => v.size)

  async function add(e) {
    e.preventDefault()
    if (!name.trim()) return toast('Enter a colour name', 'error')
    setSaving(true)
    try {
      const color = await adminApi.addColor(product.id, {
        name: name.trim(),
        hexCode: hex,
        variants: sizes.map((size) => ({ size, stock: 0 })),
      })
      onAdded(color)
      toast(`${color.name} added. Now upload its photos and set the stock.`)
      setName('')
      setOpen(false)
    } catch (err) {
      toast(err.status === 409 ? 'This product already has a colour with that name' : err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-6 text-sm font-bold text-mute transition hover:border-blaze hover:text-bone"
      >
        <Plus size={18} /> Add a colour
      </button>
    )
  }

  return (
    <form onSubmit={add}>
      <Card title={product.colors.length ? 'Add a colour' : 'Add the first colour'} description="Even single-colour products need one colour, e.g. “Black”.">
        <div className="grid gap-5 md:grid-cols-[auto_1fr]">
          <Field label="Swatch">
            <label className="relative block h-11 w-16 cursor-pointer overflow-hidden rounded-xl border-2 border-line">
              <span className="absolute inset-0" style={{ background: hex }} />
              <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Swatch colour" />
            </label>
          </Field>
          <Field label="Colour name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Black" autoFocus />
          </Field>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-mute">Sizes (stock starts at 0)</p>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-steel py-1 pl-3 pr-1.5 text-xs font-bold">
                {s}
                <button type="button" onClick={() => setSizes((all) => all.filter((x) => x !== s))} className="rounded-full p-0.5 hover:bg-bone/10" aria-label={`Remove ${s}`}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {!sizes.length && <span className="text-sm text-mute">None yet. Pick a preset:</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {sourceSizes?.length > 0 && (
              <PresetBtn onClick={() => setSizes(sourceSizes)}>Same as {product.colors[0].name}</PresetBtn>
            )}
            {SIZE_PRESETS.map((p) => (
              <PresetBtn key={p.label} onClick={() => setSizes(p.sizes)}>
                {p.label}
              </PresetBtn>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-line pt-5">
          {product.colors.length > 0 && (
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary" icon={Plus} loading={saving}>
            Add colour
          </Button>
        </div>
      </Card>
    </form>
  )
}

function PresetBtn({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full border border-line px-3 py-1 text-xs font-bold text-bone/80 transition hover:border-blaze hover:text-bone">
      {children}
    </button>
  )
}
