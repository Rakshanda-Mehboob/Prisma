import React from 'react';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import DigitalValuesReflection from '../components/DigitalValuesReflection';
import { Shield, Brain, Heart, BookOpen, Users, Sparkles } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing-page-root">
      {/* 1. Hero Section */}
      <Hero user={user} />

      {/* 2. How It Works (3 numbered steps with connector) */}
      <HowItWorks />

      {/* 3. Values & Reflection */}
      <section className="landing-section values-section" id="values">
        <DigitalValuesReflection />
      </section>

      {/* 4. About Section */}
      <section className="landing-section about-section" id="about-prisma">
        <div className="about-container">
          {/* Header */}
          <div className="about-header">

            <h2 className="about-title">
              Empowering Students Against
              <span className="about-title-accent"> Cyberbullying</span>
            </h2>
            <p className="about-subtitle">
              Prisma is a research-driven digital platform developed at Riphah International University,
              combining behavioral psychology with modern technology to create safer online spaces
              for university students.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="about-features-grid">
            <div className="about-feature-card">
              <div className="about-feature-icon">
                <Brain size={24} />
              </div>
              <h3>Theory of Planned Behavior</h3>
              <p>
                Built on the TPB framework, Prisma assesses attitudes, subjective norms, and perceived
                behavioral control to understand and predict cyberbullying behavior patterns.
              </p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon">
                <Shield size={24} />
              </div>
              <h3>AI-Powered Assessment</h3>
              <p>
                Our intelligent assessment engine identifies risk levels and provides personalized
                insights, helping students understand their digital behavior and its impact.
              </p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon">
                <BookOpen size={24} />
              </div>
              <h3>Targeted Interventions</h3>
              <p>
                Evidence-based learning modules tailored to each student's assessment results,
                delivering the right educational content at the right time.
              </p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon">
                <Heart size={24} />
              </div>
              <h3>Values-Driven Approach</h3>
              <p>
                Grounded in ethical and moral principles, Prisma encourages digital empathy,
                responsible communication, and respect for human dignity online.
              </p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon">
                <Users size={24} />
              </div>
              <h3>Community Impact</h3>
              <p>
                Designed for the university community, Prisma fosters a culture of digital citizenship
                where students support and uplift each other.
              </p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon">
                <Sparkles size={24} />
              </div>
              <h3>Academic Research</h3>
              <p>
                Part of ongoing research at Riphah International University's Computing department,
                contributing to the academic understanding of cyberbullying prevention.
              </p>
            </div>
          </div>

          {/* Bottom Attribution */}
          <div className="about-attribution">
            <div className="about-attribution-line"></div>
            <p>
              A research project by the Department of Computing, Riphah International University
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
