import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldX } from 'lucide-react';

export default function ThreatGauge({ score = 75, label = 'Cyber Risk Index', size = 180 }) {
  // score is 0 to 100
  // In TPB: Higher score = more positive anti-cyberbullying posture
  // Lower score = higher risk!
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  let riskCategory = 'Low Risk / Vigilant';
  let color = 'var(--color-success)';
  let icon = <ShieldCheck size={24} color={color} />;

  if (normalizedScore < 50) {
    riskCategory = 'High Risk / Vulnerable';
    color = 'var(--color-danger)';
    icon = <ShieldX size={24} color={color} />;
  } else if (normalizedScore < 70) {
    riskCategory = 'Moderate Risk / Review';
    color = 'var(--color-warning)';
    icon = <AlertTriangle size={24} color={color} />;
  } else if (normalizedScore < 85) {
    riskCategory = 'Good Posture / Guarded';
    color = 'var(--color-accent)';
    icon = <ShieldAlert size={24} color={color} />;
  }

  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.4s ease',
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ marginBottom: 2 }}>{icon}</div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              lineHeight: 1,
              color: '#fff',
            }}
          >
            {normalizedScore}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Score / 100
          </div>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color }}>{riskCategory}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{label}</div>
      </div>
    </div>
  );
}
