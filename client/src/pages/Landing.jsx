
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  HeartHandshake,
  HelpCircle,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import PrismaLogo from "../components/PrismaLogo";
import "./Landing.css";

const steps = [
  {
    icon: ClipboardList,
    title: "TPB Baseline Audit",
    description:
      "Complete an initial assessment based on Attitude, Subjective Norms, and Perceived Behavioral Control.",
  },
  {
    icon: Brain,
    title: "Cognitive Risk Scoring",
    description:
      "Your responses are analyzed to understand the factors influencing your online behavior.",
  },
  {
    icon: HeartHandshake,
    title: "Targeted Interventions",
    description:
      "Receive personalized learning activities and scenarios based on your assessment.",
  },
  {
    icon: TrendingUp,
    title: "Post-Audit Delta",
    description:
      "Complete a follow-up assessment to review changes in your understanding and responses.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "TPB-Based Assessment",
    description:
      "Explore how attitudes, social influences, and perceived control relate to online behavior.",
    color: "purple",
  },
  {
    icon: BookOpen,
    title: "Interactive Learning",
    description:
      "Learn through scenarios and activities related to cyberbullying and online communication.",
    color: "teal",
  },
  {
    icon: HeartHandshake,
    title: "Personalized Intervention",
    description:
      "Receive guidance based on the areas identified in your initial assessment.",
    color: "peach",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Compare your pre-assessment and post-assessment results.",
    color: "blue",
  },
];

const faqs = [
  {
    q: "What is the Theory of Planned Behavior (TPB) in cyberbullying prevention?",
    a: "TPB explains how attitudes, social pressure, and perceived behavioral control influence a person's intention to behave in a particular way. PRISMA uses these three factors to understand students' responses to cyberbullying-related situations.",
  },
  {
    q: "How does the AI personalize learning interventions?",
    a: "After the initial assessment, PRISMA examines the student's responses and identifies areas where additional learning may be useful. The system then provides relevant scenarios, activities, and guidance.",
  },
  {
    q: "How is student privacy and anonymity preserved?",
    a: "PRISMA uses account authentication and access controls. The handling of assessment responses and any reports must follow the privacy and security controls implemented in the system.",
  },
  {
    q: "Can this platform be scaled to other academic institutions?",
    a: "PRISMA is being developed as a university project. Its modular frontend and backend could support future expansion, subject to further development, testing, and institutional requirements.",
  },
];

function Reveal({ children, className = "" }) {
  return (
    <div className={`pl-reveal ${className}`}>
      {children}
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const startPath = user ? "/dashboard" : "/register";

  useEffect(() => {
    const elements = document.querySelectorAll(".pl-reveal");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("pl-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("pl-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="pl-site">
      {/* HEADER */}
      <header className="pl-header">
        <div className="pl-container pl-header-inner">
          
<Link to="/" className="pl-brand">
  <PrismaLogo size={54} />
  <span className="pl-brand-wordmark">
    PRISM<span className="pl-brand-letter-a">A</span>
  </span>
</Link>

          <nav className={`pl-nav ${menuOpen ? "pl-nav-open" : ""}`}>
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQs</a>
          </nav>

          <div className="pl-header-actions">
            {user ? (
              <Link to="/dashboard" className="pl-btn pl-btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="pl-btn pl-btn-outline">
                  Login
                </Link>
                <Link to="/register" className="pl-btn pl-btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="pl-menu-toggle"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="pl-hero" id="home">
          <div className="pl-hero-photo" aria-hidden="true" />
          <div className="pl-hero-overlay" aria-hidden="true" />

          <div className="pl-container pl-hero-inner">
            <div className="pl-hero-copy">
              <div className="pl-eyebrow">
                <Sparkles size={14} />
                A Safer Digital Campus
              </div>

              <h1>
                Proactive Cyberbullying Intervention
                <span> Powered by Behavioral AI</span>
              </h1>

              <p>
                An enterprise-grade cognitive security platform utilizing
                the <strong>Theory of Planned Behavior (TPB)</strong> and{" "}
                <strong>Generative AI</strong> to diagnose, predict, and
                mitigate hostile online behaviors across academic digital
                ecosystems.
              </p>

              <div className="pl-hero-buttons">
                <Link to={startPath} className="pl-btn pl-btn-primary">
                  {user ? "Open Security Dashboard" : "Start Free Assessment"}
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to={user ? "/assessment" : "/login"}
                  className="pl-btn pl-btn-outline"
                >
                  {user ? "Take Assessment" : "Sign In with CMS ID"}
                </Link>
              </div>

              <div className="pl-hero-caption">
                <CheckCircle2 size={15} />
                Theory of Planned Behavior-based student support
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="pl-about" id="about">
          <div className="pl-container">
            <Reveal className="pl-about-layout">
              <div>
                <span className="pl-kicker">ABOUT PRISMA</span>
                <h2>
                  Understanding Online Behavior Through
                  <span> the Theory of Planned Behavior</span>
                </h2>
              </div>

              <div className="pl-about-text">
                <p>
                  PRISMA is an adaptive TPB-driven software system for
                  targeted cyberbullying intervention among university
                  students.
                </p>
                <p>
                  It focuses on Attitude, Subjective Norms, and Perceived
                  Behavioral Control to support assessment, personalized
                  intervention, and follow-up evaluation.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="pl-section" id="how">
          <div className="pl-container">
            <Reveal>
              <div className="pl-section-heading">
                <span className="pl-kicker">THE PROCESS</span>
                <h2>How PRISMA Works</h2>
                <p>
                  From the initial assessment to personalized intervention
                  and follow-up evaluation.
                </p>
              </div>
            </Reveal>

            <div className="pl-step-grid">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <Reveal key={step.title}>
                    <article className="pl-step-card">
                      <div className="pl-step-top">
                        <div className="pl-icon-circle">
                          <Icon size={22} />
                        </div>
                        <span className="pl-step-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="pl-section pl-features-section" id="features">
          <div className="pl-container">
            <Reveal>
              <div className="pl-section-heading">
                <span className="pl-kicker">PLATFORM FEATURES</span>
                <h2>What PRISMA Provides</h2>
                <p>
                  Assessment, learning activities, personalized guidance,
                  and progress evaluation in one platform.
                </p>
              </div>
            </Reveal>

            <div className="pl-feature-grid">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <Reveal key={feature.title}>
                    <article className={`pl-feature-card pl-${feature.color}`}>
                      <div className="pl-feature-icon">
                        <Icon size={23} />
                      </div>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pl-section pl-faq-section" id="faq">
          <div className="pl-container pl-faq-layout">
            <Reveal>
              <div className="pl-faq-intro">
                <span className="pl-kicker">FREQUENTLY ASKED QUESTIONS</span>
                <h2>Have Questions About PRISMA?</h2>
                <p>
                  Find out more about the assessment process, personalized
                  interventions, and the technology behind PRISMA.
                </p>
                <div className="pl-faq-decoration">
                  <HelpCircle size={36} />
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="pl-faq-list">
                {faqs.map((faq, index) => (
                  <div
                    className={`pl-faq-item ${
                      activeFaq === index ? "pl-faq-active" : ""
                    }`}
                    key={faq.q}
                  >
                    <button
                      type="button"
                      className="pl-faq-question"
                      aria-expanded={activeFaq === index}
                      onClick={() =>
                        setActiveFaq(activeFaq === index ? null : index)
                      }
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={19} />
                    </button>

                    {activeFaq === index && (
                      <div className="pl-faq-answer">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="pl-container pl-cta-section">
          <Reveal>
            <div className="pl-cta">
              <div>
                <span className="pl-kicker">GET STARTED WITH PRISMA</span>
                <h2>Start Your Assessment</h2>
                <p>
                  Sign in or create your student account to access the
                  PRISMA assessment and intervention modules.
                </p>
              </div>

              <Link to={startPath} className="pl-btn pl-btn-primary">
                {user ? "Go to Dashboard" : "Get Started"}
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="pl-footer">
        <div className="pl-container">
          <div className="pl-footer-grid">
            <div className="pl-footer-brand">
             
<Link to="/" className="pl-brand pl-footer-brand">
  <PrismaLogo size={62} />
  <span className="pl-brand-wordmark">
    PRISM<span className="pl-brand-letter-a">A</span>
  </span>
</Link>

              <p>
                An adaptive TPB-driven software system for targeted
                cyberbullying intervention.
              </p>

              <p className="pl-footer-note">
                Final Year Project · BS Software Engineering
              </p>
            </div>

            <div className="pl-footer-column">
              <h3>Quick Links</h3>
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#how">How It Works</a>
              <a href="#features">Features</a>
            </div>

            <div className="pl-footer-column">
              <h3>Platform</h3>
              <Link to={startPath}>Get Started</Link>
              <Link to={user ? "/dashboard" : "/login"}>
                {user ? "Dashboard" : "Student Login"}
              </Link>
              <a href="#faq">FAQs</a>
            </div>

            <div className="pl-footer-column">
              <h3>About the Project</h3>
              <span>University Student Support</span>
              <span>TPB-Based Assessment</span>
              <span>Cyberbullying Intervention</span>
            </div>
          </div>

          <div className="pl-footer-bottom">
            <span>© {new Date().getFullYear()} PRISMA. All rights reserved.</span>
            <span>Understand · Learn · Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
