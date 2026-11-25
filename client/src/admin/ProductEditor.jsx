import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Plus, Save, Trash2 } from 'lucide-react'
import { adminApi, api } from '../api/client.js'
import { useCatalog } from '../context/CatalogContext.jsx'
import ColorPanel, { AddColorForm, MediaManager } from './ColorPanel.jsx'
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  PriceInput,
  Select,
  Spinner,
  Textarea,
  Toggle,
  useConfirm,
  useToast,
} from './ui.jsx'
import { penceToPounds, poundsToPence } from './helpers.js'

export default function ProductEditor() {
  const { id } = useParams()
  const isNew = !id
  const [product, setProduct] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isNew) return
    let alive = true
    adminApi
      .product(id)
      .then((p) => alive && setProduct(p))
      .catch((e) => alive && setError(e))
    return () => {
      alive = false
    }
  }, [id, isNew])

  if (error) {
    return (
      <div>
        <p className="text-red-400">{error.status === 404 ? 'Product not found.' : error.message}</p>
        <Link to="/admin/products" className="mt-4 inline-block text-sm text-mute hover:text-bone">
          ← Back to products
        </Link>
      </div>
    )
  }
  if (!isNew && !product) return <Spinner />

  return <Editor key={product?.id ?? 'new'} product={product} setProduct={setProduct} />
}

function Editor({ product, setProduct }) {
  const isNew = !product
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const updateColor = (color) =>
    setProduct((p) => ({ ...p, colors: p.colors.map((c) => (c.id === color.id ? color : c)) }))
  const removeColor = (colorId) => setProduct((p) => ({ ...p, colors: p.colors.filter((c) => c.id !== colorId) }))

  async function moveColor(index, dir) {
    const colors = [...product.colors]
    const j = index + dir
    if (j < 0 || j >= colors.length) return
    ;[colors[index], colors[j]] = [colors[j], colors[index]]
    const ordered = colors.map((c, i) => ({ ...c, sortOrder: i }))
    setProduct((p) => ({ ...p, colors: ordered }))
    try {
      await Promise.all([adminApi.updateColor(ordered[index].id, { sortOrder: index }), adminApi.updateColor(ordered[j].id, { sortOrder: j })])
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function deleteProduct() {
    const ok = await confirm({
      title: `Delete “${product.name}”?`,
      message: 'This removes the product with all its colours, sizes and photos. Past orders keep their details.',
    })
    if (!ok) return
    try {
      await adminApi.deleteProduct(product.id)
      toast('Product deleted')
      navigate('/admin/products')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const totalStock = product?.colors.reduce((n, c) => n + c.variants.reduce((m, v) => m + v.stock, 0), 0) ?? 0

  return (
    <>
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-mute hover:text-bone">
        <ArrowLeft size={16} /> Products
      </Link>
      <PageHeader
        title={isNew ? 'New product' : product.name}
        subtitle={isNew ? 'Start with the basics. You can add colours, sizes and photos next.' : `${product.colors.length} colour${product.colors.length === 1 ? '' : 's'} · ${totalStock} in stock`}
        actions={
          !isNew && (
            <>
              <a href={`/product/${product.slug}`} target="_blank" rel="noreferrer">
                <Button icon={ExternalLink}>View in store</Button>
              </a>
              <Button variant="danger" icon={Trash2} onClick={deleteProduct}>
                Delete
              </Button>
            </>
          )
        }
      />

      <div className="space-y-6">
        <DetailsForm
          product={product}
          onSaved={(p) => {
            if (isNew) {
              toast('Product created. Now add its colours, sizes and photos.')
              navigate(`/admin/products/${p.id}`, { replace: true })
            } else {
              setProduct(p)
              toast('Changes saved')
            }
          }}
        />

        {!isNew && (
          <>
            <div className="flex items-end justify-between gap-4 pt-4">
              <div>
                <h2 className="font-display text-3xl uppercase">Colours, sizes & photos</h2>
                <p className="mt-1 text-sm text-mute">Each colour has its own photos and its own stock for each size.</p>
              </div>
            </div>

            {product.colors.map((c, i) => (
              <ColorPanel
                key={c.id}
                product={product}
                color={c}
                index={i}
                count={product.colors.length}
                onChange={updateColor}
                onDelete={() => removeColor(c.id)}
                onMove={(dir) => moveColor(i, dir)}
              />
            ))}

            <AddColorForm product={product} onAdded={(color) => setProduct((p) => ({ ...p, colors: [...p.colors, color] }))} />

            <Card title="Product videos & extra media" description="Optional. Shown after the colour photos on every colour, e.g. a product video.">
              <MediaManager
                productId={product.id}
                colorId={null}
                media={product.media}
                onChange={(media) => setProduct((p) => ({ ...p, media }))}
              />
            </Card>
          </>
        )}
      </div>
    </>
  )
}

// ─── Name, description, category, price… ─────────────────

function toForm(p) {
  return {
    name: p?.name ?? '',
    description: p?.description ?? '',
    categoryId: p?.categoryId ?? '',
    brandId: p?.brandId ?? '',
    price: penceToPounds(p?.pricePence),
    compareAt: penceToPounds(p?.compareAtPricePence),
    slug: p?.slug ?? '',
    isActive: p?.isActive ?? true,
    isFeatured: p?.isFeatured ?? false,
  }
}

function DetailsForm({ product, onSaved }) {
  const isNew = !product
  const { allCategories, refresh: refreshCategories } = useCatalog()
  const [brands, setBrands] = useState([])
  const [form, setForm] = useState(() => toForm(product))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [newBrand, setNewBrand] = useState(null) // string while adding a brand
  const [addingBrand, setAddingBrand] = useState(false)
  const toast = useToast()

  useEffect(() => {
    api.brands().then(setBrands).catch(() => {})
  }, [])

  const original = toForm(product)
  const dirty = isNew || JSON.stringify(form) !== JSON.stringify(original)
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v?.target ? (v.target.type === 'checkbox' ? v.target.checked : v.target.value) : v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  async function addBrand() {
    const name = newBrand?.trim()
    if (!name) return setNewBrand(null)
    setAddingBrand(true)
    try {
      const b = await adminApi.createBrand({ name })
      setBrands((bs) => [...bs, b].sort((a, z) => a.name.localeCompare(z.name)))
      setForm((f) => ({ ...f, brandId: b.id }))
      setNewBrand(null)
      toast(`Brand “${b.name}” added`)
    } catch (err) {
      toast(err.status === 409 ? 'A brand with that name already exists' : err.message, 'error')
    } finally {
      setAddingBrand(false)
    }
  }

  async function save(e) {
    e.preventDefault()
    if (addingBrand || newBrand != null) return toast('Finish adding the brand first', 'error')
    const pricePence = poundsToPence(form.price)
    const compareAtPricePence = poundsToPence(form.compareAt)
    const errs = {}
    if (form.name.trim().length < 2) errs.name = 'Enter a product name'
    if (!form.categoryId) errs.categoryId = 'Choose a category'
    if (pricePence == null || Number.isNaN(pricePence)) errs.price = 'Enter a price, e.g. 24.99'
    if (Number.isNaN(compareAtPricePence)) errs.compareAt = 'Enter a price, e.g. 29.99, or leave empty'
    else if (compareAtPricePence != null && compareAtPricePence <= pricePence) errs.compareAt = 'Must be higher than the price to show as a sale'
    if (Object.keys(errs).length) return setErrors(errs)

    const body = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      categoryId: form.categoryId,
      brandId: form.brandId || null,
      pricePence,
      compareAtPricePence,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      ...(!isNew && form.slug !== original.slug && { slug: form.slug }),
    }

    setSaving(true)
    try {
      const saved = isNew ? await adminApi.createProduct(body) : await adminApi.updateProduct(product.id, body)
      setForm(toForm(saved))
      refreshCategories() // product counts may have changed
      onSaved(saved)
    } catch (err) {
      setErrors({ ...err.errors, price: err.errors?.pricePence, compareAt: err.errors?.compareAtPricePence })
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save}>
      <Card title="Details">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name" error={errors.name} className="md:col-span-2">
            <Input value={form.name} onChange={set('name')} error={errors.name} placeholder="e.g. Apex Heavyweight Hoodie" autoFocus={isNew} />
          </Field>

          <Field label="Description" hint="Shown on the product page. Line breaks are kept." className="md:col-span-2">
            <Textarea value={form.description} onChange={set('description')} placeholder="Fabric, fit, features…" />
          </Field>

          <Field label="Category" error={errors.categoryId}>
            <Select value={form.categoryId} onChange={set('categoryId')} error={errors.categoryId}>
              <option value="">Choose…</option>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Brand" hint={newBrand == null ? 'Optional' : 'Press Enter to add'}>
            {newBrand == null ? (
              <Select
                value={form.brandId}
                onChange={(e) => (e.target.value === '__new' ? setNewBrand('') : set('brandId')(e))}
              >
                <option value="">No brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
                <option value="__new">+ Add a new brand…</option>
              </Select>
            ) : (
              <div className="flex gap-2">
                <Input
                  autoFocus
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addBrand()
                    }
                    if (e.key === 'Escape') setNewBrand(null)
                  }}
                  placeholder="Brand name"
                />
                <Button type="button" variant="primary" onClick={addBrand} loading={addingBrand}>
                  Add
                </Button>
                <Button type="button" variant="ghost" onClick={() => setNewBrand(null)}>
                  Cancel
                </Button>
              </div>
            )}
          </Field>

          <Field label="Price" error={errors.price} hint="What customers pay, including VAT.">
            <PriceInput value={form.price} onChange={set('price')} error={errors.price} />
          </Field>

          <Field label="Was price (optional)" error={errors.compareAt} hint="Shown crossed out to mark the product as on sale.">
            <PriceInput value={form.compareAt} onChange={set('compareAt')} error={errors.compareAt} placeholder="" />
          </Field>

          {!isNew && (
            <Field label="Web address" hint={`${window.location.host}/product/${form.slug || '…'}`} className="md:col-span-2">
              <Input value={form.slug} onChange={set('slug')} />
            </Field>
          )}

          <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:gap-10">
            <Toggle checked={form.isActive} onChange={set('isActive')} label="Live in store" description="Turn off to hide it while you set it up." />
            <Toggle checked={form.isFeatured} onChange={set('isFeatured')} label="Featured" description="Marked as featured on the shop pages." />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-line pt-5">
          {!isNew && dirty && (
            <Button type="button" variant="ghost" onClick={() => setForm(original)}>
              Discard changes
            </Button>
          )}
          <Button type="submit" variant="primary" icon={isNew ? Plus : Save} loading={saving} disabled={!dirty || addingBrand}>
            {isNew ? 'Create product' : 'Save changes'}
          </Button>
        </div>
      </Card>
    </form>
  )
}
