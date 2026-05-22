// Single source of truth for who can access /admin.
// Add or remove emails here and both the login screen and ProtectedRoute
// will enforce it.
export const ADMIN_EMAILS = [
  'info@cw-electronics.co.za',
  'martin@cw-electronics.co.za',
]

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
