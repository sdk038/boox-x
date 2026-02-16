import React from 'react';

const Logo = ({ size = 40, showText = false, textColor = '#ffffff', className = '' }) => {
  return (
    <div className={`daler-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: showText ? '10px' : '0' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main gradient */}
          <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4066ff" />
            <stop offset="50%" stopColor="#6d5bfa" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          {/* Inner glow gradient */}
          <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          {/* Neural network glow */}
          <linearGradient id="logoGrad3" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          {/* Shadow filter */}
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#4066ff" floodOpacity="0.4" />
          </filter>
          {/* Inner glow */}
          <filter id="innerGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background hexagon shape */}
        <path
          d="M256 32L456 140V332L256 440L56 332V140L256 32Z"
          fill="url(#logoGrad1)"
          filter="url(#logoShadow)"
          rx="20"
        />
        
        {/* Inner hexagon border */}
        <path
          d="M256 60L430 155V315L256 410L82 315V155L256 60Z"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="2"
        />

        {/* Neural network connections */}
        <g opacity="0.3" stroke="url(#logoGrad3)" strokeWidth="1.5">
          {/* Connection lines */}
          <line x1="170" y1="180" x2="256" y2="140" />
          <line x1="342" y1="180" x2="256" y2="140" />
          <line x1="170" y1="180" x2="170" y2="290" />
          <line x1="342" y1="180" x2="342" y2="290" />
          <line x1="170" y1="290" x2="256" y2="340" />
          <line x1="342" y1="290" x2="256" y2="340" />
          <line x1="170" y1="180" x2="342" y2="290" />
          <line x1="342" y1="180" x2="170" y2="290" />
          <line x1="256" y1="140" x2="256" y2="340" />
        </g>

        {/* Neural network nodes */}
        <g opacity="0.4">
          <circle cx="256" cy="140" r="6" fill="#60a5fa" />
          <circle cx="170" cy="180" r="5" fill="#818cf8" />
          <circle cx="342" cy="180" r="5" fill="#818cf8" />
          <circle cx="170" cy="290" r="5" fill="#818cf8" />
          <circle cx="342" cy="290" r="5" fill="#818cf8" />
          <circle cx="256" cy="340" r="6" fill="#60a5fa" />
        </g>

        {/* Central "D" letter - bold and modern */}
        <g filter="url(#innerGlow)">
          <text
            x="256"
            y="280"
            textAnchor="middle"
            fill="white"
            fontFamily="'Inter', 'SF Pro Display', -apple-system, sans-serif"
            fontWeight="800"
            fontSize="200"
            letterSpacing="-8"
          >
            D
          </text>
        </g>

        {/* AI chip indicator - bottom right */}
        <g transform="translate(340, 340)">
          <rect x="0" y="0" width="56" height="56" rx="14" fill="rgba(255,255,255,0.2)" />
          <rect x="4" y="4" width="48" height="48" rx="11" fill="rgba(255,255,255,0.1)" />
          <text
            x="28"
            y="38"
            textAnchor="middle"
            fill="white"
            fontFamily="'Inter', 'SF Pro Display', -apple-system, sans-serif"
            fontWeight="700"
            fontSize="24"
          >
            AI
          </text>
          {/* Chip pins */}
          <rect x="-4" y="16" width="8" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="-4" y="28" width="8" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="-4" y="40" width="8" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="52" y="16" width="8" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="52" y="28" width="8" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="52" y="40" width="8" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="16" y="-4" width="3" height="8" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="28" y="-4" width="3" height="8" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="40" y="-4" width="3" height="8" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="16" y="52" width="3" height="8" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="28" y="52" width="3" height="8" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="40" y="52" width="3" height="8" rx="1.5" fill="rgba(255,255,255,0.4)" />
        </g>

        {/* Orbiting dots - pulsating effect */}
        <circle cx="256" cy="72" r="4" fill="white" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="420" cy="200" r="3" fill="#a855f7" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="92" cy="200" r="3" fill="#60a5fa" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{
            fontSize: size * 0.55,
            fontWeight: 800,
            color: textColor,
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
            letterSpacing: '-0.02em'
          }}>
            Daler
          </span>
          <span style={{
            fontSize: size * 0.3,
            fontWeight: 600,
            background: 'linear-gradient(90deg, #60a5fa, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            AI Platform
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
