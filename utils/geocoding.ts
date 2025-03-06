// Function to geocode a location string using OpenStreetMap Nominatim
export async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  if (!location) return null;

  try {
    // Clean and encode the location string
    const searchQuery = encodeURIComponent(location.trim());
    
    // Call OpenStreetMap Nominatim API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ShipmentTracker/1.0'
        }
      }
    );

    const data = await response.json();

    // Check if we got results
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Helper function to format address parts into a searchable string
export function formatAddress(parts: {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
}): string {
  return Object.values(parts)
    .filter(part => part && part.trim())
    .join(', ');
}
