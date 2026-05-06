export interface CityData {
  /** Display name (e.g. "Lakewood Ranch") */
  name: string;
  /** URL slug (e.g. "lakewood-ranch") */
  slug: string;
  /** Nearby cities for the "Serving" line */
  nearbyCities: string[];
  /** County name */
  county: string;
}

export const cities: CityData[] = [
  {
    name: "Bradenton",
    slug: "bradenton",
    nearbyCities: ["Lakewood Ranch", "Palmetto"],
    county: "Manatee",
  },
  {
    name: "Lakewood Ranch",
    slug: "lakewood-ranch",
    nearbyCities: ["Bradenton", "Sarasota"],
    county: "Manatee",
  },
  {
    name: "Sarasota",
    slug: "sarasota",
    nearbyCities: ["Bradenton", "Lakewood Ranch"],
    county: "Sarasota",
  },
  {
    name: "Tampa",
    slug: "tampa",
    nearbyCities: ["Clearwater", "St. Petersburg"],
    county: "Hillsborough",
  },
  {
    name: "Clearwater",
    slug: "clearwater",
    nearbyCities: ["Tampa", "St. Petersburg"],
    county: "Pinellas",
  },
  {
    name: "St. Petersburg",
    slug: "st-petersburg",
    nearbyCities: ["Tampa", "Clearwater"],
    county: "Pinellas",
  },
  {
    name: "Palmetto",
    slug: "palmetto",
    nearbyCities: ["Bradenton", "Parrish"],
    county: "Manatee",
  },
  {
    name: "Parrish",
    slug: "parrish",
    nearbyCities: ["Bradenton", "Palmetto"],
    county: "Manatee",
  },
  {
    name: "North Port",
    slug: "north-port",
    nearbyCities: ["Sarasota", "Port Charlotte"],
    county: "Sarasota",
  },
];

/** Look up a city by its URL slug. */
export function getCityBySlug(slug: string): CityData | undefined {
  return cities.find((c) => c.slug === slug);
}
