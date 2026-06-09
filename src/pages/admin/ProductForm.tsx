import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, X, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, getProductImageUrl } from '../../lib/supabase'
import { uploadToCloudinary } from '../../lib/cloudinary'
import { useCategories } from '../../hooks/useCategories'
import { useAdminLang } from '../../context/AdminLangContext'
import type { StockStatus, Variant, ProductVariantGroup, SpecSection } from '../../lib/supabase'

interface FormState {
  name: string
  name_zh: string
  slug: string
  description: string
  description_zh: string
  category_id: string
  brand: string
  gtin: string
  mpn: string
  retail_price: string
  is_bulk_available: boolean
  bulk_price: string
  bulk_min_qty: string
  active: boolean
  featured: boolean
  stock_status: StockStatus
  images: string[]
  imageUrls: string[]
  variants: Variant[]
  specifications: SpecSection[]
  variant_group_id: string
  variant_label: string
}

const INITIAL: FormState = {
  name: '', name_zh: '', slug: '', description: '', description_zh: '',
  category_id: '', brand: '', gtin: '', mpn: '', retail_price: '', is_bulk_available: false,
  bulk_price: '', bulk_min_qty: '', active: true, featured: false,
  stock_status: 'in_stock', images: [], imageUrls: [], variants: [],
  specifications: [], variant_group_id: '', variant_label: '',
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { categories } = useCategories()
  const { t } = useAdminLang()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [variantGroups, setVariantGroups] = useState<ProductVariantGroup[]>([])

  // Fetch variant groups for the dropdown
  useEffect(() => {
    supabase
      .from('product_variant_groups')
      .select('id, name, slug, created_at')
      .order('name')
      .then(({ data }) => setVariantGroups((data as ProductVariantGroup[]) ?? []))
  }, [])

  useEffect(() => {
    if (!id) return

    async function load() {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, name_zh, slug, description, description_zh, category_id, brand, gtin, mpn, retail_price, is_bulk_available, bulk_price, bulk_min_qty, active, featured, stock_status, images, thumbnail_url, variants, specifications, variant_group_id, variant_label')
        .eq('id', id)
        .single()

      if (error || !data) {
        navigate('/admin/products')
        return
      }

      const images: string[] = data.images ?? []
      // Use shared helper so external URLs (Cloudinary etc.) and Supabase Storage paths both work
      const imageUrls = images.map((path) => getProductImageUrl(path, 400))

      setForm({
        name: data.name ?? '',
        name_zh: data.name_zh ?? '',
        slug: data.slug ?? '',
        description: data.description ?? '',
        description_zh: data.description_zh ?? '',
        category_id: data.category_id ?? '',
        brand: data.brand ?? '',
        gtin: data.gtin ?? '',
        mpn: data.mpn ?? '',
        retail_price: String(data.retail_price ?? ''),
        is_bulk_available: data.is_bulk_available ?? false,
        bulk_price: data.bulk_price ? String(data.bulk_price) : '',
        bulk_min_qty: data.bulk_min_qty ? String(data.bulk_min_qty) : '',
        active: data.active ?? true,
        featured: data.featured ?? false,
        stock_status: (data.stock_status as StockStatus) ?? 'in_stock',
        images,
        imageUrls,
        variants: (data.variants as Variant[]) ?? [],
        specifications: (data.specifications as SpecSection[]) ?? [],
        variant_group_id: data.variant_group_id ?? '',
        variant_label: data.variant_label ?? '',
      })
      setLoading(false)
    }

    load()
  }, [id, navigate])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'name' && !isEdit ? { slug: slugify(value as string) } : {}),
    }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  // ── Image upload ──────────────────────────────────────────────────────────

  async function uploadImages(files: File[]) {
    if (!files.length) return
    setUploading(true)

    // New images upload to Cloudinary. We store the returned full https URL in
    // both `images` (saved to the DB) and `imageUrls` (display) — getProductImageUrl
    // passes full URLs through unchanged, so old images keep working too.
    const newUrls: string[] = []
    let failed = 0

    for (const file of files) {
      try {
        newUrls.push(await uploadToCloudinary(file))
      } catch (err) {
        console.error('Image upload failed', err)
        failed++
      }
    }

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...newUrls],
      imageUrls: [...prev.imageUrls, ...newUrls],
    }))
    setUploading(false)

    if (failed > 0) {
      alert(`${failed} image${failed > 1 ? 's' : ''} failed to upload. Please try again.`)
    }
  }

  function removeImage(index: number) {
    const next = form.imageUrls.length - 1
    setActiveImage((prev) => (prev >= next ? Math.max(0, next - 1) : prev))
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }))
  }

  function setCover(index: number) {
    setForm((prev) => {
      const images = [...prev.images]
      const imageUrls = [...prev.imageUrls]
      const [imgPath] = images.splice(index, 1)
      const [imgUrl] = imageUrls.splice(index, 1)
      images.unshift(imgPath)
      imageUrls.unshift(imgUrl)
      return { ...prev, images, imageUrls }
    })
    setActiveImage(0)
  }

  // ── Variants ──────────────────────────────────────────────────────────────

  function addVariant() {
    set('variants', [...form.variants, { name: '', options: [] }])
  }

  function updateVariantName(index: number, name: string) {
    const next = form.variants.map((v, i) => (i === index ? { ...v, name } : v))
    set('variants', next)
  }

  function updateVariantOptions(index: number, raw: string) {
    const options = raw.split(',').map((s) => s.trim()).filter(Boolean)
    const next = form.variants.map((v, i) => (i === index ? { ...v, options } : v))
    set('variants', next)
  }

  function removeVariant(index: number) {
    set('variants', form.variants.filter((_, i) => i !== index))
  }

  // ── Specifications ──────────────────────────────────────────────────────────
  // Stored as SpecSection[] = [{ title, items: [{ label, value }] }] — the exact
  // shape the storefront's <ProductSpecifications> accordion renders.

  function addSpecSection() {
    set('specifications', [...form.specifications, { title: '', items: [{ label: '', value: '' }] }])
  }

  function updateSpecTitle(si: number, title: string) {
    set('specifications', form.specifications.map((s, i) => (i === si ? { ...s, title } : s)))
  }

  function removeSpecSection(si: number) {
    set('specifications', form.specifications.filter((_, i) => i !== si))
  }

  function addSpecItem(si: number) {
    set('specifications', form.specifications.map((s, i) =>
      i === si ? { ...s, items: [...s.items, { label: '', value: '' }] } : s))
  }

  function updateSpecItem(si: number, ii: number, field: 'label' | 'value', value: string) {
    set('specifications', form.specifications.map((s, i) =>
      i === si
        ? { ...s, items: s.items.map((it, j) => (j === ii ? { ...it, [field]: value } : it)) }
        : s))
  }

  function removeSpecItem(si: number, ii: number) {
    set('specifications', form.specifications.map((s, i) =>
      i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s))
  }

  // ── Validation + submit ───────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) errs.name = 'Product name is required'
    if (!form.slug.trim()) errs.slug = 'Slug is required'
    if (!form.retail_price || isNaN(Number(form.retail_price))) errs.retail_price = 'Valid retail price required'
    if (form.is_bulk_available) {
      if (!form.bulk_price || isNaN(Number(form.bulk_price))) errs.bulk_price = 'Bulk price required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      name_zh: null,
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      description_zh: null,
      category_id: form.category_id || null,
      brand: form.brand.trim() || null,
      gtin: form.gtin.trim() || null,
      mpn: form.mpn.trim() || null,
      retail_price: Number(form.retail_price),
      is_bulk_available: form.is_bulk_available,
      bulk_price: form.is_bulk_available && form.bulk_price ? Number(form.bulk_price) : null,
      bulk_min_qty: form.is_bulk_available ? 6 : null,
      active: form.active,
      featured: form.featured,
      stock_status: form.stock_status,
      images: form.images,
      thumbnail_url: form.images[0] ?? null,
      variants: form.variants.filter((v) => v.name.trim() && v.options.length > 0),
      specifications: form.specifications
        .map((s) => ({
          title: s.title.trim(),
          items: s.items
            .map((it) => ({ label: it.label.trim(), value: it.value.trim() }))
            .filter((it) => it.label || it.value),
        }))
        .filter((s) => s.title && s.items.length > 0),
      variant_group_id: form.variant_group_id || null,
      variant_label: form.variant_group_id && form.variant_label.trim() ? form.variant_label.trim() : null,
      updated_at: new Date().toISOString(),
    }

    const { error } = isEdit
      ? await supabase.from('products').update(payload).eq('id', id!)
      : await supabase.from('products').insert({ ...payload, created_at: new Date().toISOString() })

    setSaving(false)

    if (error) {
      if (error.message.includes('slug')) setErrors({ slug: 'This slug is already in use' })
      return
    }

    navigate('/admin/products')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-cxx-blue" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? t('editProduct') : t('addProduct')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Basic info ─────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">{t('basicInfo')}</h2>

          <Field label={t('productName')} error={errors.name} required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={input(errors.name)}
              placeholder="e.g. USB-C 65W Fast Charger"
            />
          </Field>

          <Field label="URL Slug" error={errors.slug} required>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set('slug', slugify(e.target.value))}
              className={input(errors.slug)}
              placeholder="usb-c-65w-fast-charger"
            />
            <p className="text-xs text-gray-400 mt-1">shop/{form.slug}</p>
          </Field>

          <Field label={t('category')}>
            <select
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
              className={input()}
            >
              <option value="">— {t('category')} —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label={t('brand')}>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              className={input()}
              placeholder="Hikvision, TP-Link, CJ…"
            />
            <p className="text-xs text-gray-400 mt-1">Used in Google Shopping feed &amp; product structured data.</p>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('gtin')}>
              <input
                type="text"
                value={form.gtin}
                onChange={(e) => set('gtin', e.target.value)}
                className={input()}
                placeholder="EAN / UPC barcode"
              />
            </Field>
            <Field label={t('mpn')}>
              <input
                type="text"
                value={form.mpn}
                onChange={(e) => set('mpn', e.target.value)}
                className={input()}
                placeholder="Manufacturer part no."
              />
            </Field>
          </div>

          <Field label={t('description')}>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              className={input()}
              placeholder="Describe the product — features, specs, compatibility..."
            />
          </Field>
        </section>

        {/* ── Images ─────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">{t('images')}</h2>

          {/* Active image preview */}
          {form.imageUrls.length > 0 && (
            <div className="relative aspect-square w-full max-w-xs mx-auto bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={form.imageUrls[activeImage]}
                  alt="Preview"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full object-contain p-4"
                />
              </AnimatePresence>
              {activeImage === 0 && (
                <span className="absolute top-2 left-2 bg-cxx-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Cover
                </span>
              )}
            </div>
          )}

          {/* Thumbnail strip */}
          {form.imageUrls.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {form.imageUrls.map((url, i) => (
                <div key={i} className="relative group w-16 h-16 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`w-full h-full rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? 'border-cxx-blue ring-2 ring-cxx-blue/20'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  </button>

                  {/* Set as cover */}
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => setCover(i)}
                      title="Set as cover"
                      className="absolute -bottom-1 -left-1 w-5 h-5 bg-cxx-blue text-white rounded-full text-[9px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ★
                    </button>
                  )}

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              uploadImages([...e.dataTransfer.files].filter((f) => f.type.startsWith('image/')))
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-cxx-blue bg-blue-50' : 'border-gray-300 hover:border-cxx-blue'
            }`}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-cxx-blue mx-auto mb-1.5" />
            ) : (
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
            )}
            <p className="text-sm text-gray-500">
              {uploading ? 'Uploading...' : 'Drop images here or click to upload'}
            </p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · max 5MB each</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => uploadImages([...(e.target.files ?? [])])}
          />

          <p className="text-xs text-gray-400">First image is the cover. Hover a thumbnail and click ★ to change it.</p>
        </section>

        {/* ── Pricing ────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">{t('pricing')}</h2>

          <Field label={`${t('retailPrice')} (R)`} error={errors.retail_price} required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.retail_price}
                onChange={(e) => set('retail_price', e.target.value)}
                className={`${input(errors.retail_price)} pl-7`}
                placeholder="0.00"
              />
            </div>
          </Field>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Wholesale Available 可批发</p>
              <p className="text-xs text-gray-400">Unlock wholesale pricing for buyers ordering in volume (min 6 units)</p>
            </div>
            <button
              type="button"
              onClick={() => set('is_bulk_available', !form.is_bulk_available)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.is_bulk_available ? 'bg-cxx-blue' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.is_bulk_available ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {form.is_bulk_available && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Field label={`${t('bulkPrice')} (R)`} error={errors.bulk_price} required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.bulk_price}
                    onChange={(e) => set('bulk_price', e.target.value)}
                    className={`${input(errors.bulk_price)} pl-7`}
                    placeholder="0.00"
                  />
                </div>
              </Field>
              <Field label={t('minQty')}>
                <input
                  type="number"
                  value={6}
                  readOnly
                  disabled
                  className={`${input()} bg-gray-100 cursor-not-allowed text-gray-500`}
                />
                <p className="text-xs text-gray-400 mt-1">Fixed at 6 units site-wide</p>
              </Field>
            </div>
          )}
        </section>

        {/* ── Variants ───────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">{t('variants')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">e.g. Color, Size, Weight — shown as selectors on the product page</p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1.5 text-sm font-medium text-cxx-blue hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Variant
            </button>
          </div>

          {form.variants.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
              No variants yet — click "Add Variant" to add options like Color or Size
            </p>
          )}

          <div className="space-y-3">
            {form.variants.map((variant, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Variant Type</label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariantName(i, e.target.value)}
                      className={input()}
                      placeholder="e.g. Color, Size, Weight"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Options (comma-separated)</label>
                    <input
                      type="text"
                      value={variant.options.join(', ')}
                      onChange={(e) => updateVariantOptions(i, e.target.value)}
                      className={input()}
                      placeholder="e.g. Black, White, Red"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="mt-5 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {form.variants.some((v) => v.options.length > 0) && (
            <div className="text-xs text-gray-400 space-y-1">
              {form.variants.filter((v) => v.name && v.options.length > 0).map((v, i) => (
                <p key={i}>
                  <span className="font-medium text-gray-600">{v.name}:</span>{' '}
                  {v.options.map((opt) => (
                    <span key={opt} className="inline-block bg-gray-200 text-gray-700 text-[11px] px-1.5 py-0.5 rounded mr-1">{opt}</span>
                  ))}
                </p>
              ))}
            </div>
          )}
        </section>

        {/* ── Specifications ─────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Specifications</h2>
              <p className="text-xs text-gray-400 mt-0.5">Grouped product info — shown in the "Specifications" tab on the product page</p>
            </div>
            <button
              type="button"
              onClick={addSpecSection}
              className="flex items-center gap-1.5 text-sm font-medium text-cxx-blue hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>

          {form.specifications.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
              No specifications yet — click "Add Section" (e.g. "General", "Dimensions") then add label/value rows
            </p>
          )}

          <div className="space-y-4">
            {form.specifications.map((section, si) => (
              <div key={si} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSpecTitle(si, e.target.value)}
                    className={`${input()} font-semibold`}
                    placeholder="Section title — e.g. General, Power, Dimensions"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecSection(si)}
                    title="Remove section"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {section.items.map((item, ii) => (
                    <div key={ii} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateSpecItem(si, ii, 'label', e.target.value)}
                        className={`${input()} flex-1`}
                        placeholder="Label — e.g. Resolution"
                      />
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => updateSpecItem(si, ii, 'value', e.target.value)}
                        className={`${input()} flex-1`}
                        placeholder="Value — e.g. 1080p"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecItem(si, ii)}
                        title="Remove row"
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addSpecItem(si)}
                  className="flex items-center gap-1.5 text-xs font-medium text-cxx-blue hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Row
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Variant Group (optional) ────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900">Variant Group</h2>
            <p className="text-xs text-gray-400 mt-0.5">Optional — link this product to a group so it appears alongside colour/size variants on one page</p>
          </div>

          <Field label="Variant Group">
            <select
              value={form.variant_group_id}
              onChange={(e) => set('variant_group_id', e.target.value)}
              className={input()}
            >
              <option value="">— None (standalone product) —</option>
              {variantGroups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </Field>

          {form.variant_group_id && (
            <Field label="Variant Label">
              <input
                type="text"
                value={form.variant_label}
                onChange={(e) => set('variant_label', e.target.value)}
                className={input()}
                placeholder="e.g. Black, Pink, 3.5 inch, Set of 4"
              />
              <p className="text-xs text-gray-400 mt-1">Shown on the variant selector button</p>
            </Field>
          )}
        </section>

        {/* ── Status ─────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">{t('status')}</h2>

          <Field label={t('stockStatus')}>
            <select
              value={form.stock_status}
              onChange={(e) => set('stock_status', e.target.value as StockStatus)}
              className={input()}
            >
              <option value="in_stock">{t('inStock')}</option>
              <option value="out_of_stock">{t('outOfStock')}</option>
              <option value="on_order">{t('onOrder')}</option>
            </select>
          </Field>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set('active', e.target.checked)}
                className="rounded border-gray-300 text-cxx-blue focus:ring-cxx-blue"
              />
              <span className="text-sm font-medium text-gray-700">{t('active')} ({t('visibleInStore')})</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="rounded border-gray-300 text-cxx-blue focus:ring-cxx-blue"
              />
              <span className="text-sm font-medium text-gray-700">{t('featured')} ({t('showOnHome')})</span>
            </label>
          </div>
        </section>

        {/* ── Submit ─────────────────────────────────────── */}
        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 bg-cxx-blue hover:bg-cxx-blue-hover text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? t('saving') : t('saveProduct')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function input(error?: string): string {
  return `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cxx-blue focus:border-transparent transition-colors ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`
}
