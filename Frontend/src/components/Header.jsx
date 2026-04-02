import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ activeSlide, onNavClick, headerRef }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'slide-home', label: 'Home' },
    { id: 'slide-care', label: 'Care' },
    { id: 'slide-consult', label: 'Consult' },
    { id: 'slide-connect', label: 'Connect' },
    { id: 'slide-courses', label: 'Modules' }
  ];

  const handleNavClick = (id) => {
    // If user is on Login/Register page, go home first, then scroll
    if (location.pathname !== '/') {
      navigate('/');
      // Small timeout to allow the home page to load before scrolling
      setTimeout(() => onNavClick(id), 100);
    } else {
      onNavClick(id);
    }
  };

  return (
    <header id="main-header" className={location.pathname !== '/' ? 'scrolled' : ''} ref={headerRef}>
      <div className="logo-wrap" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src="/images/Logo.png" alt="RoboHub Logo" />
      </div>

      <nav id="top-nav">
        {location.pathname === '/' && navItems.map(item => (
          <button
            key={item.id}
            className={activeSlide === item.id ? 'active' : ''}
            onClick={() => handleNavClick(item.id)}
            type="button"  // important to prevent form submission if inside a form
          >
            {item.label}
          </button>
        ))}

        <div className="auth-nav-buttons">
          <button className="btn-nav-login" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="btn-nav-register" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;