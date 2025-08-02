# Google Maps API Setup Guide

## Prerequisites

1. **Google Cloud Console Account**: You need a Google Cloud account to access the APIs
2. **Billing Enabled**: Google Maps APIs require billing to be enabled on your project

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project

## Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud Console:

1. **Maps JavaScript API**
   - Go to APIs & Services > Library
   - Search for "Maps JavaScript API"
   - Click "Enable"

2. **Places API**
   - Search for "Places API"
   - Click "Enable"

3. **Geocoding API**
   - Search for "Geocoding API"
   - Click "Enable"

## Step 3: Create API Key

1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

## Step 4: Restrict API Key (Recommended)

1. Click on your newly created API key
2. Under "Application restrictions", select "HTTP referrers (web sites)"
3. Add your domain (e.g., `localhost:3000/*` for development)
4. Under "API restrictions", select "Restrict key"
5. Select the three APIs you enabled above
6. Click "Save"

## Step 5: Configure Environment Variables

Create a `.env.local` file in the `frontend/terra` directory:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## Step 6: Install Dependencies

Run the following command to install the Google Maps JavaScript API loader:

```bash
npm install @googlemaps/js-api-loader
```

## Step 7: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Enter an address in the GTA (Greater Toronto Area)
4. Click "Find Pharmacies" to test the functionality

## API Usage Limits

- **Maps JavaScript API**: 25,000 map loads per day (free tier)
- **Places API**: 1,000 requests per day (free tier)
- **Geocoding API**: 2,500 requests per day (free tier)

## Troubleshooting

### Common Issues:

1. **"Google Maps API not loaded" error**
   - Check if your API key is correct
   - Verify that the Maps JavaScript API is enabled
   - Check browser console for detailed error messages

2. **"REQUEST_DENIED" error**
   - Verify API key restrictions
   - Check if billing is enabled
   - Ensure all required APIs are enabled

3. **No pharmacies found**
   - Try a more specific address
   - Check if the address is in the GTA
   - Verify Places API is enabled

### Development Tips:

- Use `localhost:3000/*` in API key restrictions for development
- Monitor API usage in Google Cloud Console
- Test with various GTA addresses to ensure functionality

## Security Notes

- Never commit your API key to version control
- Use environment variables for API keys
- Restrict API keys to specific domains and APIs
- Monitor API usage to prevent unexpected charges 