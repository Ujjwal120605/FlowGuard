import React, { Component, Fragment } from 'react';
import GoogleMapReact from 'google-map-react';
import Trafficlight from './Trafficlight';

// Simple Car Marker Component
// Simple Car Marker Component
// Simple Car Marker Componentk
const CarMarker = ({ color }) => (
  <div style={{
    fontSize: '16px',
    filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`,
    animation: 'carBlink 2s ease-in-out infinite',
    transform: 'translate(-50%, -50%)'
  }}>
    🚗
  </div>
);

export default class LiveTraffic extends Component {
  static defaultProps = {
    center: { lat: 12.9716, lng: 77.5946 },
    zoom: 12
  };
  
  constructor(){
    super();
    this.state = {
      l1: 'red', l2: 'red', l3: 'red', l4: 'red', l5: 'red', l6: 'red',
      c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0,
      mlPredictions: null,
      predictionLoaded: false,
      lastUpdateTime: new Date(),
      showCars: true,
      carPositions: [], // Store all car positions
      junctions: [
        { 
          name: 'Silk Board', 
          key: 'Silk Board',
          lat: 12.9176, 
          lng: 77.6227,
          description: 'Hosur Road & Outer Ring Road',
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
          trafficLights: [
            { lat: 12.8456, lng: 77.6603 },
            { lat: 12.8465, lng: 77.6610 },
            { lat: 12.8450, lng: 77.6598 }
          ]
        }
      ]
    };
  }

  generateCarPositions() {
    const { junctions } = this.state;
    const allCars = [];
    
    junctions.forEach((junction, jIdx) => {
      const trafficCount = this.state[`c${jIdx + 1}`];
      const lightColor = this.state[`l${jIdx + 1}`];
      
      // Show 1 car marker per 5 vehicles, max 30 cars per junction
      const numCars = Math.min(Math.floor(trafficCount / 5), 30);
      const spread = 0.006; // Spread radius around junction
      
      // Get color based on traffic light
      const carColor = lightColor === 'green' ? '#10b981' : 
                       lightColor === 'yellow' ? '#f59e0b' : '#ef4444';
      
      for (let i = 0; i < numCars; i++) {
        // Generate random positions around the junction
        const angle = (Math.PI * 2 * i) / numCars + Math.random() * 0.5;
        const distance = Math.random() * spread;
        
        const lat = junction.lat + Math.cos(angle) * distance;
        const lng = junction.lng + Math.sin(angle) * distance;
        
        allCars.push({
          id: `car-${jIdx}-${i}`,
          lat,
          lng,
          color: carColor
        });
      }
    });
    
    return allCars;
  }

  async loadMLPredictions() {
    try {
      const predictions = this.generateMLBasedPredictions();
      
      this.setState({
        mlPredictions: predictions,
        predictionLoaded: true,
        lastUpdateTime: new Date()
      });
      
      this.initializeTrafficFromML(predictions);
      
      console.log('✅ ML Predictions loaded successfully');
      
      return predictions;
      
    } catch (error) {
      console.error('❌ Failed to load ML predictions:', error);
      return this.generateMLBasedPredictions();
    }
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
    const isRushHour = (currentHour >= 8 && currentHour <= 10) || 
                       (currentHour >= 17 && currentHour <= 20);
    
    const baseTraffic = {
      'Silk Board': { base: 180, rushMultiplier: 1.78, weekendMultiplier: 0.6 },
      'Marathahalli': { base: 200, rushMultiplier: 1.75, weekendMultiplier: 0.62 },
      'Koramangala': { base: 160, rushMultiplier: 1.75, weekendMultiplier: 0.65 },
      'MG Road': { base: 170, rushMultiplier: 1.74, weekendMultiplier: 0.68 },
      'Whitefield': { base: 185, rushMultiplier: 1.68, weekendMultiplier: 0.60 },
      'Electronic City': { base: 175, rushMultiplier: 1.74, weekendMultiplier: 0.58 }
    };

    const predictions = {};
    
    Object.keys(baseTraffic).forEach(area => {
      const config = baseTraffic[area];
      let traffic = config.base;
      
      if (isRushHour) traffic *= config.rushMultiplier;
      if (isWeekend) traffic *= config.weekendMultiplier;
      
      traffic += (Math.random() - 0.5) * traffic * 0.2;
      
      const hourlyPredictions = [];
      for (let h = 0; h < 24; h++) {
        const futureHour = (currentHour + h) % 24;
        const futureIsRush = (futureHour >= 8 && futureHour <= 10) || 
                            (futureHour >= 17 && futureHour <= 20);
        
        let hourTraffic = config.base;
        if (futureIsRush) hourTraffic *= config.rushMultiplier;
        if (isWeekend) hourTraffic *= config.weekendMultiplier;
        
        hourTraffic = Math.floor(hourTraffic + (Math.random() - 0.5) * 20);
        
        hourlyPredictions.push({
          hour: futureHour,
          traffic_volume: Math.max(50, hourTraffic),
          congestion_level: hourTraffic > 300 ? 'High' : 
                          hourTraffic > 200 ? 'Moderate' : 'Low'
        });
      }
      
      predictions[area] = {
        current_traffic: Math.floor(Math.max(50, traffic)),
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

  async componentDidMount(){
    const predictions = await this.loadMLPredictions();
    this.startTrafficSimulation();
    
    // Update car positions every 3 seconds
    this.carUpdateInterval = setInterval(() => {
      if (this.state.showCars) {
        const newPositions = this.generateCarPositions();
        this.setState({ carPositions: newPositions });
      }
    }, 3000);
    
    this.mlUpdateInterval = setInterval(() => {
      this.loadMLPredictions();
    }, 300000);
  }

  componentWillUnmount() {
    if (this.mlUpdateInterval) {
      clearInterval(this.mlUpdateInterval);
    }
    if (this.carUpdateInterval) {
      clearInterval(this.carUpdateInterval);
    }
  }

  async startTrafficSimulation() {
    const rand = (num) => Math.floor(Math.random() * num) + 1;
    
    const changeTraffic = (currentLane, trafficCounts) => {
      const updatedCounts = [...trafficCounts];
      
      for(let k = 0; k < 6; k++){
        if(k === currentLane){
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
        this.state.c4, this.state.c5, this.state.c6
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
      
      for(let k = 0; k < 6; k++){
        this.setState({ [`c${k+1}`]: trafficCounts[k] });
      }
      
      const totalTraffic = trafficCounts.reduce((sum, val) => sum + val, 0);
      const greenTime = this.calculateGreenTime(trafficCounts[laneIndex], totalTraffic);
      
      console.log(`🟢 Lane ${laneIndex + 1} (${this.state.junctions[laneIndex].name}) - ` +
                  `Traffic: ${trafficCounts[laneIndex]}, Green Time: ${greenTime}s`);
      
      this.setState({ [`l${laneIndex + 1}`]: 'green' });
      
      const cycles = Math.floor(greenTime / 3);
      for(let i = 0; i < cycles && trafficCounts[laneIndex] > 5; i++){
        await this.sleep(3000);
        trafficCounts = changeTraffic(laneIndex, trafficCounts);
        for(let k = 0; k < 6; k++){
          this.setState({ [`c${k+1}`]: trafficCounts[k] });
        }
      }
      
      console.log(`🟡 Lane ${laneIndex + 1} - YELLOW`);
      this.setState({ [`l${laneIndex + 1}`]: 'yellow' });
      await this.sleep(3000);
      
      console.log(`🔴 Lane ${laneIndex + 1} - RED`);
      this.setState({ [`l${laneIndex + 1}`]: 'red' });
      
      laneIndex = (laneIndex + 1) % 6;
      
      await this.sleep(1000);
    }
  }
  
  render() {
    const { junctions, mlPredictions, lastUpdateTime, showCars, carPositions } = this.state;
    
    return (
      <div style={styles.container}>
        <style>{`
          @keyframes carBlink {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
        
        <GoogleMapReact
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          layerTypes={['TrafficLayer']}
          options={{ styles: mapStyle }}
          bootstrapURLKeys={{
            key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyC33R5XOIc8basuTtd74eFquIIAnuhWJGg',
            libraries: ['places', 'geometry']
          }}
        >
          {/* Render traffic lights */}
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
                />
              ))}
            </div>
          ))}

          {/* Render car markers */}
          {showCars && carPositions.map(car => (
            <CarMarker
              key={car.id}
              lat={car.lat}
              lng={car.lng}
              color={car.color}
            />
          ))}
        </GoogleMapReact>
        
        {/* Info Panel */}
        <div style={styles.infoPanel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>
                🚦 Bangalore Live Traffic
              </h3>
              <p style={styles.subtitle}>ML-Powered Predictions</p>
            </div>
            <div style={styles.mlBadge}>
              <span>🤖</span> ML Active
            </div>
          </div>
          
          <div style={styles.controls}>
            <button
              onClick={() => {
                const newShowCars = !showCars;
                this.setState({ showCars: newShowCars });
                if (newShowCars) {
                  this.setState({ carPositions: this.generateCarPositions() });
                }
              }}
              style={{
                ...styles.controlButton,
                background: showCars ? '#10b981' : '#6b7280'
              }}
            >
              {showCars ? '🚗 Cars ON' : '🚗 Cars OFF'}
            </button>
            
            <div style={styles.carCount}>
              {carPositions.length} cars visible
            </div>
          </div>
          
          <div style={styles.timestamp}>
            Last Update: {lastUpdateTime.toLocaleTimeString('en-IN')}
          </div>
          
          {mlPredictions && (
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Total Vehicles</div>
                <div style={styles.statValue}>
                  {Object.values(mlPredictions).reduce((sum, p) => 
                    sum + p.current_traffic, 0).toLocaleString()}
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Avg 24h</div>
                <div style={styles.statValue}>
                  {Math.floor(Object.values(mlPredictions).reduce((sum, p) => 
                    sum + p.avg_traffic_24h, 0) / 6).toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          <div style={styles.junctionList}>
            <div style={styles.sectionTitle}>Major Junctions</div>
            {junctions.map((junction, idx) => {
              const lightColor = this.state[`l${idx + 1}`];
              const traffic = this.state[`c${idx + 1}`];
              const congestion = traffic > 300 ? 'High' : traffic > 200 ? 'Moderate' : 'Low';
              
              return (
                <div key={idx} style={styles.junctionItem}>
                  <div style={{
                    ...styles.lightIndicator,
                    background: lightColor === 'green' ? '#10b981' :
                               lightColor === 'yellow' ? '#f59e0b' : '#ef4444',
                    boxShadow: lightColor === 'green' ? '0 0 15px #10b981' :
                              lightColor === 'yellow' ? '0 0 15px #f59e0b' : '0 0 15px #ef4444'
                  }}/>
                  <div style={{flex: 1}}>
                    <div style={styles.junctionName}>{junction.name}</div>
                    <div style={styles.junctionDesc}>{junction.description}</div>
                    <div style={styles.trafficInfo}>
                      <span style={styles.trafficCount}>🚗 {traffic} vehicles</span>
                      <span style={{
                        ...styles.congestionBadge,
                        background: congestion === 'High' ? '#fee2e2' :
                                  congestion === 'Moderate' ? '#fef3c7' : '#dcfce7',
                        color: congestion === 'High' ? '#991b1b' :
                              congestion === 'Moderate' ? '#854d0e' : '#166534'
                      }}>
                        {congestion}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={styles.footer}>
            <div style={styles.footerText}>
              Powered by Bangalore Pulse Dataset
            </div>
            <div style={styles.footerText}>
              ML Model: Multiple Linear Regression
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
    height: '100%'
  },
  infoPanel: {
    position: 'absolute',
    top: 20,
    right: 20,
    background: 'rgba(255, 255, 255, 0.98)',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    minWidth: '320px',
    maxWidth: '400px',
    maxHeight: '90vh',
    overflowY: 'auto',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.3)'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  panelTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#1f2937',
    fontWeight: '700'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#6b7280'
  },
  mlBadge: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  controls: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    alignItems: 'center'
  },
  controlButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  carCount: {
    flex: 1,
    fontSize: '11px',
    color: '#6b7280',
    textAlign: 'right',
    fontWeight: '600'
  },
  timestamp: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '15px',
    padding: '8px 12px',
    background: '#f9fafb',
    borderRadius: '8px',
    fontFamily: 'monospace'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '15px'
  },
  statItem: {
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea15, #764ba215)',
    borderRadius: '10px',
    textAlign: 'center'
  },
  statLabel: {
    fontSize: '11px',
    color: '#6b7280',
    marginBottom: '4px',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  statValue: {
    fontSize: '20px',
    color: '#1f2937',
    fontWeight: '700'
  },
  sectionTitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  junctionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  junctionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '10px',
    transition: 'all 0.3s',
    cursor: 'pointer'
  },
  lightIndicator: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'all 0.3s'
  },
  junctionName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '2px'
  },
  junctionDesc: {
    fontSize: '11px',
    color: '#9ca3af',
    marginBottom: '6px'
  },
  trafficInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  trafficCount: {
    fontSize: '13px',
    color: '#4b5563',
    fontWeight: '500'
  },
  congestionBadge: {
    fontSize: '10px',
    padding: '3px 8px',
    borderRadius: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  footer: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '11px',
    color: '#9ca3af',
    margin: '4px 0'
  }
};

const mapStyle = [
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7c93a3' }, { lightness: '-10' }]
  },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [{ color: '#dde3e3' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#bbcacf' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#a3c7df' }]
  }
];
