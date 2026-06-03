import React from 'react';
import './Button.css';

export default function Button({ children, variant = 'primary', size = 'md', loading, fullWidth, className = '', ...props }) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${loading ? 'btn--loading' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="btn-spinner" /> : null}
      {children}
    </button>
  );
}
