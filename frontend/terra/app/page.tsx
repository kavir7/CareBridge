import PharmacyLocator from './components/PharmacyLocator';

export default function Home() {
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Google Maps API Key Required</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            To unlock the full functionality of our pharmacy locator, please add your Google Maps API key to your local environment file.
          </p>
          <div className="mt-10 bg-gray-100 p-6 rounded-lg text-left inline-block">
            <p className="text-base font-mono text-gray-800">
              Create a <code className="font-bold">.env.local</code> file in the <code className="font-bold">frontend/terra/</code> directory with the following content:
            </p>
            <p className="mt-4 text-base font-mono text-blue-600 bg-gray-200 p-3 rounded-md">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PharmacyLocator apiKey={GOOGLE_MAPS_API_KEY} />
      </div>
    </main>
  );
}
