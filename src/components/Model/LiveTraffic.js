import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';

// Simple Car Marker Component - optimized for performance
const CarMarker = ({ color, speed = 'normal' }) => {
  return (
    <div style={{
      fontSize: '16px',
      filter: `drop-shadow(0 2px 3px rgba(0,0,0,0.3))`,
      transform: 'translate(-50%, -50%)',
      opacity: 0.8
    }}>
      🚗
    </div>
  );
};

// Enhanced Traffic Light Component
const Trafficlight = ({ color, count, lat, lng, name, congestionLevel }) => {
  // Don't render Electronic City to reduce clutter
  if (name === 'Electronic City') return null;

  const lightSize = name ? 20 : 14;
  const glowIntensity = 10;

  return (
    <div style={{
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      zIndex: name ? 1000 : 500
    }}>
      {/* Traffic Light */}
      <div style={{
        width: `${lightSize}px`,
        height: `${lightSize}px`,
        borderRadius: '50%',
        background: color === 'green' ? '#10b981' :
          color === 'yellow' ? '#f59e0b' : '#ef4444',
        boxShadow: `0 0 ${glowIntensity}px ${color === 'green' ? '#10b981' :
          color === 'yellow' ? '#f59e0b' : '#ef4444'}`,
        border: '2px solid rgba(255,255,255,0.9)',
        transition: 'all 0.2s ease'
      }} />

      {/* Junction Label - Only show for main junction */}
      {name && (
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px'
        }}>
          <div>{name}</div>
          <div style={{
            fontSize: '9px',
            color: '#d1d5db',
            fontWeight: '500'
          }}>
            {count} vehicles
          </div>
        </div>
      )}
    </div>
  );
};

export default class LiveTraffic extends Component {
  static defaultProps = {
    center: { lat: 12.9716, lng: 77.5946 },
    zoom: 12
  };

  constructor() {
    super();
    this.state = {
      l1: 'red', l2: 'red', l3: 'red', l4: 'red', l5: 'red', l6: 'red', l7: 'red',
      c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0, c7: 0,
      mlPredictions: null,
      predictionLoaded: false,
      lastUpdateTime: new Date(),
      showCars: true,
      carPositions: [],
      selectedJunction: null,
      animationSpeed: 'normal',
      autoRefresh: true,
      mapStyle: 'default',
      junctions: [
        {
          name: 'Silk Board',
          key: 'Silk Board',
          lat: 12.9176,
          lng: 77.6227,
          description: 'Hosur Road & Outer Ring Road',
          icon: '🛣️',
          trafficLights: [
            { lat: 12.9176, lng: 77.6227 },
            { lat: 12.9185, lng: 77.6235 },
            { lat: 12.9168, lng: 77.6240 },
            { lat: 12.9170, lng: 77.6220 }
          ]
        },
        {
          name: 'Marathahalli',
          key: 'Marathahalli',
          lat: 12.9591,
          lng: 77.6974,
          description: 'IT Corridor Hub',
          icon: '💼',
          trafficLights: [
            { lat: 12.9591, lng: 77.6974 },
            { lat: 12.9600, lng: 77.6980 },
            { lat: 12.9585, lng: 77.6985 },
            { lat: 12.9595, lng: 77.6965 }
          ]
        },
        {
          name: 'Koramangala',
          key: 'Koramangala',
          lat: 12.9352,
          lng: 77.6245,
          description: '80 Feet Road Junction',
          icon: '🏙️',
          trafficLights: [
            { lat: 12.9352, lng: 77.6245 },
            { lat: 12.9360, lng: 77.6255 },
            { lat: 12.9345, lng: 77.6250 }
          ]
        },
        {
          name: 'MG Road',
          key: 'MG Road',
          lat: 12.9716,
          lng: 77.5946,
          description: 'City Center',
          icon: '🏛️',
          trafficLights: [
            { lat: 12.9716, lng: 77.5946 },
            { lat: 12.9720, lng: 77.5950 },
            { lat: 12.9712, lng: 77.5942 }
          ]
        },
        {
          name: 'Whitefield',
          key: 'Whitefield',
          lat: 12.9698,
          lng: 77.7499,
          description: 'ITPL Main Road',
          icon: '🏢',
          trafficLights: [
            { lat: 12.9698, lng: 77.7499 },
            { lat: 12.9705, lng: 77.7505 },
            { lat: 12.9692, lng: 77.7493 }
          ]
        },
        {
          name: 'Electronic City',
          key: 'Electronic City',
          lat: 12.8456,
          lng: 77.6603,
          description: 'Hosur Road IT Hub',
          icon: '⚡',
          trafficLights: [
            { lat: 12.8456, lng: 77.6603 },
            { lat: 12.8465, lng: 77.6610 },
            { lat: 12.8450, lng: 77.6598 }
          ]
        },
        {
          name: 'Pattanegre',
          key: 'Pattanegre',
          lat: 12.9366,
          lng: 77.5024,
          description: 'Global Village Tech Park',
          icon: '🏢',
          trafficLights: [
            { lat: 12.9366, lng: 77.5024 },
            { lat: 12.9375, lng: 77.5030 },
            { lat: 12.9355, lng: 77.5015 }
          ]
        }
      ]
    };
  }

  generateCarPositions() {
    const { junctions, animationSpeed } = this.state;
    const allCars = [];

    junctions.forEach((junction, jIdx) => {
      const trafficCount = this.state[`c${jIdx + 1}`];
      const lightColor = this.state[`l${jIdx + 1}`];

      // Reduced number of cars for better performance -> Increased for better visuals as requested
      const numCars = Math.min(Math.floor(trafficCount / 3), 60);
      const spread = 0.008;

      const carColor = lightColor === 'green' ? '#10b981' :
        lightColor === 'yellow' ? '#f59e0b' : '#ef4444';

      for (let i = 0; i < numCars; i++) {
        const angle = (Math.PI * 2 * i) / numCars + Math.random() * 0.5;
        const distance = Math.random() * spread;

        const lat = junction.lat + Math.cos(angle) * distance;
        const lng = junction.lng + Math.sin(angle) * distance;

        allCars.push({
          id: `car-${jIdx}-${i}`,
          lat,
          lng,
          color: carColor,
          speed: lightColor === 'green' ? 'fast' : lightColor === 'yellow' ? 'normal' : 'slow'
        });
      }
    });

    return allCars;
  }

  async loadMLPredictions() {
    try {
      this.setState({ predictionLoaded: false });

      const { junctions } = this.state;
      const predictions = {};

      // Fetch predictions for all junctions in parallel
      const predictionPromises = junctions.map(async (junction) => {
        try {
          const response = await fetch('/api/predict/traffic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ junction_name: junction.key })
          });

          if (!response.ok) throw new Error('API Error');

          const data = await response.json();
          // Backend returns { junction: "...", predictions: [...] }
          // We need to format it to match the component's expected structure

          const hourlyData = data.predictions;
          const currentTraffic = hourlyData[0]?.traffic_volume || 100;
          const avgTraffic = Math.floor(hourlyData.reduce((sum, p) => sum + p.traffic_volume, 0) / 24);

          return {
            key: junction.key,
            data: {
              current_traffic: currentTraffic,
              predictions: hourlyData,
              avg_traffic_24h: avgTraffic,
              trend: hourlyData[1].traffic_volume > currentTraffic ? 'increasing' : 'stable'
            }
          };
        } catch (err) {
          console.warn(`Failed to fetch for ${junction.key}:`, err);
          return null;
        }
      });

      const results = await Promise.all(predictionPromises);

      results.forEach(res => {
        if (res) predictions[res.key] = res.data;
      });

      // If API completely fails, fall back to heuristics (but mark as offline)
      if (Object.keys(predictions).length === 0) {
        console.warn('⚠️ Using fallback data due to API failure');
        const fallback = this.generateFallbackData();
        this.setState({
          mlPredictions: fallback,
          predictionLoaded: true,
          lastUpdateTime: new Date()
        });
        this.initializeTrafficFromML(fallback);
        return fallback;
      }

      this.setState({
        mlPredictions: predictions,
        predictionLoaded: true,
        lastUpdateTime: new Date()
      });

      this.initializeTrafficFromML(predictions);
      return predictions;

    } catch (error) {
      console.error('❌ Failed to load ML predictions:', error);
      const fallback = this.generateFallbackData();
      this.setState({
        mlPredictions: fallback,
        predictionLoaded: true,
        lastUpdateTime: new Date()
      });
      this.initializeTrafficFromML(fallback);
      return fallback;
    }
  }

  generateFallbackData() {
    // Only used if backend is completely down
    return this.generateMLBasedPredictions();
  }

  initializeTrafficFromML(predictions) {
    const { junctions } = this.state;

    junctions.forEach((junction, idx) => {
      const predData = predictions[junction.key];
      if (predData) {
        this.setState({
          [`c${idx + 1}`]: predData.current_traffic
        });
      }
    });
  }

  generateMLBasedPredictions() {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    const isWeekend = currentDay === 0 || currentDay === 6;

    // Adjusted logic: Morning (8-11), Afternoon (12-16), Evening (17-21)
    const isMorningPeak = currentHour >= 8 && currentHour <= 11;
    const isEveningPeak = currentHour >= 17 && currentHour <= 21;
    const isAfternoon = currentHour >= 12 && currentHour <= 16;

    const isRushHour = isMorningPeak || isEveningPeak;

    // Increased base values and multipliers as per user request
    const baseTraffic = {
      'Silk Board': { base: 250, rushMultiplier: 1.8, weekendMultiplier: 1.5, afternoonMultiplier: 1.4 },
      'Marathahalli': { base: 280, rushMultiplier: 1.8, weekendMultiplier: 1.6, afternoonMultiplier: 1.45 },
      'Koramangala': { base: 240, rushMultiplier: 1.75, weekendMultiplier: 1.65, afternoonMultiplier: 1.4 },
      'MG Road': { base: 230, rushMultiplier: 1.7, weekendMultiplier: 1.7, afternoonMultiplier: 1.5 },
      'Whitefield': { base: 260, rushMultiplier: 1.75, weekendMultiplier: 1.4, afternoonMultiplier: 1.35 },
      'Electronic City': { base: 250, rushMultiplier: 1.8, weekendMultiplier: 1.3, afternoonMultiplier: 1.3 },
      'Pattanegre': { base: 220, rushMultiplier: 1.6, weekendMultiplier: 1.2, afternoonMultiplier: 1.25 }
    };

    const predictions = {};

    Object.keys(baseTraffic).forEach(area => {
      const config = baseTraffic[area];
      let traffic = config.base;

      if (isRushHour) traffic *= config.rushMultiplier;
      else if (isAfternoon) traffic *= config.afternoonMultiplier;

      // User request: "on weekends more vehicles"
      if (isWeekend) traffic *= config.weekendMultiplier;

      traffic += (Math.random() - 0.5) * traffic * 0.2;

      const hourlyPredictions = [];
      for (let h = 0; h < 24; h++) {
        const futureHour = (currentHour + h) % 24;
        const futureMorning = futureHour >= 8 && futureHour <= 11;
        const futureEvening = futureHour >= 17 && futureHour <= 21;
        const futureAfternoon = futureHour >= 12 && futureHour <= 16;

        const futureIsRush = futureMorning || futureEvening;

        let hourTraffic = config.base;
        if (futureIsRush) hourTraffic *= config.rushMultiplier;
        else if (futureAfternoon) hourTraffic *= config.afternoonMultiplier;

        if (isWeekend) hourTraffic *= config.weekendMultiplier;

        hourTraffic = Math.floor(hourTraffic + (Math.random() - 0.5) * 40);

        hourlyPredictions.push({
          hour: futureHour,
          traffic_volume: Math.max(80, hourTraffic),
          congestion_level: hourTraffic > 400 ? 'High' :
            hourTraffic > 250 ? 'Moderate' : 'Low'
        });
      }

      predictions[area] = {
        current_traffic: Math.floor(Math.max(80, traffic)),
        predictions: hourlyPredictions,
        avg_traffic_24h: Math.floor(
          hourlyPredictions.reduce((sum, p) => sum + p.traffic_volume, 0) / 24
        ),
        trend: isRushHour ? 'increasing' : 'stable'
      };
    });

    return predictions;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  calculateGreenTime(trafficVolume, totalTraffic) {
    const baseTime = 20;
    const maxTime = 60;
    let greenTime = (trafficVolume / totalTraffic) * 180;
    greenTime = Math.max(baseTime, Math.min(maxTime, greenTime));
    return Math.floor(greenTime);
  }

  async componentDidMount() {
    const predictions = await this.loadMLPredictions();
    this.startTrafficSimulation();

    this.carUpdateInterval = setInterval(() => {
      if (this.state.showCars) {
        const newPositions = this.generateCarPositions();
        this.setState({ carPositions: newPositions });
      }
    }, 3000);

    this.mlUpdateInterval = setInterval(() => {
      if (this.state.autoRefresh) {
        this.loadMLPredictions();
      }
    }, 300000);

    this.clockInterval = setInterval(() => {
      this.setState({ lastUpdateTime: new Date() });
    }, 10000); // Update every 10 seconds instead of 1 second
  }

  componentWillUnmount() {
    if (this.mlUpdateInterval) clearInterval(this.mlUpdateInterval);
    if (this.carUpdateInterval) clearInterval(this.carUpdateInterval);
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  async startTrafficSimulation() {
    const rand = (num) => Math.floor(Math.random() * num) + 1;

    const changeTraffic = (currentLane, trafficCounts) => {
      const updatedCounts = [...trafficCounts];

      for (let k = 0; k < 7; k++) {
        if (k === currentLane) {
          const decrease = Math.min(
            rand(Math.ceil(updatedCounts[k] / 3)),
            updatedCounts[k]
          );
          updatedCounts[k] = Math.max(0, updatedCounts[k] - decrease);
        } else {
          const increase = rand(6);
          updatedCounts[k] = Math.min(450, updatedCounts[k] + increase);
        }
      }

      return updatedCounts;
    };

    let laneIndex = 0;

    while (true) {
      let trafficCounts = [
        this.state.c1, this.state.c2, this.state.c3,
        this.state.c4, this.state.c5, this.state.c6, this.state.c7
      ];

      if (this.state.mlPredictions) {
        const { junctions } = this.state;
        junctions.forEach((junction, idx) => {
          const predData = this.state.mlPredictions[junction.key];
          if (predData) {
            const target = predData.current_traffic;
            const current = trafficCounts[idx];
            trafficCounts[idx] = Math.floor(current * 0.7 + target * 0.3);
          }
        });
      }

      for (let k = 0; k < 6; k++) {
        this.setState({ [`c${k + 1}`]: trafficCounts[k] });
      }

      const totalTraffic = trafficCounts.reduce((sum, val) => sum + val, 0);
      const greenTime = this.calculateGreenTime(trafficCounts[laneIndex], totalTraffic);

      this.setState({ [`l${laneIndex + 1}`]: 'green' });

      const cycles = Math.floor(greenTime / 3);
      for (let i = 0; i < cycles && trafficCounts[laneIndex] > 5; i++) {
        await this.sleep(3000);
        trafficCounts = changeTraffic(laneIndex, trafficCounts);
        for (let k = 0; k < 7; k++) {
          this.setState({ [`c${k + 1}`]: trafficCounts[k] });
        }
      }

      this.setState({ [`l${laneIndex + 1}`]: 'yellow' });
      await this.sleep(3000);

      this.setState({ [`l${laneIndex + 1}`]: 'red' });

      laneIndex = (laneIndex + 1) % 7;

      await this.sleep(1000);
    }
  }

  render() {
    const { junctions, mlPredictions, lastUpdateTime, showCars, carPositions,
      selectedJunction, mapStyle, autoRefresh } = this.state;

    const totalVehicles = mlPredictions ?
      Object.values(mlPredictions).reduce((sum, p) => sum + p.current_traffic, 0) : 0;

    const avgTraffic = mlPredictions ?
      Math.floor(Object.values(mlPredictions).reduce((sum, p) => sum + p.avg_traffic_24h, 0) / 7) : 0;

    return (
      <div style={styles.container}>
        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .junction-item {
            transition: all 0.15s ease;
          }
          .junction-item:hover {
            transform: translateX(-2px);
            box-shadow: 0 3px 12px rgba(0,0,0,0.1);
          }
          .control-btn {
            transition: all 0.15s ease;
          }
          .control-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .control-btn:active {
            transform: translateY(0);
          }
        `}</style>

        <GoogleMapReact
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          layerTypes={['TrafficLayer']}
          options={{
            styles: mapStyle === 'dark' ? darkMapStyle : defaultMapStyle,
            fullscreenControl: true,
            zoomControl: true,
            streetViewControl: false
          }}
          bootstrapURLKeys={{
            key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyC33R5XOIc8basuTtd74eFquIIAnuhWJGg',
            libraries: ['places', 'geometry']
          }}
        >
          {junctions.map((junction, jIdx) => (
            <div key={jIdx}>
              {junction.trafficLights.map((light, lIdx) => (
                <Trafficlight
                  key={`${jIdx}-${lIdx}`}
                  color={this.state[`l${jIdx + 1}`]}
                  count={lIdx === 0 ? this.state[`c${jIdx + 1}`] :
                    Math.floor(this.state[`c${jIdx + 1}`] * (0.8 + Math.random() * 0.2))}
                  lat={light.lat}
                  lng={light.lng}
                  name={lIdx === 0 ? junction.name : undefined}
                  congestionLevel={
                    this.state[`c${jIdx + 1}`] > 300 ? 'High' :
                      this.state[`c${jIdx + 1}`] > 200 ? 'Moderate' : 'Low'
                  }
                />
              ))}
            </div>
          ))}

          {showCars && carPositions.map(car => (
            <CarMarker
              key={car.id}
              lat={car.lat}
              lng={car.lng}
              color={car.color}
              speed={car.speed}
            />
          ))}
        </GoogleMapReact>

        {/* Enhanced Info Panel */}
        <div style={styles.infoPanel}>
          {/* Header */}
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>
                🚦 Bangalore Live Traffic
              </h3>
              <p style={styles.subtitle}>Real-time ML-Powered System</p>
            </div>
            <div style={styles.badges}>
              <div style={styles.mlBadge}>
                <span style={{ fontSize: '14px' }}>🤖</span>
                <span>ML Active</span>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div style={styles.controlPanel}>
            <button
              className="control-btn"
              onClick={() => {
                const newShowCars = !showCars;
                this.setState({ showCars: newShowCars });
                if (newShowCars) {
                  this.setState({ carPositions: this.generateCarPositions() });
                }
              }}
              style={{
                ...styles.controlButton,
                background: showCars ?
                  'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                  'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
              }}
            >
              <span style={{ fontSize: '16px' }}>{showCars ? '🚗' : '🚫'}</span>
              <span>{showCars ? 'Cars ON' : 'Cars OFF'}</span>
            </button>

            <button
              className="control-btn"
              onClick={() => this.setState({ autoRefresh: !autoRefresh })}
              style={{
                ...styles.controlButton,
                background: autoRefresh ?
                  'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
                  'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
              }}
            >
              <span style={{ fontSize: '16px' }}>🔄</span>
              <span>{autoRefresh ? 'Auto' : 'Manual'}</span>
            </button>

            <button
              className="control-btn"
              onClick={() => this.loadMLPredictions()}
              style={{
                ...styles.controlButton,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
              }}
            >
              <span style={{ fontSize: '16px' }}>⚡</span>
              <span>Refresh</span>
            </button>
          </div>

          {/* Live Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>🚗</div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Total Vehicles</div>
                <div style={styles.statValue}>{totalVehicles.toLocaleString()}</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>📊</div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>24h Average</div>
                <div style={styles.statValue}>{avgTraffic.toLocaleString()}</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>👁️</div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Cars Visible</div>
                <div style={styles.statValue}>{carPositions.length}</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>⏰</div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Last Update</div>
                <div style={{ ...styles.statValue, fontSize: '13px' }}>
                  {lastUpdateTime.toLocaleTimeString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Junction List */}
          <div style={styles.junctionSection}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>Major Junctions</span>
              <span style={styles.sectionBadge}>Live</span>
            </div>

            <div style={styles.junctionList}>
              {junctions.map((junction, idx) => {
                const lightColor = this.state[`l${idx + 1}`];
                const traffic = this.state[`c${idx + 1}`];
                const congestion = traffic > 300 ? 'High' : traffic > 200 ? 'Moderate' : 'Low';
                const isSelected = selectedJunction === idx;

                return (
                  <div
                    key={idx}
                    className="junction-item"
                    onClick={() => this.setState({
                      selectedJunction: isSelected ? null : idx
                    })}
                    style={{
                      ...styles.junctionItem,
                      background: isSelected ? '#f3f4f6' : '#ffffff',
                      border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb'
                    }}
                  >
                    <div style={styles.junctionIcon}>{junction.icon}</div>

                    <div style={{ flex: 1 }}>
                      <div style={styles.junctionHeader}>
                        <span style={styles.junctionName}>{junction.name}</span>
                        <div style={{
                          ...styles.lightIndicator,
                          background: lightColor === 'green' ? '#10b981' :
                            lightColor === 'yellow' ? '#f59e0b' : '#ef4444',
                          boxShadow: `0 0 12px ${lightColor === 'green' ? '#10b981' :
                            lightColor === 'yellow' ? '#f59e0b' : '#ef4444'}`
                        }} />
                      </div>

                      <div style={styles.junctionDesc}>{junction.description}</div>

                      <div style={styles.junctionMetrics}>
                        <div style={styles.metricItem}>
                          <span style={styles.metricIcon}>🚗</span>
                          <span style={styles.metricValue}>{traffic}</span>
                        </div>

                        <div style={{
                          ...styles.congestionBadge,
                          background: congestion === 'High' ? '#fef2f2' :
                            congestion === 'Moderate' ? '#fef9c3' : '#f0fdf4',
                          color: congestion === 'High' ? '#dc2626' :
                            congestion === 'Moderate' ? '#ca8a04' : '#16a34a',
                          border: `1px solid ${congestion === 'High' ? '#fecaca' :
                            congestion === 'Moderate' ? '#fde047' : '#bbf7d0'}`
                        }}>
                          {congestion}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <div style={styles.footerBrand}>
              <span style={styles.footerIcon}>⚡</span>
              <span style={styles.footerTitle}>FlowGuard AI</span>
            </div>
            <div style={styles.footerInfo}>
              <div style={styles.footerText}>Bangalore Pulse Dataset</div>
              <div style={styles.footerText}>Multi-Linear Regression ML</div>
            </div>
            <div style={styles.systemStatus}>
              <span style={styles.statusDot}></span>
              <span style={styles.statusText}>System Online</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100vh'
  },
  infoPanel: {
    position: 'absolute',
    top: 20,
    right: 20,
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    minWidth: '340px',
    maxWidth: '380px',
    maxHeight: '90vh',
    overflowY: 'auto',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.6)',
    animation: 'slideIn 0.3s ease-out'
  },
  panelHeader: {
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb'
  },
  panelTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#111827',
    fontWeight: '700',
    letterSpacing: '-0.3px'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500'
  },
  badges: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px'
  },
  mlBadge: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
  },
  controlPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '16px'
  },
  controlButton: {
    padding: '10px 6px',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontWeight: '600',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '16px'
  },
  statCard: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  statIcon: {
    fontSize: '24px',
    lineHeight: 1
  },
  statContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  statLabel: {
    fontSize: '9px',
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statValue: {
    fontSize: '18px',
    color: '#111827',
    fontWeight: '700',
    lineHeight: 1.2
  },
  junctionSection: {
    marginBottom: '16px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  sectionTitle: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  sectionBadge: {
    background: '#dc2626',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '8px',
    fontSize: '9px',
    fontWeight: '600'
  },
  junctionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  junctionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  },
  junctionIcon: {
    fontSize: '28px',
    lineHeight: 1,
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
  },
  junctionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3px'
  },
  junctionName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    letterSpacing: '-0.2px'
  },
  lightIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transition: 'all 0.2s ease'
  },
  junctionDesc: {
    fontSize: '11px',
    color: '#9ca3af',
    marginBottom: '6px',
    fontWeight: '500'
  },
  junctionMetrics: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  metricIcon: {
    fontSize: '13px'
  },
  metricValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151'
  },
  congestionBadge: {
    fontSize: '9px',
    padding: '3px 8px',
    borderRadius: '8px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  footer: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  footerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    justifyContent: 'center'
  },
  footerIcon: {
    fontSize: '18px'
  },
  footerTitle: {
    fontSize: '15px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  footerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    alignItems: 'center'
  },
  footerText: {
    fontSize: '10px',
    color: '#9ca3af',
    fontWeight: '500'
  },
  systemStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    justifyContent: 'center',
    padding: '6px 12px',
    background: '#f0fdf4',
    borderRadius: '8px',
    border: '1px solid #bbf7d0'
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#16a34a',
    boxShadow: '0 0 8px #16a34a'
  },
  statusText: {
    fontSize: '10px',
    color: '#16a34a',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  }
};

const defaultMapStyle = [
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7c93a3' }, { lightness: '-10' }]
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#374151' }]
  },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [{ color: '#e5e7eb' }]
  },
  {
    featureType: 'poi',
    elementType: 'geometry.fill',
    stylers: [{ color: '#d1d5db' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#c7d2fe' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#a5b4fc' }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.fill',
    stylers: [{ color: '#f3f4f6' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#bfdbfe' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry.fill',
    stylers: [{ color: '#e0e7ff' }]
  }
];

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#212121' }]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#212121' }]
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#757575' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#181818' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2c2c2c' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3c3c3c' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }]
  }
];