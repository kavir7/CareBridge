import PharmacyLocator from './components/PharmacyLocator';

export default function Home() {
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Google Maps API Key Required</h1>
          <p className="text-gray-600 mb-4">
            Please add your Google Maps API key to the .env.local file
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left max-w-md mx-auto">
            <p className="text-sm font-mono text-gray-800">
              Create .env.local in frontend/terra/ with:
            </p>
            <p className="text-sm font-mono text-blue-600 mt-2">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PharmacyLocator apiKey={GOOGLE_MAPS_API_KEY} />
    </div>
  );
}
