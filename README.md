# CareBridge - AI-Powered Post-Operative Recovery Assistant

CareBridge is an AI-powered post-operative recovery assistant designed to help patients access medication and monitor their recovery in the days and weeks after surgery. The app tackles two major challenges: locating prescribed drugs and ensuring proper aftercare follow-up.

## Features

### 🏥 Pharmacy Locator
- **Address Input**: Users can enter their home address in the GTA
- **Nearby Search**: Find all pharmacies within a 5-10km radius
- **Interactive Map**: Google Maps integration showing pharmacy locations
- **Detailed Information**: Pharmacy ratings, opening hours, and distances
- **File Upload**: Upload prescription documents (PNG, JPG, PDF)

### 🤖 AI Check-in System 
- Daily AI-powered check-ins powered by Gemini
- Medication tracking and reminders
- Symptom monitoring and red flag detection
- Automated doctor summaries

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Google Maps JavaScript API, Places API, Geocoding API
- **Backend**: Python Flask (in development)
- **Database**: MongoDB (planned)

## Getting Started

### Prerequisites

1. **Node.js**: Version 18 or higher
2. **npm**: Package manager
3. **Google Cloud Account**: For Maps API access

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd terrahacks/frontend/terra
   ```

2. **Install dependencies**:
   ```bash
   npm install
   npm install @googlemaps/js-api-loader
   ```

3. **Set up Google Maps API**:
   - Get your API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable: Maps JavaScript API, Places API, Geocoding API
   - Create a `.env.local` file in the `frontend/terra` directory

4. **Add your API key**:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/terra/
├── app/
│   ├── components/
│   │   ├── PharmacyLocator.tsx      # Main pharmacy locator component
│   │   └── FileUpload.tsx           # File upload component
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Main page
│   └── globals.css                  # Global styles
├── types/
│   └── google-maps.d.ts             # Google Maps TypeScript definitions
├── public/                          # Static assets
├── .env.local                       # Environment variables (create this)
└── README.md                        # This file
```

## Usage

The application requires a valid Google Maps API key to function. Make sure you have:

1. **Google Maps API key** with the following APIs enabled:
   - Maps JavaScript API
   - Places API
   - Geocoding API
2. **API key restrictions** set to allow `localhost:3000/*` for development
3. **Billing enabled** on your Google Cloud project

### File Upload
- Supported formats: PNG, JPG, JPEG, PDF
- Maximum file size: 10MB
- Drag and drop functionality available

## API Endpoints (Planned)

### Backend Integration
The frontend is designed to integrate with a Flask backend for:
- File storage and processing
- User authentication
- Prescription management
- AI check-in data storage

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Tailwind CSS for styling
- Component-based architecture
- Responsive design

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the setup guides in the project
- Review the Google Maps API documentation
- Open an issue in the repository

## Roadmap

- [ ] Backend API development
- [ ] User authentication
- [ ] AI check-in system
- [ ] Mobile app development
- [ ] Integration with pharmacy systems
- [ ] Multi-language support
