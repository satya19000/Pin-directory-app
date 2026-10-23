export interface Office {
  id: string; pincode: string; name: string; officeType: 'B.O' | 'S.O' | 'H.O';
  delivery: 'Delivery' | 'Non-Delivery'; district: string; districtSlug: string;
  state: string; stateSlug: string; slug: string; taluk: string | null;
  circle: string; region: string; division: string;
  latitude: number | null; longitude: number | null;
}
export interface State { name: string; slug: string; kind: 'State' | 'Union territory'; offices: number; pincodes: number; districts: number }
export interface District { name: string; slug: string; stateSlug: string; offices: number; pincodes: number }
export interface Dataset { kind: 'sample' | 'production'; source: string; sourceUrl: string; asOf: string; importedAt: string; records: number; pincodes: number; rejected: number; duplicates: number }
export interface OfficePage { rows: Office[]; total: number; page: number; pages: number }
export const officePath = (o: Pick<Office, 'stateSlug' | 'districtSlug' | 'slug'>) => `/${o.stateSlug}/${o.districtSlug}/${o.slug}`;
