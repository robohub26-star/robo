import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Components
import Header from './components/Header';
import SideNav from './components/SideNav';
import Footer from './components/Footer';

// Authentication
import Login from './auth/Login';
import Register from './auth/Register';

// Landing Page
import StudentDashboard from './components/Student_Dashboard';
import MentorDashboard from './components/Mentor_Dashboard';

// Import Slides
import HomeSlide from './components/slides/HomeSlide';
import Ros2Slide from './components/slides/Ros2Slide';
import CareSlide from './components/slides/CareSlide';
import ConsultSlide from './components/slides/ConsultSlide';
import ConnectSlide from './components/slides/ConnectSlide';
import CoursesSlide from './components/slides/CoursesSlide';

// Import Hooks & Styles
import { useScrollSpy } from './hooks/useScrollSpy';
import './App.css';

// 1. We create a "MainLanding" component to hold all your scrolling slides
const MainLanding = () => {
  const scrollContainerRef = useRef(null);
  const headerRef = useRef(null);
  const { activeSlide, handleScroll } = useScrollSpy(scrollContainerRef);

  // Update header style on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateHeader = () => {
      if (headerRef.current) {
        if (container.scrollTop > 50) {
          headerRef.current.classList.add('scrolled');
        } else {
          headerRef.current.classList.remove('scrolled');
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    container.addEventListener('scroll', updateHeader);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('scroll', updateHeader);
    };
  }, [handleScroll]);

  // Scroll to specific slide
  const scrollToSlide = (targetId) => {
    const targetSlide = document.getElementById(targetId);
    if (targetSlide && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: targetSlide.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const isSlideVisible = (slideId) => activeSlide === slideId;

  return (
    <div className="app">
      <Header
        activeSlide={activeSlide}
        onNavClick={scrollToSlide}
        headerRef={headerRef}
      />
      <SideNav activeSlide={activeSlide} onDotClick={scrollToSlide} />

      <div className="scroll-container" ref={scrollContainerRef}>
        <HomeSlide
          isVisible={isSlideVisible('slide-home')}
          onExploreClick={() => scrollToSlide('slide-care')}
        />
        <Ros2Slide isVisible={isSlideVisible('slide-ros2')} />
        <CareSlide
          isVisible={isSlideVisible('slide-care')}
          onViewCourses={() => scrollToSlide('slide-courses')}
        />
        <ConsultSlide isVisible={isSlideVisible('slide-consult')} />
        <ConnectSlide isVisible={isSlideVisible('slide-connect')} />
        <CoursesSlide isVisible={isSlideVisible('slide-courses')} />
        <Footer />
      </div>
    </div>
  );
};

// 2. We set up the Router in the main App function
function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token") || "")

  return (
    <Router>
      <Routes>
        {/* The main scrolling website is on the home path ("/") */}
        <Route path="/" element={<MainLanding />} />

        {/* The standalone pages for Login and Register */}
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register />} />

        {/* ADD THESE NEW DASHBOARD ROUTES HERE */}
        <Route path="/dashboard/student" element={<StudentDashboard token={token} />} />
        <Route path="/dashboard/mentor" element={<MentorDashboard token={token} />} />
      </Routes>
    </Router>
  );
}

export default App;