import React from 'react';
import './SideNav.css';

const SideNav = ({ activeSlide, onDotClick }) => {
  const navItems = [
    { id: 'slide-home', title: 'Home' },
    { id: 'slide-care', title: 'Care' },
    { id: 'slide-consult', title: 'Consult' },
    { id: 'slide-connect', title: 'Connect' },
    { id: 'slide-courses', title: 'Courses' }
  ];

  return (
    <div className="side-nav" id="side-nav">
      {navItems.map(item => (
        <div
          key={item.id}
          className={`dot ${activeSlide === item.id ? 'active' : ''}`}
          data-target={item.id}
          title={item.title}
          onClick={() => onDotClick(item.id)}
        />
      ))}
    </div>
  );
};

export default SideNav;