import React from 'react';
import './Input.css';

export default function Input({ label, error, icon, className = '', ...props }) {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className={`input-wrap ${icon ? 'input-wrap--icon' : ''} ${error ? 'input-wrap--error' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input className="input-field" {...props} />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
