/**
 * components/OnboardingStepWrapper.jsx
 *
 * Shared step wrapper component for all onboarding steps (/onboarding).
 * Enforces identical card width (max-w-5xl, ~1024px), centering (mx-auto),
 * padding (p-8 lg:p-12, mobile p-6), progress bar, and consistent navigation.
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function OnboardingStepWrapper({
  step,
  totalSteps,
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
  const percent = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div className="w-full max-w-5xl mx-auto onb-card">
      {/* ─── Top Progress Indicator ─── */}
      <div className="onb-card-progress">
        <div className="onb-card-progress-header">
          <span>Step {step + 1} of {totalSteps}: {stepLabel}</span>
          <span>{percent}% Completed</span>
        </div>
        <div className="onb-card-progress-track">
          <div
            className="onb-card-progress-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* ─── Step Content ─── */}
      <div className="w-full">
        {children}
      </div>

      {/* ─── Error Alert ─── */}
      {error && (
        <div className="alert alert-danger" style={{ marginTop: '1.25rem' }}>
          {error}
        </div>
      )}

      {/* ─── Bottom Navigation Controls ─── */}
      {showNav && (
        <div className="onb-nav-bar" style={{ marginTop: '2.5rem' }}>
          <button
            type="button"
            onClick={onBack}
            disabled={step === 0 || saving}
            className="onb-btn-ghost"
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {onSkip && step > 0 && (
              <button
                type="button"
                onClick={onSkip}
                disabled={saving}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Skip for now
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              disabled={!canProceed || saving}
              className="onb-btn-continue"
            >
              <span>
                {saving
                  ? 'Saving Profile…'
                  : nextLabel || (step === totalSteps - 2 ? 'Save & Continue' : 'Continue')}
              </span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

