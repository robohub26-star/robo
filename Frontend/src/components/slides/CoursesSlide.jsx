import React from 'react';
import { courseData } from '../../utils/constants';
import './CoursesSlide.css';

const CoursesSlide = ({ isVisible }) => {
  // Duplicate data for infinite scroll effect
  const allCourses = [...courseData, ...courseData];

  return (
    <section className={`slide ${isVisible ? 'is-visible' : ''}`} id="slide-courses">
      <img src="/images/solid-light-blue-background.jpg" alt="Courses Background" className="bg-image" />
      <div className="overlay-gradient"></div>
      <div className="content">
        <div className="eyebrow">Programs</div>
        <h1>HANDS-ON <span>MODULES</span></h1>
        <div className="courses-slider">
          <div className="courses-track">
            {allCourses.map((course, idx) => (
              <div key={idx} className="course-card">
                <div className="course-img">
                  <img src={course.image} alt={course.title} />
                </div>
                <div className="course-content">
                  <div className="course-badge">
                    <i className="fas fa-clock"></i> {course.duration}
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoursesSlide;