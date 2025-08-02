# API Key Setup

## Where to Put Your API Key

Create a file named `.env.local` in the `frontend/terra` directory with your Google Maps API key:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## Required Google Cloud APIs

Make sure you have enabled these APIs in your Google Cloud Console:
- Maps JavaScript API
- Places API
- Geocoding API

## API Key Restrictions

For security, restrict your API key to:
- **Application restrictions**: HTTP referrers
- **Allowed referrers**: `localhost:3000/*` (for development)
- **API restrictions**: Select only the 3 APIs listed above

## Testing

After adding your API key:
1. Restart the development server: `npm run dev`
2. Enter a GTA address like "123 Queen Street, Toronto, ON"
3. You should see real pharmacy data and an interactive map 