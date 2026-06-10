// Buying-guide / blog content. Authored in code (no CMS) — version-controlled,
// fast, and zero runtime cost. To add a post: add an entry here AND add its slug
// to BLOG_POSTS in scripts/generate-seo.mjs so it lands in the sitemap.

export interface BlogSection {
  heading?: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface BlogPost {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  eyebrow: string
  datePublished: string // ISO yyyy-mm-dd
  readMinutes: number
  intro: string[]
  sections: BlogSection[]
  related?: { label: string; to: string }[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'best-home-cctv-south-africa',
    title: 'Best Home CCTV Setup in South Africa: A 2026 Buyer’s Guide',
    metaTitle: 'Best Home CCTV Setup in South Africa (2026 Buyer’s Guide)',
    metaDescription:
      'A practical guide to choosing a home CCTV system in South Africa — camera types, how many channels you need, AHD vs IP, night vision and what it costs. From CW Electronics.',
    excerpt:
      'Camera types, how many channels you need, AHD vs IP, and what a solid home setup actually costs in South Africa.',
    eyebrow: 'Security Guide',
    datePublished: '2026-06-10',
    readMinutes: 6,
    intro: [
      'Home break-ins are a real concern across South Africa, and a visible CCTV system is one of the most cost-effective deterrents you can install. But the choice of cameras, recorders and cabling can be confusing. This guide walks you through what actually matters so you can build a setup that fits your home and budget.',
    ],
    sections: [
      {
        heading: 'How many cameras do you need?',
        paragraphs: [
          'Start by walking your property and listing the points you most want covered: the front gate, driveway, back door, and any blind spots along the boundary wall. Most homes are well covered by 4 cameras; larger properties or double-storey homes often go to 8.',
          'Recorders (DVRs/NVRs) come in 4, 8 and 16-channel versions. Buy a recorder with a little room to grow — an 8-channel unit running 4 cameras lets you add more later without replacing the recorder.',
        ],
      },
      {
        heading: 'AHD vs IP cameras — which is right?',
        paragraphs: [
          'AHD (analogue HD) systems send video over coax or pre-made power-and-video cable to a DVR. They are simple, reliable and affordable, which is why they remain the most popular choice for homes. IP systems run over network cabling to an NVR and can offer higher resolutions, but cost more and are slightly more involved to set up.',
          'For most South African households, a 1080p (2MP) AHD kit gives excellent picture quality at a sensible price.',
        ],
      },
      {
        heading: 'Don’t forget night vision and weatherproofing',
        bullets: [
          'Look for IR night vision (most bullet and turret cameras include 20m+ range).',
          'Full-colour night vision cameras give you colour images after dark, which is far more useful for identifying people and vehicles.',
          'Outdoor cameras should be IP66/IP67 rated so they survive Highveld storms.',
        ],
      },
      {
        heading: 'What you’ll need to budget for',
        paragraphs: [
          'A complete home system is more than just cameras. Plan for: the cameras themselves, a DVR/NVR with a hard drive, a power supply, pre-made CCTV cable runs, and waterproof junction boxes for the outdoor connections.',
          'Buying the kit as a bundle usually works out cheaper than piecing it together. If you run an installation business, wholesale pricing from 6 units brings the per-unit cost down further.',
        ],
      },
    ],
    related: [
      { label: 'Shop CCTV cameras & kits', to: '/category/cctv' },
      { label: 'CCTV cables & connectors', to: '/category/cables' },
    ],
  },

  {
    slug: 'solar-vs-wired-security-cameras',
    title: 'Solar vs Wired Security Cameras: Which Should You Buy?',
    metaTitle: 'Solar vs Wired Security Cameras in South Africa — Which Is Best?',
    metaDescription:
      'Solar 4G security cameras vs wired CCTV — installation, running costs, load-shedding, reliability and where each one makes sense in South Africa. A guide by CW Electronics.',
    excerpt:
      'Installation, running costs, load-shedding and reliability — where solar 4G cameras win, and where wired CCTV still makes more sense.',
    eyebrow: 'Security Guide',
    datePublished: '2026-06-10',
    readMinutes: 5,
    intro: [
      'Solar-powered 4G security cameras have become hugely popular in South Africa — and it’s easy to see why. They keep recording through load-shedding and don’t need a cabled internet connection. But they aren’t the right answer for every situation. Here’s how to decide.',
    ],
    sections: [
      {
        heading: 'Where solar 4G cameras shine',
        bullets: [
          'No mains power needed — perfect for gates, plots, farms, building sites and outbuildings.',
          'They keep working during load-shedding because the battery is charged by the sun.',
          'A 4G SIM means no reliance on home WiFi or fibre — you view footage from anywhere via the app.',
          'Fast to install: mount it, point it at the sun, insert a SIM, done.',
        ],
      },
      {
        heading: 'Where wired CCTV is still the better choice',
        paragraphs: [
          'If you want continuous 24/7 recording to a local hard drive, multiple cameras feeding one recorder, and the lowest long-term running cost, a wired AHD system is hard to beat. There’s no monthly SIM data to buy, and footage is stored on-site.',
          'Wired systems are also better suited to covering a whole house from a single DVR, where running cable to a central point is straightforward.',
        ],
      },
      {
        heading: 'A simple rule of thumb',
        paragraphs: [
          'Choose solar 4G when there’s no easy power or network at the spot you want to watch, or when you need a quick standalone camera. Choose wired CCTV when you’re covering a whole property and want everything recording to one place with no recurring data cost.',
          'Many homeowners end up with both: a wired system for the house, plus a solar 4G camera watching the gate or a far corner.',
        ],
      },
    ],
    related: [
      { label: 'Shop CCTV & solar cameras', to: '/category/cctv' },
      { label: 'See current deals', to: '/deals' },
    ],
  },

  {
    slug: '4g-lte-router-load-shedding-south-africa',
    title: 'How to Keep Your Internet On During Load-Shedding',
    metaTitle: '4G LTE Routers & Mini-UPS for Load-Shedding in South Africa',
    metaDescription:
      'Keep working through load-shedding: how to choose a 4G LTE router and a mini-UPS to keep your router and fibre ONT online. A practical guide from CW Electronics, Johannesburg.',
    excerpt:
      'How a 4G LTE router and a small mini-UPS keep you online through load-shedding — and what to look for when buying.',
    eyebrow: 'Connectivity Guide',
    datePublished: '2026-06-10',
    readMinutes: 5,
    intro: [
      'Nothing kills a work-from-home day faster than the internet dropping the moment the power goes. The good news: keeping a connection alive through load-shedding is cheap and simple once you understand the two pieces involved — a backup connection and a way to power your router.',
    ],
    sections: [
      {
        heading: '1. A 4G LTE router as backup (or main) internet',
        paragraphs: [
          'A 4G LTE router takes a normal SIM card and turns mobile data into WiFi for your home or office. Because it runs off the mobile network, it stays connected even when your fibre line or its tower loses power.',
          'A rechargeable LTE router with a built-in battery is especially handy — it keeps broadcasting WiFi for hours without any mains power at all, making it a great grab-and-go or backup unit.',
        ],
      },
      {
        heading: '2. A mini-UPS to keep your router powered',
        paragraphs: [
          'If you’re on fibre, your router and the ONT (the little box from your provider) need power to work. A mini-UPS designed for routers plugs in between the wall and your devices and switches over instantly when the power cuts — keeping you online through a 2–4 hour slot.',
          'Look for a mini-UPS with enough capacity (mAh) for your slot length and the right output ports for your router and ONT. Some even include a POE port for powering devices over network cable.',
        ],
      },
      {
        heading: 'Putting it together',
        bullets: [
          'Fibre user: add a mini-UPS to keep your existing router and ONT alive.',
          'No fibre / unreliable line: a 4G LTE router on a good data SIM as your main or backup connection.',
          'Best of both: a mini-UPS for the fibre router, plus a rechargeable 4G router for when the line itself goes down.',
        ],
      },
    ],
    related: [
      { label: 'Shop 4G routers & networking', to: '/category/routers' },
      { label: 'Browse all products', to: '/shop' },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}
