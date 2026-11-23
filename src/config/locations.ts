export interface LocationOption {
  id: string;
  name: string;
  fee: number;
}

export const pickupLocations: LocationOption[] = [
  { id: "cluj-napoca", name: "Cluj-Napoca", fee: 0 },
  { id: "aeroport-cluj", name: "Aeroport Cluj-Napoca", fee: 0 },
];
