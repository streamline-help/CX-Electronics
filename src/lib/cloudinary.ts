// Cloudinary unsigned upload for admin product images.
//
// New product images uploaded from the admin panel go to this Cloudinary
// account. The returned secure_url (a full https link) is stored directly in
// the product's `images` array — `getProductImageUrl()` passes full URLs
// through unchanged, so older Supabase Storage paths and previously imported
// Cloudinary URLs keep working untouched.
//
// Only the cloud name + unsigned upload preset are used here. The Cloudinary
// API secret must NEVER appear in frontend code — unsigned uploads don't need it.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'oiuiyrdu'
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'cw_products'

export async function uploadToCloudinary(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Cloudinary upload failed (${res.status}): ${detail}`)
  }

  const data = (await res.json()) as { secure_url: string }
  return data.secure_url
}
