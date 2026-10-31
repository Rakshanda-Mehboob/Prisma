import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Laptop
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
              <GraduationCap size={14} className="student-cap-icon" />
              Campus Peer Network
            </span>
          </div>
          <span className="student-module-pill">TPB Module 1 · Active</span>
        </div>

        {/* Central Graphic: University Student Cyber Environment */}
        <div className="student-graphic-canvas">
          <svg
            viewBox="0 0 460 260"
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
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.15)" />
                <stop offset="100%" stopColor="rgba(99, 102, 241, 0.0)" />
              </linearGradient>
            </defs>

            {/* Campus Background Architecture / Archway */}
            <path
              d="M 60 240 L 60 110 Q 60 40, 140 40 Q 220 40, 220 110 L 220 240 Z"
              fill="rgba(79, 70, 229, 0.035)"
              stroke="rgba(79, 70, 229, 0.12)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M 240 240 L 240 110 Q 240 40, 320 40 Q 400 40, 400 110 L 400 240 Z"
              fill="rgba(8, 145, 178, 0.03)"
              stroke="rgba(8, 145, 178, 0.1)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Study Table Surface */}
            <path
              d="M 20 220 C 120 212, 340 212, 440 220 L 450 250 L 10 250 Z"
              fill="url(#deskGlow)"
            />
            <line x1="20" y1="220" x2="440" y2="220" stroke="rgba(99, 102, 241, 0.25)" strokeWidth="2" />

            {/* Student 1 (Left - University Student typing on laptop, smiling) */}
            <g transform="translate(75, 80)">
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

            {/* Laptop in center on desk */}
            <g transform="translate(160, 140)">
              {/* Laptop Screen */}
              <rect x="0" y="0" width="70" height="48" rx="4" fill="url(#laptopGrad)" stroke="#334155" strokeWidth="1.5" />
              {/* Laptop Screen glow with code / chat bubbles */}
              <rect x="3" y="3" width="64" height="42" rx="2" fill="#1e1b4b" />
              <rect x="8" y="10" width="30" height="3" rx="1.5" fill="#818cf8" />
              <rect x="8" y="16" width="46" height="3" rx="1.5" fill="#38bdf8" />
              <rect x="8" y="22" width="22" height="3" rx="1.5" fill="#34d399" />
              <circle cx="56" cy="33" r="5" fill="#4f46e5" />
              <path d="M 54 33 L 58 33" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              {/* Base */}
              <path d="M -8 48 L 78 48 L 72 54 L -2 54 Z" fill="#64748b" />
              {/* Light beam from laptop */}
              <polygon points="4,3 66,3 100,10 -30,10" fill="rgba(99, 102, 241, 0.08)" />
            </g>

            {/* Student 2 (Right - University Peer participating / giving constructive feedback) */}
            <g transform="translate(270, 75)">
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

              {/* Arms holding textbook / digital tablet */}
              <rect x="8" y="105" width="40" height="28" rx="4" fill="#ffffff" stroke="#0891b2" strokeWidth="1.5" transform="rotate(-12 8 105)" />
              <line x1="16" y1="112" x2="38" y2="108" stroke="#0891b2" strokeWidth="2" />
              <line x1="18" y1="119" x2="36" y2="115" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M 80 95 Q 60 115, 35 118" stroke="#fcd34d" strokeWidth="7" strokeLinecap="round" />
            </g>

            {/* Floating Connection Beam / Digital Shield between students */}
            <g transform="translate(195, 45)">
              <circle cx="35" cy="35" r="24" fill="rgba(255, 255, 255, 0.95)" stroke="rgba(79, 70, 229, 0.25)" strokeWidth="2" filter="drop-shadow(0 4px 12px rgba(79,70,229,0.15))" />
              <path
                d="M 35 22 L 47 27 C 47 37, 42 45, 35 48 C 28 45, 23 37, 23 27 Z"
                fill="url(#studentGrad1)"
              />
              <path d="M 31 34 L 34 37 L 40 31" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>

            {/* Subtle floating chat reactions */}
            <g transform="translate(20, 30)">
              <rect x="0" y="0" width="80" height="26" rx="13" fill="#ffffff" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.05))" />
              <circle cx="14" cy="13" r="6" fill="#10b981" />
              <path d="M 12 13 L 13.5 14.5 L 16.5 11.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <text x="26" y="17" fill="#1e293b" fontSize="10" fontWeight="700" fontFamily="sans-serif">Respectful</text>
            </g>

            <g transform="translate(340, 25)">
              <rect x="0" y="0" width="95" height="26" rx="13" fill="#ffffff" stroke="rgba(8, 145, 178, 0.2)" strokeWidth="1" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.05))" />
              <circle cx="14" cy="13" r="6" fill="#0891b2" />
              <text x="11.5" y="17" fill="white" fontSize="10" fontWeight="bold">🎓</text>
              <text x="26" y="17" fill="#1e293b" fontSize="10" fontWeight="700" fontFamily="sans-serif">Empathetic Peer</text>
            </g>
          </svg>
        </div>

        {/* Bottom Context Banner: University Cyber Awareness & Reflection */}
        <div className="student-card-footer">
          <div className="student-footer-pill">
            <Users size={14} className="student-pill-icon" />
            <span>Interactive Campus Scenarios & Peer Culture</span>
          </div>
          <div className="student-stats-preview">
            <span className="student-stat-dot" />
            <span>2,400+ students trained</span>
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
          <ShieldCheck size={18} />
        </div>
        <div>
          <span className="student-float-title">Active Bystander</span>
          <span className="student-float-sub">Support victims & report safely</span>
        </div>
      </motion.div>

      {/* Floating Card 2: Resilience & Healthy Digital Norms */}
      <motion.div
        className="student-floating-card student-float-right"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <div className="student-float-icon-box teal-glow">
          <Sparkles size={18} />
        </div>
        <div>
          <span className="student-float-title">Positive Norms</span>
          <span className="student-float-sub">+18% constructive engagement</span>
        </div>
      </motion.div>
    </div>
  );
}
