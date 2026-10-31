import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Sparkles,
  Award
} from 'lucide-react';

export default function StudentHeroIllustration() {
  return (
    <div className="student-hero-visual-wrapper">
      {/* Dynamic Ambient Background Glow inside the frame */}
      <div className="student-hero-glow" />

      {/* Main Student Hub Card */}
      <div className="student-card-main">
        {/* Top Header of the Student Hub */}
        <div className="student-card-header">
          <div className="student-badge-group">
            <span className="student-live-pulse" />
            <span className="student-campus-badge">
              <GraduationCap size={15} className="student-cap-icon" />
              Campus Peer Network
            </span>
            <span className="student-hub-tag">University Hub</span>
          </div>
          <span className="student-module-pill">TPB Model · Active</span>
        </div>

        {/* Central Graphic: University Student Cyber Environment */}
        <div className="student-graphic-canvas">
          <svg
            viewBox="0 0 560 270"
            className="student-scene-svg"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="studentGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="studentGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="deskGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.16)" />
                <stop offset="100%" stopColor="rgba(99, 102, 241, 0.0)" />
              </linearGradient>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>

            {/* Campus Background Architecture / Library Arches */}
            <path
              d="M 45 250 L 45 95 Q 45 25, 135 25 Q 225 25, 225 95 L 225 250 Z"
              fill="rgba(79, 70, 229, 0.035)"
              stroke="rgba(79, 70, 229, 0.12)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M 235 250 L 235 85 Q 235 15, 325 15 Q 415 15, 415 85 L 415 250 Z"
              fill="rgba(124, 58, 237, 0.03)"
              stroke="rgba(124, 58, 237, 0.12)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M 425 250 L 425 95 Q 425 25, 495 25 Q 545 25, 545 95 L 545 250 Z"
              fill="rgba(8, 145, 178, 0.03)"
              stroke="rgba(8, 145, 178, 0.1)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Study Table Surface */}
            <path
              d="M 15 222 C 160 214, 400 214, 545 222 L 555 260 L 5 260 Z"
              fill="url(#deskGlow)"
            />
            <line x1="15" y1="222" x2="545" y2="222" stroke="rgba(99, 102, 241, 0.22)" strokeWidth="2" />

            {/* Student 1 (Left - University Student typing on laptop, smiling) */}
            <g transform="translate(80, 78)">
              {/* Backpack on floor */}
              <rect x="-35" y="105" width="28" height="36" rx="8" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
              <path d="M -28 105 Q -21 95, -14 105" stroke="#4f46e5" strokeWidth="2" fill="none" />
              <line x1="-30" y1="120" x2="-12" y2="120" stroke="#818cf8" strokeWidth="1.5" />

              {/* Body / Hoodie */}
              <path d="M 0 75 Q 35 60, 70 75 L 75 140 L -5 140 Z" fill="url(#studentGrad1)" />
              {/* Hoodie collar & lanyard with Student ID */}
              <path d="M 25 72 L 35 105 L 45 72" stroke="white" strokeWidth="2" fill="none" opacity="0.9" />
              <rect x="30" y="105" width="10" height="15" rx="2" fill="#f8fafc" stroke="#4f46e5" strokeWidth="1" />
              <rect x="32" y="108" width="6" height="4" fill="#6366f1" />

              {/* Head / Hair / Face */}
              <circle cx="35" cy="38" r="22" fill="#fed7aa" />
              {/* Modern curly/voluminous hair */}
              <path
                d="M 12 34 Q 15 12, 38 12 Q 58 12, 58 32 Q 58 40, 52 44 Q 48 20, 22 28 Z"
                fill="#312e81"
              />
              {/* Smile & focused eye */}
              <circle cx="43" cy="38" r="2.5" fill="#1e1b4b" />
              <path d="M 38 46 Q 44 51, 48 45" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              {/* Headphones around neck */}
              <path d="M 17 52 Q 35 66, 53 52" stroke="#10b981" strokeWidth="4" strokeLinecap="round" fill="none" />
              <circle cx="16" cy="50" r="5" fill="#059669" />
              <circle cx="54" cy="50" r="5" fill="#059669" />

              {/* Arms reaching to laptop */}
              <path d="M 10 90 Q 40 100, 75 110" stroke="#fed7aa" strokeWidth="8" strokeLinecap="round" />
            </g>

            {/* University Textbooks Stack on Desk */}
            <g transform="translate(172, 195)">
              <rect x="0" y="14" width="38" height="9" rx="2.5" fill="#4f46e5" opacity="0.9" />
              <line x1="6" y1="18" x2="32" y2="18" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" />
              <rect x="3" y="7" width="34" height="8" rx="2" fill="#0891b2" opacity="0.95" />
              <line x1="8" y1="11" x2="30" y2="11" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" />
              <rect x="1" y="0" width="36" height="8" rx="2" fill="#7c3aed" />
              <line x1="7" y1="4" x2="31" y2="4" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" />
            </g>

            {/* Laptop in center on desk */}
            <g transform="translate(225, 138)">
              {/* Laptop Screen */}
              <rect x="0" y="0" width="76" height="52" rx="5" fill="url(#laptopGrad)" stroke="#334155" strokeWidth="1.5" />
              {/* Laptop Screen display with code & chat bubbles */}
              <rect x="4" y="4" width="68" height="44" rx="2.5" fill="#1e1b4b" />
              <rect x="9" y="11" width="32" height="3" rx="1.5" fill="#818cf8" />
              <rect x="9" y="18" width="50" height="3" rx="1.5" fill="#38bdf8" />
              <rect x="9" y="25" width="24" height="3" rx="1.5" fill="#34d399" />
              <circle cx="60" cy="35" r="5.5" fill="#4f46e5" />
              <path d="M 58 35 L 62 35" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              {/* Laptop Base */}
              <path d="M -8 52 L 84 52 L 78 58 L -2 58 Z" fill="#64748b" />
              {/* Light beam from laptop */}
              <polygon points="4,4 72,4 105,12 -25,12" fill="rgba(99, 102, 241, 0.08)" />
            </g>

            {/* Campus Tumbler / Drink on Desk */}
            <g transform="translate(322, 185)">
              <rect x="0" y="5" width="16" height="30" rx="3.5" fill="#0284c7" />
              <rect x="-2" y="1" width="20" height="5" rx="2" fill="#0369a1" />
              <circle cx="8" cy="20" r="4.5" fill="#ffffff" opacity="0.9" />
              <path d="M 6.5 20 L 7.5 21 L 9.5 19" stroke="#0284c7" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </g>

            {/* Student 2 (Right - University Peer participating / giving constructive feedback) */}
            <g transform="translate(365, 74)">
              {/* Body / Denim or Teal Jacket */}
              <path d="M 15 80 Q 50 65, 85 80 L 90 145 L 10 145 Z" fill="url(#studentGrad2)" />
              {/* White collar */}
              <polygon points="45,78 50,92 55,78" fill="#ffffff" />

              {/* Head / Hair / Glasses */}
              <circle cx="50" cy="40" r="21" fill="#fcd34d" />
              {/* Sleek straight hair */}
              <path d="M 28 36 C 30 14, 70 14, 72 36 L 72 48 C 65 30, 35 30, 28 48 Z" fill="#1f2937" />
              {/* Eyeglasses */}
              <rect x="38" y="36" width="11" height="8" rx="2" stroke="#4338ca" strokeWidth="1.5" fill="none" />
              <rect x="53" y="36" width="11" height="8" rx="2" stroke="#4338ca" strokeWidth="1.5" fill="none" />
              <line x1="49" y1="40" x2="53" y2="40" stroke="#4338ca" strokeWidth="1.5" />
              {/* Friendly smile */}
              <path d="M 46 50 Q 51 55, 56 50" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" fill="none" />

              {/* Arms holding digital tablet */}
              <rect x="8" y="105" width="40" height="28" rx="4" fill="#ffffff" stroke="#0891b2" strokeWidth="1.5" transform="rotate(-12 8 105)" />
              <line x1="16" y1="112" x2="38" y2="108" stroke="#0891b2" strokeWidth="2" />
              <line x1="18" y1="119" x2="36" y2="115" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M 80 95 Q 60 115, 35 118" stroke="#fcd34d" strokeWidth="7" strokeLinecap="round" />
            </g>

            {/* Central Empathy Shield & Safe Culture Badge */}
            <g transform="translate(247, 40)">
              <circle
                cx="35"
                cy="35"
                r="26"
                fill="rgba(255, 255, 255, 0.96)"
                stroke="rgba(79, 70, 229, 0.22)"
                strokeWidth="2"
                filter="drop-shadow(0 6px 16px rgba(79,70,229,0.18))"
              />
              <path
                d="M 35 22 L 48 28 C 48 39, 43 47, 35 50 C 27 47, 22 39, 22 28 Z"
                fill="url(#shieldGrad)"
              />
              <path d="M 30 35 L 34 39 L 41 32" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>

            {/* Floating Chat Reactions */}
            <g transform="translate(26, 26)">
              <rect x="0" y="0" width="88" height="28" rx="14" fill="#ffffff" stroke="rgba(99, 102, 241, 0.22)" strokeWidth="1" filter="drop-shadow(0 3px 8px rgba(0,0,0,0.06))" />
              <circle cx="15" cy="14" r="7" fill="#10b981" />
              <path d="M 12.5 14 L 14.5 16 L 17.5 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <text x="29" y="18" fill="#1e293b" fontSize="10.5" fontWeight="700" fontFamily="sans-serif">Respectful</text>
            </g>

            <g transform="translate(422, 24)">
              <rect x="0" y="0" width="102" height="28" rx="14" fill="#ffffff" stroke="rgba(8, 145, 178, 0.22)" strokeWidth="1" filter="drop-shadow(0 3px 8px rgba(0,0,0,0.06))" />
              <circle cx="15" cy="14" r="7" fill="#0891b2" />
              <text x="12" y="18" fill="white" fontSize="10.5" fontWeight="bold">🎓</text>
              <text x="29" y="18" fill="#1e293b" fontSize="10.5" fontWeight="700" fontFamily="sans-serif">Empathetic Peer</text>
            </g>
          </svg>
        </div>

        {/* Bottom Context Banner: University Cyber Awareness & Reflection */}
        <div className="student-card-footer">
          <div className="student-footer-pill">
            <Users size={15} className="student-pill-icon" />
            <span>Interactive Campus Scenarios & Peer Culture</span>
          </div>
          <div className="student-stats-group">
            <div className="student-stats-preview">
              <span className="student-stat-dot" />
              <span>2,400+ students active</span>
            </div>
            <div className="student-stat-badge">
              <Award size={13} className="student-award-icon" />
              <span>98% Constructive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Card 1: Constructive Bystander Impact */}
      <motion.div
        className="student-floating-card student-float-left"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="student-float-icon-box indigo-glow">
          <ShieldCheck size={20} />
        </div>
        <div>
          <span className="student-float-title">Active Bystander</span>
          <span className="student-float-sub">Support peers & report safely</span>
        </div>
      </motion.div>

      {/* Floating Card 2: Resilience & Healthy Digital Norms */}
      <motion.div
        className="student-floating-card student-float-right"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <div className="student-float-icon-box teal-glow">
          <Sparkles size={20} />
        </div>
        <div>
          <span className="student-float-title">Positive Norms</span>
          <span className="student-float-sub">+24% constructive intervention</span>
        </div>
      </motion.div>
    </div>
  );
}
