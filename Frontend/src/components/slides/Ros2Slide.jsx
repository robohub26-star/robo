import React from 'react';
import './Ros2Slide.css';

const Ros2Slide = ({ isVisible }) => {
  return (
    <section className={`slide ${isVisible ? 'is-visible' : ''}`} id="slide-ros2">
      <div className="overlay-gradient event-schedule-blue"></div>
      <div className="content">
        <div className="eyebrow">Skill up with ROS2</div>
        <h1>EVENT <span>SCHEDULE</span></h1>
        <p className="desc">
          Are you ready to take your first step into the world of robotics and autonomous systems?
          We are excited to invite you to <strong>"Skill Up with ROS2"</strong>, a 3-day intensive hands-on program designed to help you gain practical experience in simulation, navigation, analysis, and deployment of ground-based robotic systems.
        </p>
        <p className="desc">
          This course is ideal for engineering students, fresh graduates, and tech enthusiasts who want to build industry-relevant skills and explore real-world robotic applications through structured, simulation-driven workflows.
        </p>
        <div className="ros2-event-card">
          <div className="event-item">
            <span>📅</span>
            <div>
              <strong>Dates</strong>
              <p>17–19 April 2026</p>
            </div>
          </div>
          <div className="event-item">
            <span>📍</span>
            <div>
              <strong>Venue</strong>
              <p>MIT, MAHE – Yelahanka Campus</p>
            </div>
          </div>
          <div className="event-item">
            <span>💰</span>
            <div>
              <strong>Fee</strong>
              <p>₹4000 (Inclusive of GST)</p>
            </div>
          </div>
        </div>
        <p className="ros2-deadline">
          ⏳ Last date to apply: <strong>10th April 2026</strong>
        </p>
        <p className="ros2-warning">
          ⚠️ Seats are limited — secure your spot now
        </p>
        <button className="btn" onClick={() => window.open('https://forms.gle/3AGBd78VEqzgBgmt7')}>
          Register Now 🚀
        </button>
        <button className="btn" onClick={() => window.location.href = '/images/Poster.jpg'}>
          View Poster 📄
        </button>
      </div>
    </section>
  );
};

export default Ros2Slide;