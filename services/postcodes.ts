import { SavedLocation } from '../types';

export async function lookupPostcode(raw: string): Promise<SavedLocation> {
  const postcode = raw.replace(/\s+/g, '').toUpperCase();
  const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
  const json = await res.json();

  if (json.status !== 200 || !json.result) {
    throw new Error('Invalid UK postcode. Please check and try again.');
  }

  const { latitude, longitude, admin_district, parish, admin_ward } = json.result;
  const displayName = admin_district || parish || admin_ward || postcode;

  return {
    postcode: json.result.postcode,
    displayName,
    latitude,
    longitude,
  };
}
