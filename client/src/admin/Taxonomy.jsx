import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { adminApi, api } from '../api/client.js'
import { useCatalog } from '../context/CatalogContext.jsx'
import { Button, Card, Input, PageHeader, Spinner, useConfirm, useToast } from './ui.jsx'

export default function Taxonomy() {
  const { allCategories, refresh } = useCatalog()
  const [brands, setBrands] = useState(null)
  const toast = useToast()

  const loadBrands = () => api.brands().then(setBrands).catch((e) => toast(e.message, 'error'))
  useEffect(() => {
    loadBrands()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function moveCategory(index, dir) {
    const list = [...allCategories]
    const j = index + dir
    if (j < 0 || j >= list.length) return
    ;[list[index], list[j]] = [list[j], list[index]]
    try {
      await Promise.all(list.map((c, i) => (c.sortOrder !== i ? adminApi.updateCategory(c.id, { sortOrder: i }) : null)))
      await refresh()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <>
      <PageHeader title="Categories & brands" subtitle="Categories appear in the store menu in the order shown here." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Categories">
          <NameList
            items={allCategories}
            noun="category"
            onCreate={(name) => adminApi.createCategory({ name, sortOrder: allCategories.length })}
            onRename={(item, name) => adminApi.updateCategory(item.id, { name })}
            onDelete={(item) => adminApi.deleteCategory(item.id)}
            deleteMessage={(c) => (c.productCount ? `“${c.name}” still has products. Move or delete them first.` : 'This cannot be undone.')}
            onMove={moveCategory}
            afterChange={refresh}
          />
        </Card>

        <Card title="Brands">
          {brands == null ? (
            <Spinner />
          ) : (
            <NameList
              items={brands}
              noun="brand"
              onCreate={(name) => adminApi.createBrand({ name })}
              onRename={(item, name) => adminApi.updateBrand(item.id, { name })}
              onDelete={(item) => adminApi.deleteBrand(item.id)}
              deleteMessage={(b) => (b.productCount ? `Its ${b.productCount} product(s) will be kept, just without a brand.` : 'This cannot be undone.')}
              afterChange={loadBrands}
            />
          )}
        </Card>
      </div>
    </>
  )
}

function NameList({ items, noun, onCreate, onRename, onDelete, deleteMessage, onMove, afterChange }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [newName, setNewName] = useState('')
  const [editing, setEditing] = useState(null) // { id, name }
  const [busy, setBusy] = useState(false)

  async function run(fn, success) {
    setBusy(true)
    try {
      await fn()
      await afterChange()
      if (success) toast(success)
      return true
    } catch (err) {
      toast(err.status === 409 && !err.message.includes('still') ? `A ${noun} with that name already exists` : err.message, 'error')
      return false
    } finally {
      setBusy(false)
    }
  }

  async function create(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    if (await run(() => onCreate(name), `“${name}” added`)) setNewName('')
  }

  async function rename(e) {
    e.preventDefault()
    const item = items.find((i) => i.id === editing.id)
    const name = editing.name.trim()
    if (!name || name === item.name) return setEditing(null)
    if (await run(() => onRename(item, name), 'Renamed')) setEditing(null)
  }

  async function remove(item) {
    const ok = await confirm({ title: `Delete the ${noun} “${item.name}”?`, message: deleteMessage(item) })
    if (ok) run(() => onDelete(item), `“${item.name}” deleted`)
  }

  return (
    <div>
      <ul className="divide-y divide-line">
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <motion.li key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 py-2.5">
              {editing?.id === item.id ? (
                <form onSubmit={rename} className="flex flex-1 gap-2">
                  <Input autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} onKeyDown={(e) => e.key === 'Escape' && setEditing(null)} />
                  <Button type="submit" size="sm" variant="primary" icon={Check} loading={busy} aria-label="Save" />
                  <Button type="button" size="sm" variant="ghost" icon={X} onClick={() => setEditing(null)} aria-label="Cancel" />
                </form>
              ) : (
                <>
                  <span className="flex-1 truncate font-bold">{item.name}</span>
                  <span className="text-xs text-mute">
                    {item.productCount} product{item.productCount === 1 ? '' : 's'}
                  </span>
                  {onMove && (
                    <>
                      <Button size="sm" variant="ghost" icon={ArrowUp} disabled={i === 0 || busy} onClick={() => onMove(i, -1)} aria-label="Move up" />
                      <Button size="sm" variant="ghost" icon={ArrowDown} disabled={i === items.length - 1 || busy} onClick={() => onMove(i, 1)} aria-label="Move down" />
                    </>
                  )}
                  <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditing({ id: item.id, name: item.name })} aria-label={`Rename ${item.name}`} />
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => remove(item)} aria-label={`Delete ${item.name}`} className="hover:text-red-400" />
                </>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
        {items.length === 0 && <li className="py-4 text-sm text-mute">No {noun === 'category' ? 'categories' : 'brands'} yet.</li>}
      </ul>

      <form onSubmit={create} className="mt-4 flex gap-2 border-t border-line pt-4">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={`New ${noun} name`} aria-label={`New ${noun} name`} />
        <Button type="submit" variant="primary" icon={Plus} loading={busy} disabled={!newName.trim()}>
          Add
        </Button>
      </form>
    </div>
  )
}
