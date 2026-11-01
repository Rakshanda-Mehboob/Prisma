/**
 * components/OnboardingLayout.jsx
 *
 * Shared layout component for all student onboarding steps (/onboarding).
 * Features:
 * - Solid white left sidebar with thin slate-200 right border matching main app sidebar
 * - Connected step list (indigo-600 active, green completed, slate-400 upcoming, slate-200/indigo-500 line)
 * - Flat bg-slate-50 neutral canvas
 * - Standardized max-w-5xl white card container with top progress and navigation
 */

import React from 'react';
import PrismaLogo from './PrismaLogo';
import OnboardingStepWrapper from './OnboardingStepWrapper';
import { CheckCircle2, Lock } from 'lucide-react';

export default function OnboardingLayout({
  step,
  totalSteps,
  steps,
  stepLabel,
  error,
  children,
  onBack,
  onNext,
  onSkip,
  canProceed = true,
  saving = false,
  showNav = true,
  nextLabel,
}) {
  return (
    <div className="onb-layout">
      {/* ─── 1. Left Step Sidebar (Solid bg-white, border-slate-200) ─── */}
      <aside className="onb-sidebar">
        <div>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
            <PrismaLogo size={34} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Prisma
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.04em', marginTop: '0.15rem' }}>
                STUDENT ONBOARDING
              </div>
            </div>
          </div>

          {/* Stepper with connecting line */}
          <div className="onb-steps-list">
            {steps.map((s, i) => {
              const done = i < step || step === totalSteps - 1;
              const active = i === step;
              const isLast = i === totalSteps - 1;

              return (
                <div key={s.id} className="onb-step-row">
                  {/* Connector Line */}
                  {!isLast && (
                    <div className={`onb-step-connector ${i < step ? 'completed' : ''}`} />
                  )}

                  {/* Step Circle */}
                  <div className={`onb-step-circle ${active ? 'active' : done ? 'completed' : 'upcoming'}`}>
                    {done ? <CheckCircle2 size={16} strokeWidth={2.5} /> : i + 1}
                  </div>

                  {/* Step Label */}
                  <div className="onb-step-text-wrap">
                    <span className={`onb-step-label ${active ? 'active' : done ? 'completed' : ''}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Security Note & Progress Bar */}
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
            <Lock size={14} style={{ color: '#64748b' }} />
            <span>Encrypted & Confidential</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, marginBottom: '0.85rem' }}>
            Your student profile data is used strictly for personalized cyberbullying intervention scenarios.
          </div>
          <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: '#4f46e5',
                borderRadius: 999,
                width: `${((step + 1) / totalSteps) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </aside>

      {/* ─── 2. Flat Light Main Content Area (bg-slate-50) ─── */}
      <main className="onb-main-area">
        <OnboardingStepWrapper
          step={step}
          totalSteps={totalSteps}
          stepLabel={stepLabel}
          error={error}
          onBack={onBack}
          onNext={onNext}
          onSkip={onSkip}
          canProceed={canProceed}
          saving={saving}
          showNav={showNav}
          nextLabel={nextLabel}
        >
          {children}
        </OnboardingStepWrapper>
      </main>
    </div>
  );
}
