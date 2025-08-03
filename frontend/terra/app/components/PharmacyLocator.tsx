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
  lat?: number;
  lng?: number;
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
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLIFrameElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // @ts-ignore
  const markerRefs = useRef<Record<string, any>>({});

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

  // 1. Update searchNearbyPharmacies to scan for specific chains
  const pharmacyChains = ['Shoppers Drug Mart', 'Rexall', 'Pharmasave', 'Guardian', 'IDA', 'Costco Pharmacy', 'Walmart Pharmacy'];
  const searchNearbyPharmacies = async (lat: number, lng: number): Promise<Pharmacy[]> => {
    if (!window.google) {
      console.error('Google Maps API not loaded');
      return [];
    }

    return new Promise((resolve) => {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const requests = pharmacyChains.map(chain => ({
        location: new window.google.maps.LatLng(lat, lng),
        radius: 10000,
        type: 'pharmacy',
        keyword: chain
      }));

      let allResults: Pharmacy[] = [];
      let completed = 0;

      requests.forEach((request, idx) => {
        service.nearbySearch(request, (results, status) => {
          if (status === 'OK' && results) {
            const pharmacies = results.map((place, index) => {
              let distance: number | undefined;
              if (place.geometry?.location && window.google?.maps?.geometry?.spherical) {
                try {
                  distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                    new window.google.maps.LatLng(lat, lng),
                    place.geometry.location
                  ) / 1000;
                } catch (error) {}
              }
              if (distance === undefined && place.geometry?.location) {
                distance = calculateDistance(
                  lat,
                  lng,
                  place.geometry.location.lat(),
                  place.geometry.location.lng()
                );
              }
              return {
                id: place.place_id || `pharmacy-${idx}-${index}`,
                name: place.name || 'Unknown Pharmacy',
                address: place.vicinity || 'Address not available',
                rating: place.rating,
                open_now: place.opening_hours?.isOpen(),
                distance: distance,
                lat: place.geometry?.location ? place.geometry.location.lat() : undefined,
                lng: place.geometry?.location ? place.geometry.location.lng() : undefined
              };
            });
            allResults = allResults.concat(pharmacies);
          }
          completed++;
          if (completed === requests.length) {
            // Remove duplicates by place_id
            const unique = Object.values(
              allResults.reduce((acc, cur) => {
                acc[cur.id] = cur;
                return acc;
              }, {} as Record<string, Pharmacy>)
            );
            resolve(unique);
          }
        });
      });
    });
  };

  // 2. Sort pharmacies by distance before rendering
  useEffect(() => {
    setPharmacies((prev) =>
      [...prev].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    );
  }, [pharmacies.length]);

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

      setUserLocation(coordinates);

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
  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);

    // 1. Generate and store session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('userSessionId', sessionId);

    // 2. Create FormData and append file and sessionId
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    // 3. Upload to backend
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        alert('Prescription uploaded and processed successfully!');
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        alert(`Upload failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading the file.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Render Google Map with markers and InfoWindows
  useEffect(() => {
    if (
      pharmacies.length > 0 &&
      window.google &&
      mapContainerRef.current &&
      pharmacies[0].lat !== undefined &&
      pharmacies[0].lng !== undefined
    ) {
      const center = userLocation
        ? { lat: userLocation.lat, lng: userLocation.lng }
        : { lat: pharmacies[0].lat as number, lng: pharmacies[0].lng as number };
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 12,
      });

      const infoWindow = new window.google.maps.InfoWindow();
      markerRefs.current = {}; // Reset marker refs

      // 1. Add user location marker (distinct icon)
      if (userLocation) {
        const userMarker = new window.google.maps.Marker({
          position: userLocation,
          map,
          title: 'Your Address',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });
        userMarker.addListener('click', () => {
          infoWindow.setContent('<strong>Your Address</strong>');
          infoWindow.open(map, userMarker);
        });
      }

      // 2. Add pharmacy markers and store refs
      pharmacies.forEach((pharmacy) => {
        if (pharmacy.lat !== undefined && pharmacy.lng !== undefined) {
          const marker = new window.google.maps.Marker({
            position: { lat: pharmacy.lat as number, lng: pharmacy.lng as number },
            map,
            title: pharmacy.name,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(40, 40),
            },
          });

          markerRefs.current[pharmacy.id] = marker;

          marker.addListener('click', () => {
            infoWindow.setContent(`
              <div>
                <strong>${pharmacy.name}</strong><br/>
                <button id="view-details-${pharmacy.id}">View Details</button>
              </div>
            `);
            infoWindow.open(map, marker);

            window.google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
              const btn = document.getElementById(`view-details-${pharmacy.id}`);
              if (btn) {
                btn.onclick = (e) => {
                  e.preventDefault();
                  setSelectedPharmacyId(pharmacy.id);
                };
              }
            });

            setSelectedPharmacyId(pharmacy.id); // Highlight in list when marker is clicked
          });
        }
      });
    }
  }, [pharmacies, userLocation]);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-between items-start">
            <div></div> {/* Left spacer */}
            <div className="flex-1 space-y-6">
              <h1 className="text-5xl font-medium tracking-tight text-gray-900 sm:text-6xl">
                CareBridge
                <span className="block text-4xl sm:text-5xl font-normal text-gray-700 mt-2">
                  Pharmacy Locator
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Discover pharmacies near you in the Greater Toronto Area with ease and confidence
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.href = '/calendar'}
                className="inline-flex items-center px-6 py-3 border border-gray-900 rounded-lg text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
              >
                📅 Medical Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Address Input Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1">
                <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">
                  Enter your address
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., 123 Queen Street, Toronto, ON"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Searching...' : 'Find Pharmacies'}
              </button>
            </div>
          </form>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Upload Prescription</h2>
          <FileUpload
            onFileSelect={handleFileUpload}
            accept=".png,.jpg,.jpeg,.pdf"
            maxSize={10}
            label="Upload your prescription or medical document"
          />
        </div>

        {/* Results Section */}
        {pharmacies.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-medium text-gray-900">Map View</h2>
              </div>
              <div className="px-6 pb-6">
                <div 
                  ref={mapContainerRef} 
                  className="w-full h-96 rounded-lg border border-gray-200" 
                />
              </div>
            </div>

            {/* Pharmacy List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-2xl font-medium text-gray-900">
                  Nearby Pharmacies 
                  <span className="text-lg font-normal text-gray-600 ml-2">({pharmacies.length})</span>
                </h2>
              </div>
              <div className="px-6 pb-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {pharmacies.map((pharmacy) => (
                    <div
                      key={pharmacy.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
                        selectedPharmacyId === pharmacy.id 
                          ? 'bg-gray-50 border-gray-900 shadow-sm' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedPharmacyId(pharmacy.id);
                        const marker = markerRefs.current[pharmacy.id];
                        if (marker) {
                          window.google.maps.event.trigger(marker, 'click');
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{pharmacy.name}</h3>
                          <p className="text-gray-600 mt-1">{pharmacy.address}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            {pharmacy.distance !== undefined && (
                              <p className="text-gray-500">
                                {pharmacy.distance.toFixed(2)} km away
                              </p>
                            )}
                            {pharmacy.rating && (
                              <p className="text-yellow-600 font-medium">★ {pharmacy.rating}</p>
                            )}
                            {pharmacy.open_now !== undefined && (
                              <p className={`font-medium ${pharmacy.open_now ? 'text-green-600' : 'text-red-600'}`}>
                                {pharmacy.open_now ? 'Open Now' : 'Closed'}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          className="ml-4 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPharmacyId(pharmacy.id);
                            const marker = markerRefs.current[pharmacy.id];
                            if (marker) {
                              window.google.maps.event.trigger(marker, 'click');
                            }
                          }}
                        >
                          Details
                        </button>
                      </div>
                      
                      {/* Expanded details if selected */}
                      {selectedPharmacyId === pharmacy.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="mb-4">
                            <h4 className="font-medium mb-2 text-gray-900">Hours of Operation</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Mon-Fri: 9am - 9pm</div>
                              <div>Sat: 10am - 6pm</div>
                              <div>Sun: 11am - 5pm</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 text-gray-900">Stock Template</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center text-green-600">
                                <span className="mr-2">✔️</span>Acetaminophen
                              </div>
                              <div className="flex items-center text-green-600">
                                <span className="mr-2">✔️</span>Ibuprofen
                              </div>
                              <div className="flex items-center text-green-600">
                                <span className="mr-2">✔️</span>Antibiotics
                              </div>
                              <div className="flex items-center text-red-500">
                                <span className="mr-2">❌</span>Prescription XYZ
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}