import React from 'react';
import { modelData } from '../../utils/constants';
import './ConsultSlide.css';

const ConsultSlide = ({ isVisible }) => {
  // Duplicate data for infinite scroll effect
  const allModels = [...modelData, ...modelData];

  return (
    <section className={`slide ${isVisible ? 'is-visible' : ''}`} id="slide-consult">
      <img src="/images/consult_lab.png" alt="" className="bg-image" />
      <div className="overlay-gradient"></div>
      <div className="content">
        <div className="eyebrow">Pillar 02 · Consult</div>
        <h1><span>ESTABLISHMENT</span></h1>
        <p className="desc">
          We support universities and organizations in establishing and
          operating cutting-edge AI & Robotics Centres of Excellence.
        </p>
        <div className="models-carousel">
          <div className="models-track">
            {allModels.map((model, idx) => (
              <div key={idx} className={`model-card ${model.highlight ? 'highlight' : ''}`}>
                <div className="model-tag">{model.tag}</div>
                <h3>{model.title}</h3>
                <p>{model.description}</p>
                <ul>
                  {model.features.map((feature, fIdx) => (
                    <li key={fIdx}>{feature}</li>
                  ))}
                </ul>
                <div className="model-outcome">
                  <strong>Outcome:</strong> {model.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultSlide;