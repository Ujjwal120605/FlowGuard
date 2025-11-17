# Route Optimizer Setup Guide

## Google Maps API Key Setup

The Route Optimizer feature requires a Google Maps API key with the following APIs enabled:

1. **Maps JavaScript API** - For displaying the map
2. **Geocoding API** - For converting addresses to coordinates
3. **Directions API** - For calculating routes and travel times
4. **Places API** (optional) - For autocomplete suggestions

### Steps to Get API Key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the required APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain (recommended for production)

### Environment Variable Setup:

Create a `.env` file in the root directory:

```
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

Or set it in your Vercel environment variables:
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add: `REACT_APP_GOOGLE_MAPS_API_KEY` with your API key value

### Features:

✅ **Route Calculation** - Find fastest route between two points
✅ **Alternate Routes** - View multiple route options
✅ **Real-time Traffic** - Travel time includes current traffic conditions
✅ **Popular Locations** - Quick select from pre-defined Bangalore locations
✅ **Interactive Map** - Visual route display with start/end markers
✅ **Route Comparison** - Compare distance and time for different routes

### Usage:

1. Navigate to "Route Optimizer" in the sidebar
2. Enter origin and destination (or select from popular locations)
3. Click "Find Route"
4. View the fastest route and alternate options
5. Click on alternate routes to see them on the map



