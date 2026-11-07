import React from 'react';
import { Type, Check } from 'lucide-react';
import { useFontScale } from '../../context/FontScaleContext.jsx';
import './FontScaleSelector.css';

export default function FontScaleSelector({ className = '', showHeader = true }) {
  const { scale, setScale, options } = useFontScale();

  return (
    <div className={`font-scale-selector-container ${className}`}>
      {showHeader && (
        <div className="font-scale-header">
          <div className="font-scale-title-wrap">
            <Type size={18} className="font-scale-icon" aria-hidden="true" />
            <h3 className="font-scale-title">Text Display Scaling</h3>
          </div>
          <p className="font-scale-desc">
            Adjust typography and component scaling proportionally across the entire college ERP.
          </p>
        </div>
      )}

      <div
        className="font-scale-cards-grid"
        role="radiogroup"
        aria-label="Text display scaling options"
      >
        {options.map((opt) => {
          const isActive = scale === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`font-scale-card ${isActive ? 'is-active' : ''}`}
              onClick={() => setScale(opt.id)}
            >
              <div className="font-scale-card-left">
                <span className="font-scale-card-label">{opt.label}</span>
                <span className="font-scale-card-desc">{opt.desc}</span>
              </div>
              <div className="font-scale-card-check-wrap" aria-hidden="true">
                {isActive && <Check size={16} className="font-scale-card-check" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

