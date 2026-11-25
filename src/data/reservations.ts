/** Status solicitare rezervare */
export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export interface Reservation {
  id: string;
  /** Număr rezervare afișat: TRT + 6 cifre aleatorii (ex: TRT482913) */
  reference?: string;
  status: ReservationStatus;
  /** Slug mașină selectată */
  carSlug: string;
  /** Nume mașină (la momentul rezervării) */
  carName: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  pickupLocation: string;
  returnLocation: string;
  pickupLocationName?: string;
  returnLocationName?: string;
  /** Număr zile */
  days: number;
  /** Total plătit (EUR) */
  total: number;
  /** Garanție (EUR) */
  guarantee: number;
  scdw: boolean;
  /** Opțiuni extrase: id => quantity sau true */
  extras: Record<string, number | boolean>;
  /** Nume client */
  name: string;
  email: string;
  phone: string;
  message?: string;
  flightNumber?: string;
  payment: "cash" | "card_delivery" | "bank_transfer";
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "În așteptare",
  confirmed: "Confirmată",
  cancelled: "Anulată",
};
