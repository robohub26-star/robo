import React from 'react';
import './HomeSlide.css';

const HomeSlide = ({ isVisible, onExploreClick }) => {
  return (
    <section className={`slide ${isVisible ? 'is-visible' : ''}`} id="slide-home">
      <img src="/images/hero_robotics.png" alt="Hero Background" className="bg-image" />
      <div className="overlay-gradient"></div>
      <div className="content">
        <div className="eyebrow">Technology Initiative</div>
        <h1>CARE | CONSULT | <span>CONNECT</span></h1>
        <p className="desc">
          Connecting learners, innovators, and industry through practical
          training, project support, and expert guidance — building real-world
          robotics and AI skills beyond the traditional classroom.
        </p>
        <button className="btn" onClick={onExploreClick}>
          Explore Pillars <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </section>
  );
};

export default HomeSlide;