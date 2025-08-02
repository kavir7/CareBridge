'use client';

import { useState, useRef, useEffect } from 'react';
import FileUpload from './FileUpload';

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  rating?: number;
  open_now?: boolean;
  distance?: number;
}

interface PharmacyLocatorProps {
  apiKey: string;
}

export default function PharmacyLocator({ apiKey }: PharmacyLocatorProps) {
  const [address, setAddress] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mapUrl, setMapUrl] = useState('');
  const mapRef = useRef<HTMLIFrameElement>(null);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (typeof window !== 'undefined' && !window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('Google Maps API loaded successfully');
        };
        document.head.appendChild(script);
      }
    };

    loadGoogleMapsAPI();
  }, [apiKey]);

  // Geocode address to get coordinates
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (!window.google) {
      console.error('Google Maps API not loaded');
      return null;
    }

    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address + ', GTA, Ontario, Canada' }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Search for nearby pharmacies
  const searchNearbyPharmacies = async (lat: number, lng: number): Promise<Pharmacy[]> => {
    if (!window.google) {
      console.error('Google Maps API not loaded');
      return [];
    }

    return new Promise((resolve) => {
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request = {
        location: new window.google.maps.LatLng(lat, lng),
        radius: 10000, // 10km radius
        type: 'pharmacy',
        keyword: 'pharmacy drugstore'
      };

      service.nearbySearch(request, (results, status) => {
        // Fix: Use string comparison for status due to type issues with PlacesServiceStatus
        if (status === 'OK' && results) {
          const pharmacyList: Pharmacy[] = results.map((place, index) => {
            let distance: number | undefined;

            // Try to calculate distance using Google Maps geometry library
            if (place.geometry?.location && window.google?.maps?.geometry?.spherical) {
              try {
                distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                  new window.google.maps.LatLng(lat, lng),
                  place.geometry.location
                ) / 1000; // Convert to km
              } catch (error) {
                console.warn('Failed to calculate distance using Google Maps geometry:', error);
              }
            }

            // Fallback to Haversine formula if Google Maps geometry fails
            if (distance === undefined && place.geometry?.location) {
              distance = calculateDistance(
                lat, 
                lng, 
                place.geometry.location.lat(), 
                place.geometry.location.lng()
              );
            }

            return {
              id: place.place_id || `pharmacy-${index}`,
              name: place.name || 'Unknown Pharmacy',
              address: place.vicinity || 'Address not available',
              rating: place.rating,
              open_now: place.opening_hours?.isOpen(),
              distance: distance
            };
          });
          resolve(pharmacyList);
        } else {
          console.error('Places search failed:', status);
          resolve([]);
        }
      });
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    try {
      // Geocode the address
      const coordinates = await geocodeAddress(address);
      if (!coordinates) {
        alert('Could not find the address. Please try a more specific address.');
        setLoading(false);
        return;
      }

      // Search for nearby pharmacies
      const nearbyPharmacies = await searchNearbyPharmacies(coordinates.lat, coordinates.lng);
      setPharmacies(nearbyPharmacies);

      // Create map URL (without markers)
      const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${coordinates.lat},${coordinates.lng}&zoom=12`;
      setMapUrl(mapUrl);

    } catch (error) {
      console.error('Error searching pharmacies:', error);
      alert('An error occurred while searching for pharmacies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    console.log('File selected:', file.name);
    // Here you would typically upload the file to your backend
    // For now, we'll just log the file info
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CareBridge Pharmacy Locator</h1>
        <p className="text-gray-600">Find pharmacies near you in the Greater Toronto Area</p>
      </div>

      {/* Address Input Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123 Queen Street, Toronto, ON"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Find Pharmacies'}
          </button>
        </div>
      </form>

      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Prescription</h2>
        <FileUpload
          onFileSelect={handleFileUpload}
          accept=".png,.jpg,.jpeg,.pdf"
          maxSize={10}
          label="Upload your prescription or medical document"
        />
      </div>

      {/* Results Section */}
      {pharmacies.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold text-gray-900 p-6 pb-0">Map View</h2>
            <div className="p-6">
              {mapUrl && (
                <iframe
                  ref={mapRef}
                  src={mapUrl}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>
          </div>

          {/* Pharmacy List */}
          <div className="bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 p-6 pb-0">
              Nearby Pharmacies ({pharmacies.length})
            </h2>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pharmacies.map((pharmacy) => (
                  <div
                    key={pharmacy.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{pharmacy.address}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      {pharmacy.rating && (
                        <span className="flex items-center text-yellow-600">
                          ⭐ {pharmacy.rating}
                        </span>
                      )}
                      {pharmacy.distance && (
                        <span className="text-gray-500">
                          {(pharmacy.distance).toFixed(1)} km away
                        </span>
                      )}
                      {pharmacy.open_now !== undefined && (
                        <span className={pharmacy.open_now ? 'text-green-600' : 'text-red-600'}>
                          {pharmacy.open_now ? 'Open' : 'Closed'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Searching for pharmacies...</p>
        </div>
      )}
    </div>
  );
} 