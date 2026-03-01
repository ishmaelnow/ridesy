const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

export interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(query: string): Promise<GeoResult[]> {
  try {
    const res = await fetch(
      `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
    }));
  } catch {
    return [];
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
