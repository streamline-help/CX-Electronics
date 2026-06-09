// Single source of truth for CW Electronics business identity.
// Used by SEO, structured data, compliance pages and the product feed.
// Edit values here once instead of hunting through Footer/Checkout/index.html.

export const siteConfig = {
  // Public-facing brand + site
  url: 'https://cw-electronics.co.za',
  name: 'CW Electronics',

  // Legal entity (for POPIA / CPA compliance pages, invoices, gateway KYC)
  legalEntity: 'Swiftop Trading (Pty) Ltd',
  tradingAs: 'CW Electronics',
  // TODO: fill in once confirmed — used on Privacy/Terms/Returns pages.
  registrationNumber: '<<REG_NO>>',

  // Contact
  email: 'info@cw-electronics.co.za',
  phones: {
    emily: { label: 'Emily', display: '064 953 3333', href: '+27649533333' },
    kevin: { label: 'Kevin', display: '062 805 8899', href: '+27628058899' },
  },
  whatsapp: '27649533333', // no leading +

  // Physical address (storefront / showroom)
  address: {
    line1: 'Unit 303, China Cash and Carry',
    line2: 'Cnr Discovery Drive & Renaissance Blvd',
    suburb: 'Crown Mines',
    city: 'Johannesburg',
    postalCode: '2092',
    province: 'Gauteng',
    country: 'South Africa',
  },

  // Trading hours — open every day
  hours: {
    days: 'Mon – Sun',
    open: '09:00',
    close: '15:00',
    display: 'Mon – Sun, 09:00 – 15:00',
  },

  // Information Officer for POPIA (defaults to shared inbox until appointed)
  informationOfficer: {
    name: 'The Information Officer',
    email: 'info@cw-electronics.co.za',
  },
} as const

/** "Unit 303, China Cash and Carry, Cnr Discovery Drive & Renaissance Blvd, Crown Mines, Johannesburg, 2092" */
export const fullAddress = [
  siteConfig.address.line1,
  siteConfig.address.line2,
  siteConfig.address.suburb,
  siteConfig.address.city,
  siteConfig.address.postalCode,
].join(', ')

/** "Swiftop Trading (Pty) Ltd t/a CW Electronics" */
export const legalName = `${siteConfig.legalEntity} t/a ${siteConfig.tradingAs}`
