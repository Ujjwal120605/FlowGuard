import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DotGrid from './Dotgrid';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleGetStarted = () => {
    navigate('/livetraffic');
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0933 50%, #0a0a1e 100%)',
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      
      {/* DotGrid Background - Full Screen */}
      <DotGrid
        dotSize={10}
        gap={20}
        baseColor="#5227FF"
        activeColor="#a78bfa"
        proximity={150}
        speedTrigger={100}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />

      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) translateY(${isVisible ? '0' : '30px'})`,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isVisible ? 1 : 0,
        transition: 'all 1s ease-out',
        width: '100%',
        padding: '20px'
      }}>
        
        {/* Title */}
        <h1 style={{
          fontSize: '80px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #5227FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '20px',
          textAlign: 'center',
          letterSpacing: '-2px',
          textShadow: '0 0 80px rgba(82, 39, 255, 0.5)',
          margin: '0 0 20px 0'
        }}>
          FlowGuard AI
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '20px',
          color: '#a78bfa',
          marginBottom: '50px',
          textAlign: 'center',
          fontWeight: '300',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          margin: '0 0 50px 0'
        }}>
          Intelligent Traffic Management System
        </p>

        {/* Get Started Button */}
        <button
          onClick={handleGetStarted}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px) scale(1.05)';
            e.target.style.boxShadow = '0 20px 40px rgba(82, 39, 255, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 10px 30px rgba(82, 39, 255, 0.4)';
          }}
          style={{
            padding: '18px 50px',
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #5227FF 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 30px rgba(82, 39, 255, 0.4)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            margin: '0 0 60px 0'
          }}
        >
          Get Started
        </button>

        {/* Feature Pills */}
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '800px'
        }}>
          {['Real-time Monitoring', 'ML-Powered Analytics', 'Route Optimization'].map((feature, idx) => (
            <div key={idx} style={{
              padding: '10px 24px',
              background: 'rgba(82, 39, 255, 0.1)',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              borderRadius: '30px',
              color: '#a78bfa',
              fontSize: '14px',
              fontWeight: '500',
              backdropFilter: 'blur(10px)'
            }}>
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;