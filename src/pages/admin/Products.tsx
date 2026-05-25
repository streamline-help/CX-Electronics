import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Package,
  Tag, Percent, BadgeCheck, X as XIcon,
} from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { supabase, getProductImageUrl } from '../../lib/supabase'
import { useAdminLang } from '../../context/AdminLangContext'
import type { ProductWithCategory, StockStatus } from '../../lib/supabase'

const STOCK_LABELS: Record<StockStatus, { label: string; color: string }> = {
  in_stock:     { label: 'In Stock',     color: 'bg-green-100 text-green-700' },
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-700' },
  on_order:     { label: 'On Order',     color: 'bg-amber-100 text-amber-700' },
}

type BulkAction =
  | 'set_retail'
  | 'adjust_pct'
  | 'set_bulk'
  | 'set_min_qty'
  | 'set_stock'
  | 'set_active'
  | 'set_featured'

export function AdminProducts() {
  const { t } = useAdminLang()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [applying, setApplying] = useState(false)
  const [activeAction, setActiveAction] = useState<BulkAction | null>(null)
  const [actionValue, setActionValue] = useState('')
  const [actionStock, setActionStock] = useState<StockStatus>('in_stock')
  const [actionBool, setActionBool] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const { categories } = useCategories()
  const { products, loading, totalCount, refetch } = useProducts({
    search: debouncedSearch || undefined,
    categorySlug: categorySlug || undefined,
    page,
    pageSize,
  })

  // "All" fetches in one page (catalogue sits under Supabase's 1000-row cap)
  const VIEW_ALL = 1000

  // Debounce search
  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>)._searchTimer)
    ;(window as unknown as Record<string, ReturnType<typeof setTimeout>>)._searchTimer = setTimeout(
      () => {
        setDebouncedSearch(value)
        setPage(1)
      },
      300,
    )
  }, [])

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === products.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(products.map((p) => p.id)))
    }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  function closeAction() {
    setActiveAction(null)
    setActionValue('')
  }

  async function deleteSelected() {
    if (!selected.size) return
    if (!confirm(`Delete ${selected.size} product(s)? This cannot be undone.`)) return
    setDeleting(true)
    const { error } = await supabase.from('products').delete().in('id', [...selected])
    setDeleting(false)
    if (error) {
      showToast(`Failed: ${error.message}`)
      return
    }
    showToast(`Deleted ${selected.size} product(s)`)
    setSelected(new Set())
    refetch()
  }

  async function applyBulkAction() {
    if (!activeAction || !selected.size) return
    const ids = [...selected]
    setApplying(true)

    let payload: Record<string, unknown> = {}
    let confirmMsg = ''

    switch (activeAction) {
      case 'set_retail': {
        const v = Number(actionValue)
        if (!Number.isFinite(v) || v < 0) {
          showToast('Enter a valid price')
          setApplying(false)
          return
        }
        payload = { retail_price: v, updated_at: new Date().toISOString() }
        confirmMsg = `Set retail price = R${v.toFixed(2)} on ${ids.length} product(s)`
        break
      }
      case 'set_bulk': {
        const v = Number(actionValue)
        if (!Number.isFinite(v) || v < 0) {
          showToast('Enter a valid price')
          setApplying(false)
          return
        }
        payload = { bulk_price: v, is_bulk_available: true, updated_at: new Date().toISOString() }
        confirmMsg = `Set wholesale price = R${v.toFixed(2)} on ${ids.length} product(s)`
        break
      }
      case 'set_min_qty': {
        const v = parseInt(actionValue, 10)
        if (!Number.isFinite(v) || v < 1) {
          showToast('Enter a valid quantity')
          setApplying(false)
          return
        }
        payload = { bulk_min_qty: v, updated_at: new Date().toISOString() }
        confirmMsg = `Set min wholesale qty = ${v} on ${ids.length} product(s)`
        break
      }
      case 'set_stock': {
        payload = { stock_status: actionStock, updated_at: new Date().toISOString() }
        confirmMsg = `Set stock = ${actionStock} on ${ids.length} product(s)`
        break
      }
      case 'set_active': {
        payload = { active: actionBool, updated_at: new Date().toISOString() }
        confirmMsg = `Set ${actionBool ? 'active' : 'inactive'} on ${ids.length} product(s)`
        break
      }
      case 'set_featured': {
        payload = { featured: actionBool, updated_at: new Date().toISOString() }
        confirmMsg = `Set featured = ${actionBool ? 'yes' : 'no'} on ${ids.length} product(s)`
        break
      }
      case 'adjust_pct': {
        // Server-side percentage adjust isn't a single-row update — fetch + bulk update each
        const pct = Number(actionValue)
        if (!Number.isFinite(pct) || pct === 0) {
          showToast('Enter a valid % (e.g. -10 or 15)')
          setApplying(false)
          return
        }
        const factor = 1 + pct / 100
        const { data, error: fetchErr } = await supabase
          .from('products')
          .select('id, retail_price, bulk_price')
          .in('id', ids)
        if (fetchErr || !data) {
          showToast(`Failed: ${fetchErr?.message ?? 'fetch error'}`)
          setApplying(false)
          return
        }
        // Update one row at a time with the new computed price
        await Promise.all(data.map((row) => {
          const newRetail = Math.max(1, Math.round(row.retail_price * factor * 100) / 100)
          const newBulk = row.bulk_price
            ? Math.max(1, Math.round(row.bulk_price * factor * 100) / 100)
            : null
          return supabase
            .from('products')
            .update({
              retail_price: newRetail,
              bulk_price: newBulk,
              updated_at: new Date().toISOString(),
            })
            .eq('id', row.id)
        }))
        showToast(`Adjusted prices by ${pct > 0 ? '+' : ''}${pct}% on ${ids.length} product(s)`)
        setApplying(false)
        closeAction()
        setSelected(new Set())
        refetch()
        return
      }
    }

    const { error } = await supabase.from('products').update(payload).in('id', ids)
    setApplying(false)
    if (error) {
      showToast(`Failed: ${error.message}`)
      return
    }
    showToast(confirmMsg)
    closeAction()
    setSelected(new Set())
    refetch()
  }

  async function toggleActive(product: ProductWithCategory) {
    await supabase
      .from('products')
      .update({ active: !product.active, updated_at: new Date().toISOString() })
      .eq('id', product.id)
    refetch()
  }

  async function toggleStock(product: ProductWithCategory) {
    const next: StockStatus =
      product.stock_status === 'in_stock' ? 'out_of_stock' : 'in_stock'
    await supabase
      .from('products')
      .update({ stock_status: next, updated_at: new Date().toISOString() })
      .eq('id', product.id)
    refetch()
  }

  // Open the product when a row/card is clicked — but if the user was dragging
  // to select text (e.g. the name), leave them be and don't navigate.
  function openProduct(id: string) {
    if (window.getSelection()?.toString()) return
    navigate(`/admin/products/${id}`)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalCount)

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-2xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('productsPage')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalCount} {t('total')}</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-cxx-blue text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-cxx-blue-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('addProduct')}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`${t('search')}...`}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cxx-blue"
          />
        </div>
        <select
          value={categorySlug}
          onChange={(e) => { setCategorySlug(e.target.value); setPage(1) }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cxx-blue"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions toolbar */}
      {selected.size > 0 && (
        <div className="bg-cxx-blue-light border border-cxx-blue/20 rounded-xl mb-4 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
            <span className="text-sm text-cxx-blue font-semibold mr-1">
              {selected.size} {t('selected')}
            </span>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-xs text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mr-3"
              title="Clear selection"
            >
              <XIcon className="w-3 h-3" />
              {t('clear')}
            </button>

            <BulkBtn
              icon={Tag}
              label={t('setRetailPrice')}
              active={activeAction === 'set_retail'}
              onClick={() => { setActiveAction('set_retail'); setActionValue('') }}
            />
            <BulkBtn
              icon={Percent}
              label={t('adjustByPct')}
              active={activeAction === 'adjust_pct'}
              onClick={() => { setActiveAction('adjust_pct'); setActionValue('') }}
            />
            <BulkBtn
              icon={Tag}
              label={t('setBulkPrice')}
              active={activeAction === 'set_bulk'}
              onClick={() => { setActiveAction('set_bulk'); setActionValue('') }}
            />
            <BulkBtn
              icon={Package}
              label={t('setMinQty')}
              active={activeAction === 'set_min_qty'}
              onClick={() => { setActiveAction('set_min_qty'); setActionValue('') }}
            />
            <BulkBtn
              icon={Package}
              label={t('setStockStatus')}
              active={activeAction === 'set_stock'}
              onClick={() => setActiveAction('set_stock')}
            />
            <BulkBtn
              icon={BadgeCheck}
              label={t('setActiveStatus')}
              active={activeAction === 'set_active'}
              onClick={() => setActiveAction('set_active')}
            />
            <BulkBtn
              icon={BadgeCheck}
              label={t('setFeatured')}
              active={activeAction === 'set_featured'}
              onClick={() => setActiveAction('set_featured')}
            />

            <div className="ml-auto">
              <button
                onClick={deleteSelected}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>

          {/* Active action input row */}
          {activeAction && (
            <div className="border-t border-cxx-blue/20 bg-white px-4 py-3 flex flex-wrap items-center gap-3">
              {activeAction === 'set_retail' || activeAction === 'set_bulk' ? (
                <>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    New price (R)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      autoFocus
                      value={actionValue}
                      onChange={(e) => setActionValue(e.target.value)}
                      className="w-32 pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cxx-blue"
                      placeholder="0.00"
                    />
                  </div>
                </>
              ) : activeAction === 'adjust_pct' ? (
                <>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Adjust prices by
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      autoFocus
                      value={actionValue}
                      onChange={(e) => setActionValue(e.target.value)}
                      className="w-28 pr-7 pl-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cxx-blue"
                      placeholder="e.g. 10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Negative = discount. Both retail + wholesale are adjusted proportionally.
                  </p>
                </>
              ) : activeAction === 'set_min_qty' ? (
                <>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Min. wholesale qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    autoFocus
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                    className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cxx-blue"
                    placeholder="6"
                  />
                </>
              ) : activeAction === 'set_stock' ? (
                <>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Stock status
                  </label>
                  <select
                    value={actionStock}
                    onChange={(e) => setActionStock(e.target.value as StockStatus)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cxx-blue"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="on_order">On Order</option>
                  </select>
                </>
              ) : (
                <>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    {activeAction === 'set_active' ? 'Active state' : 'Featured state'}
                  </label>
                  <div className="inline-flex border border-gray-300 rounded-lg overflow-hidden text-sm">
                    <button
                      type="button"
                      onClick={() => setActionBool(true)}
                      className={`px-3 py-1.5 ${actionBool ? 'bg-cxx-blue text-white font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionBool(false)}
                      className={`px-3 py-1.5 ${!actionBool ? 'bg-cxx-blue text-white font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeAction}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={applyBulkAction}
                  disabled={applying}
                  className="inline-flex items-center gap-1.5 bg-cxx-blue text-white font-semibold text-sm px-4 py-1.5 rounded-lg hover:bg-cxx-blue-hover transition-colors disabled:opacity-60"
                >
                  {applying ? '...' : t('apply')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-cxx-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Package className="w-8 h-8 mb-2" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          <>
          {/* Desktop / tablet table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="pl-4 pr-2 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selected.size === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">{t('productName')}</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">{t('category')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Price</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">{t('active')}</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const stock = STOCK_LABELS[product.stock_status]
                  return (
                    <tr
                      key={product.id}
                      onClick={() => openProduct(product.id)}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="pl-4 pr-2 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.thumbnail_url ? (
                            <img
                              src={getProductImageUrl(product.thumbnail_url, 80)}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                              onError={(e) => {
                                const fallback = product.images?.[0]
                                if (fallback && e.currentTarget.src !== fallback) {
                                  e.currentTarget.src = getProductImageUrl(fallback, 80)
                                }
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                            {product.name_zh && (
                              <p className="text-xs text-gray-400 truncate">{product.name_zh}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.categories?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div>
                          <p className="font-medium text-gray-900">R{product.retail_price.toFixed(2)}</p>
                          {product.is_bulk_available && product.bulk_price && (
                            <p className="text-xs text-cxx-blue">Wholesale: R{product.bulk_price.toFixed(2)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleStock(product) }}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${stock.color}`}
                          title="Click to toggle"
                        >
                          {stock.label}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleActive(product) }}
                          className={`relative w-9 h-5 rounded-full transition-colors ${
                            product.active ? 'bg-cxx-blue' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              product.active ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-cxx-blue hover:bg-cxx-blue-light rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards — every control stays visible, no sideways scroll */}
          <div className="md:hidden divide-y divide-gray-100">
            {products.map((product) => {
              const stock = STOCK_LABELS[product.stock_status]
              return (
                <div
                  key={product.id}
                  onClick={() => openProduct(product.id)}
                  className="p-3 flex gap-3 cursor-pointer active:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1.5 rounded border-gray-300 flex-shrink-0"
                  />
                  {product.thumbnail_url ? (
                    <img
                      src={getProductImageUrl(product.thumbnail_url, 80)}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                      onError={(e) => {
                        const fallback = product.images?.[0]
                        if (fallback && e.currentTarget.src !== fallback) {
                          e.currentTarget.src = getProductImageUrl(fallback, 80)
                        }
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300">
                      <Package className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 leading-snug break-words">{product.name}</p>
                    {product.name_zh && (
                      <p className="text-xs text-gray-400 truncate">{product.name_zh}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {product.categories?.name ?? '—'} · <span className="font-semibold text-gray-900">R{product.retail_price.toFixed(2)}</span>
                      {product.is_bulk_available && product.bulk_price && (
                        <span className="text-cxx-blue"> · WS R{product.bulk_price.toFixed(2)}</span>
                      )}
                    </p>

                    <div className="flex items-center flex-wrap gap-2 mt-2.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleStock(product) }}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${stock.color}`}
                      >
                        {stock.label}
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleActive(product) }}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ${
                          product.active
                            ? 'border-cxx-blue/30 text-cxx-blue bg-cxx-blue-light'
                            : 'border-gray-200 text-gray-500 bg-gray-50'
                        }`}
                      >
                        <span
                          className={`relative w-7 h-4 rounded-full transition-colors ${
                            product.active ? 'bg-cxx-blue' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                              product.active ? 'translate-x-3' : 'translate-x-0'
                            }`}
                          />
                        </span>
                        {product.active ? t('active') : t('inactive')}
                      </button>

                      <Link
                        to={`/admin/products/${product.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors ml-auto"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        {t('edit')}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          </>
        )}

        {/* Pagination + per-page control */}
        {totalCount > 0 && (
          <div className="border-t border-gray-200 px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
              {/* Left: range + per-page selector */}
              <div className="flex items-center justify-center sm:justify-start gap-3 order-2 sm:order-1">
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {rangeStart}–{rangeEnd} of {totalCount}
                </span>
                <label className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span className="hidden md:inline">Per page</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                    className="text-sm border border-gray-300 rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-cxx-blue cursor-pointer"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={VIEW_ALL}>View all</option>
                  </select>
                </label>
              </div>

              {/* Center: prev / page / next */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 order-1 sm:order-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={pagerBtn(page <= 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span className="text-sm font-semibold text-gray-700 px-1 min-w-[5.5rem] text-center tabular-nums">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={pagerBtn(page >= totalPages)}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right: spacer keeps the pager centred on desktop */}
              <div className="hidden sm:block order-3" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Bigger, centred prev/next buttons with a subtle red treatment.
function pagerBtn(disabled: boolean): string {
  return `inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
    disabled
      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
      : 'border-[#E63939]/30 text-[#E63939] hover:bg-[#FEE9E9] hover:border-[#E63939]/60 active:bg-[#FEE9E9]'
  }`
}

function BulkBtn({
  icon: Icon, label, active, onClick,
}: {
  icon: typeof Tag; label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
        active
          ? 'bg-cxx-blue text-white border-cxx-blue'
          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}
