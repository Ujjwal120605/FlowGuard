import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge } from 'antd';
import Logo from './Logo';
import traffic_icon from '../../images/traffic_icon.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [selectedKey, setSelectedKey] = useState('1');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set selected key based on current route
    const path = location.pathname;
    if (path === '/livetraffic') setSelectedKey('1');
    else if (path === '/stats') setSelectedKey('3');
    else if (path === '/fine') setSelectedKey('4');
    else if (path === '/vehicleRegisteration') setSelectedKey('5');
    else if (path === '/routes') setSelectedKey('2');
  }, [location.pathname]);

  return (
    <Layout.Sider
      style={styles.sider}
      width={280}
    >
      {/* Header Section */}
      <div style={styles.header}>
        <Logo />
        <div style={styles.projectTitle}>
          <h2 style={styles.mainTitle}>FlowGuard AI</h2>
          <p style={styles.subtitle}>Intelligent Traffic Management System by Ujjwal Bajpai</p>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider}></div>

      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/landing')}
        style={{
          width: '90%',
          margin: '16px auto',
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #5227FF 0%, #7c3aed 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(82, 39, 255, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(82, 39, 255, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 39, 255, 0.3)';
        }}
      >
        ← Back to Home
      </button>

      {/* Navigation Menu */}
      <Menu
        style={styles.menu}
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={({ key }) => setSelectedKey(key)}
      >
        <Menu.Item key="1" style={styles.menuItem}>
          <Link to="/livetraffic" style={styles.menuLink}>
            <div style={styles.menuItemContent}>
              <div style={styles.iconWrapper}>
                <img src={traffic_icon} style={styles.icon} alt="Live Traffic" />
              </div>
              <div style={styles.textWrapper}>
                <span style={styles.menuText}>Live Traffic Monitor</span>
                <span style={styles.menuDescription}>Real-time traffic surveillance</span>
              </div>
            </div>
          </Link>
        </Menu.Item>

        <Menu.Item key="2" style={styles.menuItem}>
          <Link to="/routes" style={styles.menuLink}>
            <div style={styles.menuItemContent}>
              <div style={styles.iconWrapper}>
                <img
                  src='https://image.flaticon.com/icons/svg/149/149058.svg'
                  style={styles.icon}
                  alt="Route Optimizer"
                />
              </div>
              <div style={styles.textWrapper}>
                <span style={styles.menuText}>Route Optimizer</span>
                <span style={styles.menuDescription}>Navigation & alternate routes</span>
              </div>
              <Badge
                count="NEW"
                style={{
                  backgroundColor: '#ff4d4f',
                  fontSize: '10px',
                  height: '18px',
                  lineHeight: '18px',
                  marginLeft: 'auto'
                }}
              />
            </div>
          </Link>
        </Menu.Item>

        <Menu.Item key="3" style={styles.menuItem}>
          <Link to="/stats" style={styles.menuLink}>
            <div style={styles.menuItemContent}>
              <div style={styles.iconWrapper}>
                <img
                  src='https://image.flaticon.com/icons/svg/138/138351.svg'
                  style={styles.icon}
                  alt="Statistics"
                />
              </div>
              <div style={styles.textWrapper}>
                <span style={styles.menuText}>Analytics Dashboard</span>
                <span style={styles.menuDescription}>Traffic insights & predictions</span>
              </div>
              <Badge
                count="ML"
                style={{
                  backgroundColor: '#52c41a',
                  fontSize: '10px',
                  height: '18px',
                  lineHeight: '18px',
                  marginLeft: 'auto'
                }}
              />
            </div>
          </Link>
        </Menu.Item>

        <Menu.Item key="4" style={styles.menuItem}>
          <Link to="/fine" style={styles.menuLink}>
            <div style={styles.menuItemContent}>
              <div style={styles.iconWrapper}>
                <img
                  src='https://image.flaticon.com/icons/svg/584/584035.svg'
                  style={styles.icon}
                  alt="Fine"
                />
              </div>
              <div style={styles.textWrapper}>
                <span style={styles.menuText}>Violation Management</span>
                <span style={styles.menuDescription}>Fine processing & records</span>
              </div>
            </div>
          </Link>
        </Menu.Item>

        <Menu.Item key="5" style={styles.menuItem}>
          <Link to="/vehicleRegisteration" style={styles.menuLink}>
            <div style={styles.menuItemContent}>
              <div style={styles.iconWrapper}>
                <img
                  style={styles.icon}
                  src={require('./register.svg')}
                  alt="Registration"
                />
              </div>
              <div style={styles.textWrapper}>
                <span style={styles.menuText}>Vehicle Registry</span>
                <span style={styles.menuDescription}>Registration & database</span>
              </div>
            </div>
          </Link>
        </Menu.Item>
      </Menu>

      {/* Footer Section */}
      <div style={styles.footer}>
        <div style={styles.statusIndicator}>
          <div style={styles.statusDot}></div>
          <span style={styles.statusText}>System Online</span>
        </div>
        <div style={styles.versionInfo}>
          <span style={styles.versionText}>v2.4.0</span>
        </div>
      </div>
    </Layout.Sider>
  );
};

const styles = {
  sider: {
    height: '100vh',
    background: 'rgba(10, 10, 21, 0.6)', // Semi-transparent dark background
    backdropFilter: 'blur(15px)',        // Glassmorphism blur
    WebkitBackdropFilter: 'blur(15px)',  // Safari support
    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)',
    position: 'relative',
    overflow: 'hidden',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)' // Subtle border
  },
  header: {
    padding: '24px 20px 16px 20px',
    borderBottom: '1px solid rgba(145, 145, 216, 0.1)'
  },
  projectTitle: {
    marginTop: '16px',
    textAlign: 'center'
  },
  mainTitle: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '0.5px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    color: '#9191d8',
    fontSize: '11px',
    margin: '4px 0 0 0',
    fontWeight: '500',
    letterSpacing: '0.5px',
    opacity: 0.8
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, #667eea 50%, transparent 100%)',
    margin: '0 20px',
    opacity: 0.3
  },
  menu: {
    background: 'transparent',
    border: 'none',
    padding: '20px 16px',
    marginTop: '8px'
  },
  menuItem: {
    height: 'auto',
    lineHeight: 'normal',
    padding: '0',
    margin: '0 0 12px 0',
    background: 'transparent',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    border: '1px solid transparent'
  },
  menuLink: {
    display: 'block',
    padding: '14px 16px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(145, 145, 216, 0.1)',
    transition: 'all 0.3s ease',
    ':hover': {
      background: 'rgba(102, 126, 234, 0.15)',
      borderColor: 'rgba(102, 126, 234, 0.4)',
      transform: 'translateX(4px)'
    }
  },
  menuItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
    borderRadius: '10px',
    flexShrink: 0
  },
  icon: {
    width: '22px',
    height: '22px',
    filter: 'brightness(0) invert(1)',
    opacity: 0.9
  },
  textWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0
  },
  menuText: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '2px',
    letterSpacing: '0.2px'
  },
  menuDescription: {
    color: '#9191d8',
    fontSize: '11px',
    fontWeight: '400',
    opacity: 0.7,
    letterSpacing: '0.2px'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '20px',
    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, transparent 100%)',
    borderTop: '1px solid rgba(145, 145, 216, 0.1)'
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#52c41a',
    boxShadow: '0 0 8px rgba(82, 196, 26, 0.6)',
    animation: 'pulse 2s infinite'
  },
  statusText: {
    color: '#9191d8',
    fontSize: '12px',
    fontWeight: '500'
  },
  versionInfo: {
    textAlign: 'center'
  },
  versionText: {
    color: '#6b6b9d',
    fontSize: '11px',
    fontWeight: '500'
  }
};

// Add keyframes animation for pulse effect
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .ant-menu-item-selected {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%) !important;
    border: 1px solid rgba(102, 126, 234, 0.5) !important;
  }

  .ant-menu-item-selected::after {
    border-right: 3px solid #667eea !important;
  }

  .ant-menu-item:hover {
    background: rgba(102, 126, 234, 0.15) !important;
    transform: translateX(4px);
  }

  .ant-menu-inline .ant-menu-item::after {
    border-right: none !important;
  }
`;
document.head.appendChild(styleSheet);

export default Sidebar;