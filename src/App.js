import React, { Component } from 'react';
import { Layout } from 'antd';
import { Route, Routes, Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar/Sidebar';
import LiveTraffic from './components/Model/LiveTraffic';
import Simulate from './components/Model/Simulate';
// import Heatmap from './components/LiveTraffic/Heatmap'; // Deleted
import Statistics from './components/Model/Statistics';
import Fine from './components/Fine/Fine';
import RegisterationForm from './components/registerationForm/registration'; // Restored
import RouteOptimizer from './components/Model/RouteOptimizer';

import LandingPage from './components/Landingpage';  // ⭐ Import your new landing page

const { Header, Content } = Layout;

class App extends Component {
  render() {
    return (
      <Routes>

        {/* ⭐ Redirect root (/) to landing page */}
        <Route path="/" element={<Navigate to="/landing" />} />

        {/* ⭐ Landing page WITHOUT sidebar/header */}
        <Route path="/landing" element={<LandingPage />} />

        {/* ⭐ Dashboard layout for all app pages */}
        <Route
          path="/*"
          element={
            <Layout style={{ flexDirection: 'row' }}>
              <Sidebar />

              <Layout style={styles.header}>
                <Header
                  style={{
                    padding: '0 30px',
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 100,
                    backgroundColor: '#17172f'
                  }}
                >
                  Dashboard
                </Header>

                <Content style={{ padding: 20 }}>
                  <div style={styles.card} className="glass-card">
                    <Routes>
                      <Route path="/livetraffic" element={<LiveTraffic />} />
                      <Route path="/vehicleRegisteration" element={<RegisterationForm />} />
                      {/* <Route path="/heatmap" element={<Heatmap />} /> */}
                      <Route path="/stats" element={<Statistics />} />
                      <Route path="/sim" element={<Simulate />} />
                      <Route path="/fine" element={<Fine />} />
                      <Route path="/routes" element={<RouteOptimizer />} />
                    </Routes>
                  </div>
                </Content>
              </Layout>
            </Layout>
          }
        />

      </Routes>
    );
  }
}

const styles = {
  card: {
    width: '100%',
    height: 'calc(90vh)',
    // Glassmorphism applied via CSS class 'glass-card'
    // background: 'white', // Removed
    // boxShadow: '0px 2px 15px rgba(0,0,0,.2)', // Removed
    // borderRadius: '3px' // Removed
  },
  header: {
    backgroundColor: 'transparent', // Let the body background show through
  }
};

export default App;
