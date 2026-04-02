import React from 'react';
import './CareSlide.css';

const CareSlide = ({ isVisible, onViewCourses }) => {
  return (
    <section className={`slide ${isVisible ? 'is-visible' : ''}`} id="slide-care">
      <img src="/images/care_training.png" alt="Care Lab Training" className="bg-image" />
      <div className="overlay-gradient"></div>
      <div className="content">
        <div className="eyebrow">Pillar 01 · Care</div>
        <h1>AI <span>ENGINE</span></h1>
        <p className="desc">
          RoboHub CARE is an adaptive learning ecosystem designed to build system-level capability in robotics and AI. At its core is an AI Assessment Engine that doesn't just test… it understands, adapts, and guides.
        </p>
        <button className="btn" onClick={onViewCourses}>
          View All Courses
        </button>
      </div>
    </section>
  );
};

export default CareSlide;