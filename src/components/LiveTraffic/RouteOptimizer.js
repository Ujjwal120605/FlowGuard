import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import { Button, Card, Select, Spin, Alert, Divider, message } from 'antd';
import { SearchOutlined, SwapOutlined, ClockCircleOutlined, CarOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

// Route Marker Component
const RouteMarker = ({ type, label }) => (
  <div style={{
    background: type === 'start' ? '#52c41a' : type === 'end' ? '#ff4d4f' : '#1890ff',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    whiteSpace: 'nowrap',
    transform: 'translate(-50%, -100%)',
    marginTop: '-10px'
  }}>
    {type === 'start' && '📍 '}
    {type === 'end' && '🎯 '}
    {label}
  </div>
);

export default class RouteOptimizer extends Component {
  static defaultProps = {
    center: { lat: 12.9716, lng: 77.5946 },
    zoom: 12
  };

  constructor() {
    super();
    this.state = {
      origin: '',
      destination: '',
      originCoords: null,
      destinationCoords: null,
      routes: [],
      selectedRoute: null,
      loading: false,
      error: null,
      travelTime: null,
      distance: null,
      alternateRoutes: [],
      showAlternates: true,
      routePath: null,
      popularLocations: [
        { name: 'Silk Board Junction', lat: 12.9176, lng: 77.6227 },
        { name: 'Marathahalli Junction', lat: 12.9591, lng: 77.6974 },
        { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
        { name: 'MG Road', lat: 12.9716, lng: 77.5946 },
        { name: 'Whitefield', lat: 12.9698, lng: 77.7499 },
        { name: 'Electronic City', lat: 12.8456, lng: 77.6603 },
        { name: 'Kempegowda International Airport', lat: 13.1986, lng: 77.7066 },
        { name: 'Bangalore City Railway Station', lat: 12.9773, lng: 77.5669 },
        { name: 'Yeshwantpur Railway Station', lat: 13.0250, lng: 77.5483 },
        { name: 'Cubbon Park', lat: 12.9764, lng: 77.5925 },
        { name: 'Indiranagar', lat: 12.9716, lng: 77.6412 },
        { name: 'Jayanagar', lat: 12.9250, lng: 77.5838 },
        { name: 'Hebbal', lat: 13.0358, lng: 77.5970 }
      ]
    };
  }

  geocodeAddress = async (address) => {
    // Check popular locations first
    const popularLocation = this.state.popularLocations.find(
      loc => loc.name.toLowerCase() === address.toLowerCase()
    );
    
    if (popularLocation) {
      console.log(`✅ Using coordinates for: ${popularLocation.name}`);
      return { lat: popularLocation.lat, lng: popularLocation.lng };
    }

    // Use Nominatim (free geocoding)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Bangalore, India')}&limit=1`,
        {
          headers: {
            'User-Agent': 'BangaloreTrafficSystem/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        console.log(`✅ Geocoded: ${address}`);
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      } else {
        throw new Error(`Location "${address}" not found in Bangalore`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error(`Could not find location: ${address}`);
    }
  };

  calculateRoutes = async () => {
    const { origin, destination } = this.state;

    if (!origin || !destination) {
      this.setState({ error: 'Please enter both origin and destination' });
      return;
    }

    if (origin === destination) {
      message.warning('Origin and destination cannot be the same!');
      return;
    }

    this.setState({ loading: true, error: null, routes: [], alternateRoutes: [] });
    console.log(`🔍 Calculating route: ${origin} → ${destination}`);

    try {
      // Geocode both locations
      const [originCoords, destCoords] = await Promise.all([
        this.geocodeAddress(origin),
        this.geocodeAddress(destination)
      ]);

      console.log('📍 Coordinates:', { origin: originCoords, destination: destCoords });
      this.setState({ originCoords, destinationCoords: destCoords });

      // Get API key from environment
      const ORS_API_KEY = process.env.REACT_APP_OPENROUTE_API_KEY;
      
      if (!ORS_API_KEY) {
        throw new Error('OpenRouteService API key not configured. Please add REACT_APP_OPENROUTE_API_KEY to your .env file');
      }

      console.log('🔑 Calling OpenRouteService API...');

      // Call OpenRouteService Directions API with proper format
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${originCoords.lng},${originCoords.lat}&end=${destCoords.lng},${destCoords.lat}`;
      
      console.log('API URL:', url.replace(ORS_API_KEY, 'API_KEY_HIDDEN'));

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
        }
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
          console.error('API Error Response:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('📡 OpenRouteService Response:', data);

      if (data.features && data.features.length > 0) {
        const routes = data.features.map((feature, index) => {
          const summary = feature.properties.summary;
          
          return {
            index,
            distance: `${(summary.distance / 1000).toFixed(1)} km`,
            distanceValue: summary.distance,
            duration: this.formatDuration(summary.duration),
            durationValue: summary.duration,
            summary: `Via ${summary.distance > 10000 ? 'Highway' : 'City Roads'}`,
            coordinates: feature.geometry.coordinates
          };
        });

        const selectedRoute = routes[0];

        this.setState({
          routes,
          selectedRoute,
          alternateRoutes: routes.slice(1),
          travelTime: selectedRoute.duration,
          distance: selectedRoute.distance,
          routePath: selectedRoute.coordinates,
          loading: false
        });

        message.success(`Found ${routes.length} route(s)!`);

        // Draw route on map
        if (this.map && this.maps) {
          this.drawRouteOnMap(selectedRoute.coordinates);
        }
      } else {
        throw new Error('No routes found between these locations');
      }
    } catch (error) {
      console.error('❌ Route calculation error:', error);
      this.setState({
        error: error.message || 'Failed to calculate routes. Please try again.',
        loading: false
      });
      message.error('Failed to calculate route');
    }
  };

  formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  drawRouteOnMap = (coordinates) => {
    if (!this.map || !this.maps || !coordinates) {
      console.warn('⚠️ Map not ready or no coordinates');
      return;
    }

    try {
      console.log('🎨 Drawing route on map...');

      // Clear previous polyline
      if (this.polyline) {
        this.polyline.setMap(null);
      }

      // Convert coordinates [lng, lat] -> {lat, lng}
      const path = coordinates.map(coord => ({
        lat: coord[1],
        lng: coord[0]
      }));

      console.log(`Drawing ${path.length} points on map`);

      // Create polyline
      this.polyline = new this.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#1890ff',
        strokeOpacity: 0.8,
        strokeWeight: 5
      });

      this.polyline.setMap(this.map);

      // Fit bounds to show entire route
      const bounds = new this.maps.LatLngBounds();
      path.forEach(point => bounds.extend(point));
      this.map.fitBounds(bounds);

      console.log('✅ Route drawn successfully');
    } catch (error) {
      console.error('❌ Error drawing route:', error);
    }
  };

  swapLocations = () => {
    const { origin, destination } = this.state;
    this.setState({
      origin: destination,
      destination: origin
    });
    if (origin && destination) {
      message.info('Locations swapped! Click "Find Route" to recalculate.');
    }
  };

  selectRoute = (route) => {
    this.setState({ 
      selectedRoute: route,
      travelTime: route.duration,
      distance: route.distance,
      routePath: route.coordinates
    });
    message.info(`Switched to Route ${route.index + 1}`);
    
    // Redraw route
    if (this.map && this.maps) {
      this.drawRouteOnMap(route.coordinates);
    }
  };

  render() {
    const {
      origin,
      destination,
      originCoords,
      destinationCoords,
      selectedRoute,
      alternateRoutes,
      loading,
      error,
      travelTime,
      distance,
      showAlternates,
      popularLocations
    } = this.state;

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🗺️ Route Optimizer & Navigation</h1>
          <p style={styles.subtitle}>Find the fastest route through Bangalore - Powered by OpenRouteService</p>
          
          <div style={{...styles.statusBadge, background: '#d1fae5', color: '#065f46'}}>
            ✅ Free API - No Billing Required!
          </div>
        </div>

        <div style={styles.content}>
          <Card style={styles.searchCard} title="📍 Enter Your Route">
            <div style={styles.searchRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>From</label>
                <Select
                  showSearch
                  style={styles.select}
                  placeholder="Enter origin (e.g., MG Road)"
                  value={origin || undefined}
                  onChange={(value) => this.setState({ origin: value })}
                  onSearch={(value) => this.setState({ origin: value })}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  allowClear
                >
                  {popularLocations.map((loc, idx) => (
                    <Option key={idx} value={loc.name}>
                      📍 {loc.name}
                    </Option>
                  ))}
                </Select>
              </div>

              <Button
                type="text"
                icon={<SwapOutlined />}
                onClick={this.swapLocations}
                style={styles.swapButton}
                title="Swap locations"
              />

              <div style={styles.inputGroup}>
                <label style={styles.label}>To</label>
                <Select
                  showSearch
                  style={styles.select}
                  placeholder="Enter destination (e.g., Whitefield)"
                  value={destination || undefined}
                  onChange={(value) => this.setState({ destination: value })}
                  onSearch={(value) => this.setState({ destination: value })}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  allowClear
                >
                  {popularLocations.map((loc, idx) => (
                    <Option key={idx} value={loc.name}>
                      🎯 {loc.name}
                    </Option>
                  ))}
                </Select>
              </div>

              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={this.calculateRoutes}
                loading={loading}
                size="large"
                style={styles.searchButton}
                disabled={!origin || !destination}
              >
                Find Route
              </Button>
            </div>

            {error && (
              <Alert
                message="Error"
                description={
                  <div>
                    <strong>{error}</strong>
                    {error.includes('API key') && (
                      <div style={{marginTop: '10px', fontSize: '13px'}}>
                        <strong>How to fix:</strong>
                        <ol style={{marginTop: '5px', paddingLeft: '20px'}}>
                          <li>Sign up at <a href="https://openrouteservice.org/dev/#/signup" target="_blank" rel="noopener noreferrer">OpenRouteService</a></li>
                          <li>Get your API key (looks like: 5b3ce3e9851116000...</li>
                          <li>Add to .env file: <code>REACT_APP_OPENROUTE_API_KEY=your_key_here</code></li>
                          <li>Restart your React server: <code>npm start</code></li>
                        </ol>
                      </div>
                    )}
                  </div>
                }
                type="error"
                showIcon
                style={{ marginTop: '16px' }}
                closable
                onClose={() => this.setState({ error: null })}
              />
            )}
            
            {!error && !selectedRoute && (
              <Alert
                message={<span><InfoCircleOutlined /> Quick Start</span>}
                description="Select from popular Bangalore locations above for best results. All routes use 100% FREE API!"
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            )}
          </Card>

          {selectedRoute && (
            <div style={styles.resultsContainer}>
              <Card
                style={styles.routeCard}
                title={
                  <div style={styles.routeHeader}>
                    <CarOutlined style={{ marginRight: '8px' }} />
                    <span>Fastest Route</span>
                  </div>
                }
              >
                <div style={styles.routeInfo}>
                  <div style={styles.infoItem}>
                    <ClockCircleOutlined style={styles.infoIcon} />
                    <div>
                      <div style={styles.infoLabel}>Travel Time</div>
                      <div style={styles.infoValue}>{travelTime}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <CarOutlined style={styles.infoIcon} />
                    <div>
                      <div style={styles.infoLabel}>Distance</div>
                      <div style={styles.infoValue}>{distance}</div>
                    </div>
                  </div>
                </div>

                <Divider style={{borderColor: 'rgba(255,255,255,0.3)', margin: '16px 0'}} />

                <div style={styles.routeSummary}>
                  <strong>Route Type:</strong> {selectedRoute.summary}
                </div>
                <div style={{...styles.routeSummary, marginTop: '8px', fontSize: '13px'}}>
                  <strong>From:</strong> {origin} → <strong>To:</strong> {destination}
                </div>
              </Card>

              {showAlternates && alternateRoutes.length > 0 && (
                <Card
                  style={styles.alternatesCard}
                  title={`🔄 ${alternateRoutes.length} Alternate Route${alternateRoutes.length > 1 ? 's' : ''}`}
                >
                  {alternateRoutes.map((route, idx) => (
                    <Card
                      key={idx}
                      size="small"
                      style={styles.alternateRoute}
                      hoverable
                      onClick={() => this.selectRoute(route)}
                    >
                      <div style={styles.alternateInfo}>
                        <div style={{flex: 1}}>
                          <strong>Route {idx + 2}</strong>
                          <div style={styles.alternateDetails}>
                            ⏱️ {route.duration} • 📏 {route.distance}
                          </div>
                          <div style={styles.alternateSummary}>{route.summary}</div>
                        </div>
                        <Button
                          type="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.selectRoute(route);
                          }}
                        >
                          Use This
                        </Button>
                      </div>
                    </Card>
                  ))}
                </Card>
              )}
            </div>
          )}

          <Card style={styles.mapCard} title="🗺️ Live Route Map">
            <div style={styles.mapContainer}>
              {loading && (
                <div style={styles.loadingOverlay}>
                  <Spin size="large" tip="Calculating best route..." />
                </div>
              )}
              <GoogleMapReact
                bootstrapURLKeys={{
                  key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyC33R5XOIc8basuTtd74eFquIIAnuhWJGg'
                }}
                defaultCenter={this.props.center}
                defaultZoom={this.props.zoom}
                center={originCoords || this.props.center}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map, maps }) => {
                  this.map = map;
                  this.maps = maps;
                  console.log('🗺️ Google Maps loaded successfully');
                  
                  // Redraw route if exists
                  if (this.state.routePath) {
                    this.drawRouteOnMap(this.state.routePath);
                  }
                }}
                options={{
                  fullscreenControl: true,
                  zoomControl: true,
                  mapTypeControl: true
                }}
              >
                {originCoords && (
                  <RouteMarker
                    lat={originCoords.lat}
                    lng={originCoords.lng}
                    type="start"
                    label={origin}
                  />
                )}
                {destinationCoords && (
                  <RouteMarker
                    lat={destinationCoords.lat}
                    lng={destinationCoords.lng}
                    type="end"
                    label={destination}
                  />
                )}
              </GoogleMapReact>
            </div>
          </Card>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    padding: '20px',
    background: '#f5f5f5',
    overflowY: 'auto'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '8px'
  },
  statusBadge: {
    display: 'inline-block',
    marginTop: '12px',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  searchCard: {
    width: '100%'
  },
  searchRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
    flexWrap: 'wrap'
  },
  inputGroup: {
    flex: 1,
    minWidth: '250px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  select: {
    width: '100%'
  },
  swapButton: {
    alignSelf: 'flex-end',
    marginBottom: '4px'
  },
  searchButton: {
    height: '40px',
    minWidth: '140px',
    alignSelf: 'flex-end'
  },
  resultsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
    width: '100%'
  },
  routeCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  routeHeader: {
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center'
  },
  routeInfo: {
    display: 'flex',
    gap: '32px',
    marginTop: '16px',
    flexWrap: 'wrap'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  infoIcon: {
    fontSize: '28px',
    color: 'rgba(255,255,255,0.9)'
  },
  infoLabel: {
    fontSize: '12px',
    opacity: 0.8,
    marginBottom: '4px'
  },
  infoValue: {
    fontSize: '22px',
    fontWeight: 'bold'
  },
  routeSummary: {
    fontSize: '14px',
    opacity: '0.9'
  },
  alternatesCard: {
    maxHeight: '420px',
    overflowY: 'auto'
  },
  alternateRoute: {
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  alternateInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px'
  },
  alternateDetails: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '6px'
  },
  alternateSummary: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px'
  },
  mapCard: {
    width: '100%'
  },
  mapContainer: {
    width: '100%',
    height: '600px',
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255,255,255,0.95)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    gap: '16px'
  }
};