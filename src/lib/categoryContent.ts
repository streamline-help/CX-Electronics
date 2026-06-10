// Unique, indexable copy for each category landing page (/category/:slug).
// This is the on-page content Google ranks — keep it accurate and specific to
// what CW Electronics actually stocks. No invented stats or claims.

export interface CategoryContent {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  h1: string
  intro: string[]
  /** Optional visible FAQ (also helps long-tail search). */
  faqs?: { q: string; a: string }[]
}

const SHOWROOM = 'China Cash and Carry, Crown Mines, Johannesburg'

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  cctv: {
    metaTitle: 'CCTV Cameras & Security Camera Systems in Johannesburg',
    metaDescription:
      'Buy CCTV cameras, AHD recording kits, DVR systems and solar 4G security cameras in Johannesburg. Retail & wholesale prices, nationwide delivery from CW Electronics.',
    eyebrow: 'Surveillance & Security',
    h1: 'CCTV Cameras & Security Systems',
    intro: [
      'Protect your home, shop or site with our range of CCTV cameras and complete security recording systems. We stock 2MP analogue bullet cameras, HiLook by Hikvision turret cameras, full 4-, 8- and 16-channel AHD/DVR kits, solar-powered 4G cameras, and the cables, power supplies and junction boxes that go with them.',
      `As a direct importer based at ${SHOWROOM}, CW Electronics sells to homeowners, installers and resellers — at retail, or at wholesale pricing from 6 units. Collect in-store or get it delivered anywhere in South Africa.`,
    ],
    faqs: [
      {
        q: 'Do you sell complete CCTV kits or just cameras?',
        a: 'Both. We stock standalone cameras as well as complete AHD/DVR recording kits (4, 8 and 16 channel) with everything you need to record and view footage on your phone.',
      },
      {
        q: 'Can I get wholesale pricing on CCTV for my installation business?',
        a: 'Yes — wholesale pricing kicks in from 6 units per product line. Contact us on WhatsApp for a bulk quote.',
      },
    ],
  },

  routers: {
    metaTitle: '4G LTE Routers & WiFi Networking in Johannesburg',
    metaDescription:
      'Shop 4G LTE routers, portable WiFi, range extenders and mini UPS for routers. Retail & wholesale networking gear with nationwide delivery from CW Electronics, Johannesburg.',
    eyebrow: 'Networking & Connectivity',
    h1: '4G LTE Routers & WiFi Networking',
    intro: [
      'Stay connected with our range of routers and networking gear — rechargeable LTE CPE 4G wireless routers, portable WiFi units, WiFi range extenders, and mini UPS units that keep your router and ONT online during load-shedding.',
      `Whether you need one router for home or a batch for resale, CW Electronics has retail and wholesale (6+ unit) pricing. Buy at our ${SHOWROOM} showroom or order online for delivery across South Africa.`,
    ],
  },

  cables: {
    metaTitle: 'CCTV, Power & Video Cables in Johannesburg',
    metaDescription:
      'Buy CCTV power & video cables, DC splitter cables, HDMI/VGA splitters and connectors. Retail & wholesale, nationwide delivery from CW Electronics, Johannesburg.',
    eyebrow: 'Cables & Connectors',
    h1: 'Cables, Splitters & Connectors',
    intro: [
      'Find the right cable for the job — pre-made CCTV power-and-video cables in 10m to 50m lengths, DC power splitter cables, HDMI and VGA splitters, and a range of connectors and adapters.',
      `CW Electronics imports directly, so you get fair retail prices and proper wholesale rates from 6 units. Collect at ${SHOWROOM} or have it shipped nationwide.`,
    ],
  },

  accessories: {
    metaTitle: 'Electronics Accessories & Gadgets in Johannesburg',
    metaDescription:
      'Two-way radios, HDMI splitters, projectors, endoscopes, power supplies and more. Retail & wholesale electronics accessories with nationwide delivery from CW Electronics.',
    eyebrow: 'Gadgets & Accessories',
    h1: 'Electronics Accessories & Gadgets',
    intro: [
      'A wide mix of useful electronics and gadgets — Baofeng two-way radios and walkie-talkies, HDMI splitters, LED multimedia projectors, USB endoscopes, switching power supplies, and plenty more.',
      `New stock lands regularly as we import directly. Shop at retail or grab wholesale pricing from 6 units, at our ${SHOWROOM} showroom or delivered across South Africa.`,
    ],
  },

  household: {
    metaTitle: 'Household Electronics & Appliances in Johannesburg',
    metaDescription:
      'Vacuum sealers, heat sealers, insulated tumblers and handy household electronics. Retail & wholesale prices, nationwide delivery from CW Electronics, Johannesburg.',
    eyebrow: 'Home & Living',
    h1: 'Household Electronics & Appliances',
    intro: [
      'Practical electronics and gear for the home and small business — vacuum sealer machines, impulse heat sealers for PE & PP bags, insulated stainless-steel travel mugs and tumblers, and more.',
      `CW Electronics is a direct importer at ${SHOWROOM}. Buy single items at retail or stock up at wholesale pricing from 6 units, with delivery nationwide.`,
    ],
  },

  tools: {
    metaTitle: 'Tools & Detectors in Johannesburg',
    metaDescription:
      'Handheld metal detectors, breathalyzers, rechargeable searchlights, heat sealers and more. Retail & wholesale, nationwide delivery from CW Electronics, Johannesburg.',
    eyebrow: 'Tools & Equipment',
    h1: 'Tools, Detectors & Equipment',
    intro: [
      'Useful tools and detection gear — handheld security metal detectors, digital breathalyzers, rechargeable searchlights, impulse heat sealers and other practical equipment for security, events and small business.',
      `Imported directly and priced fairly, with wholesale rates from 6 units. Collect at ${SHOWROOM} or order for delivery across South Africa.`,
    ],
  },

  automobile: {
    metaTitle: 'Car Dash Cams & Vehicle Electronics in Johannesburg',
    metaDescription:
      'Dash cams, car DVR recorders and vehicle electronics at retail & wholesale prices. Nationwide delivery from CW Electronics, Crown Mines, Johannesburg.',
    eyebrow: 'Vehicle Electronics',
    h1: 'Car Dash Cams & Vehicle Electronics',
    intro: [
      'Keep an eye on the road with our vehicle electronics — dual-lens dash cams with night vision, car DVR recorders with navigation and speed display, and related accessories.',
      `CW Electronics imports directly, so retail prices stay sharp and wholesale (6+ units) is available for resellers. Buy at ${SHOWROOM} or delivered nationwide.`,
    ],
  },
}

/** Falls back to a sensible generic block for categories without bespoke copy. */
export function getCategoryContent(slug: string, name: string): CategoryContent {
  return (
    CATEGORY_CONTENT[slug] ?? {
      metaTitle: `${name} in Johannesburg | CW Electronics`,
      metaDescription: `Shop ${name.toLowerCase()} at CW Electronics — a direct electronics importer in Crown Mines, Johannesburg. Retail & wholesale pricing, nationwide delivery.`,
      eyebrow: 'Shop the Range',
      h1: name,
      intro: [
        `Browse our range of ${name.toLowerCase()} at CW Electronics, a direct electronics importer based at ${SHOWROOM}. Retail and wholesale pricing (from 6 units), with delivery across South Africa.`,
      ],
    }
  )
}
