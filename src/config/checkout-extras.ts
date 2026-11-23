/** Opțiuni extra pentru rezervare – preț per zi în EUR */
export interface CheckoutExtraOption {
  id: string;
  label: string;
  pricePerDay: number;
  /** Afișează selector de cantitate (ex. scaun copil x2) */
  hasQuantity?: boolean;
}

export const checkoutExtras: CheckoutExtraOption[] = [
  { id: "scaun-scoica-0-1", label: "Scaun copil scoică 0–1 ani", pricePerDay: 3, hasQuantity: true },
  { id: "scaun-copil-1-3", label: "Scaun copil 1–3 ani", pricePerDay: 2, hasQuantity: true },
  { id: "scaun-booster-3-7", label: "Scaun copil booster 3–7 ani", pricePerDay: 1, hasQuantity: true },
  { id: "lanturi-zapada", label: "Lanțuri zăpadă", pricePerDay: 3 },
];
