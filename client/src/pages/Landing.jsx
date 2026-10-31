import React from 'react';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import CTA from '../components/landing/CTA';
import DigitalValuesReflection from '../components/DigitalValuesReflection';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing-page-root">
      {/* 1. Hero Section */}
      <Hero user={user} />

      {/* 2. How It Works (3 numbered steps with connector) */}
      <HowItWorks />

      {/* 3. Values & Reflection (About section) */}
      <section className="landing-section values-section" id="about">
        <DigitalValuesReflection />
      </section>

      {/* 4. Final CTA Banner */}
      <CTA user={user} />
    </div>
  );
}
