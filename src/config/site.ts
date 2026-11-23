export const siteConfig = {
  name: "TRT Rent a Car",
  legalName: "Auto Garage Project BJL SRL",
  tagline: "TRT Rent a Car Cluj – Reunim familii!",
  url: "https://trtrentacar.ro",
  defaultLocale: "ro" as const,
  locales: ["ro", "en"] as const,
  address: {
    street: "Cluj-Napoca",
    locality: "Cluj-Napoca",
    region: "Cluj",
    postalCode: "400000",
    country: "RO",
  },
  geo: {
    latitude: 46.7822489,
    longitude: 23.6978928,
  },
  contact: {
    phone: "+40 743 189 218",
    phoneRaw: "40743189218",
    whatsapp: "40743189218",
    email: "rezervari@trtrentacar.ro",
  },
  company: {
    cui: "47296710",
    regCom: "J12/7252/2022",
  },
  openingHours: "Mo-Su 00:00-24:00",
  openingHoursText: "24/7",
  social: {
    facebook: "https://www.facebook.com/p/Transylvania-Rent-Tourism-61559282850657/",
    instagram: "",
    tiktok: "",
  },
  currenciesAccepted: "EUR, RON",
  paymentAccepted: "Cash, Credit Card, Debit Card",
  priceRange: "€",
  mapsUrl:
    "https://www.google.com/maps/place/Transylvania+Rent+%26+Tourism/@46.7822489,23.6978928,17z/data=!3m1!4b1!4m6!3m5!1s0x47490b6fea8a29d1:0xa1adb8e8c37ad6f9!8m2!3d46.7822489!4d23.6978928!16s%2Fg%2F11yb__2n2b",
};

export type SiteConfig = typeof siteConfig;
