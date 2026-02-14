
import React from 'react';

const Logo: React.FC<{ className?: string; size?: number }> = ({ className = "", size = 48 }) => (
  <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">
      <defs>
        <linearGradient id="veridion-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
        <clipPath id="hex-clip">
          <path d="M50 5 L93.3 30 L93.3 70 L50 95 L6.7 70 L6.7 30 Z" />
        </clipPath>
      </defs>
      
      {/* Hexagonal Aperture Frame */}
      <path 
        d="M50 5 L93.3 30 L93.3 70 L50 95 L6.7 70 L6.7 30 Z" 
        stroke="url(#veridion-grad)" 
        strokeWidth="1.5"
        className="opacity-40"
      />
      
      {/* Inner Lens / Leaf Hybrid */}
      <g clipPath="url(#hex-clip)">
        <path 
          d="M50 15 C70 15 85 35 85 55 C85 75 70 85 50 85 C30 85 15 75 15 55 C15 35 30 15 50 15 Z" 
          fill="url(#veridion-grad)"
          fillOpacity="0.15"
        />
        <path 
          d="M50 30 C65 30 75 45 75 55 C75 65 65 75 50 75 C35 75 25 65 25 55 C25 45 35 30 50 30 Z" 
          fill="url(#veridion-grad)"
        />
        {/* Playhead / Neural Dot */}
        <circle cx="50" cy="52" r="6" fill="white" />
        <path d="M48 48 L55 52 L48 56 Z" fill="#064e3b" />
      </g>

      {/* Stylized Shutter Lines */}
      <line x1="50" y1="5" x2="50" y2="15" stroke="url(#veridion-grad)" strokeWidth="1" />
      <line x1="93.3" y1="30" x2="80" y2="35" stroke="url(#veridion-grad)" strokeWidth="1" />
      <line x1="93.3" y1="70" x2="80" y2="65" stroke="url(#veridion-grad)" strokeWidth="1" />
      <line x1="50" y1="95" x2="50" y2="85" stroke="url(#veridion-grad)" strokeWidth="1" />
      <line x1="6.7" y1="70" x2="20" y2="65" stroke="url(#veridion-grad)" strokeWidth="1" />
      <line x1="6.7" y1="30" x2="20" y2="35" stroke="url(#veridion-grad)" strokeWidth="1" />
    </svg>
  </div>
);

export default Logo;
