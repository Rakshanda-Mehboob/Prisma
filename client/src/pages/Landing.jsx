
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowUpRight,
  ArrowRight,
  Brain,
  BookOpen,
  ChartNoAxesCombined,
  HeartHandshake,
  MessageCircleHeart,
  ShieldCheck,
  Users,
  Sparkles
} from 'lucide-react';
import './Landing.css';

const steps = [
  {
    number: '01',
    icon: Brain,
    title: 'Answer a few questions',
    description:
      'Read everyday online situations and answer questions about what you think and how you would respond.'
  },
  {
    number: '02',
    icon: BookOpen,
    title: 'Learn in your own way',
    description:
      'Explore helpful lessons and activities based on your answers and the areas where you can improve.'
  },
  {
    number: '03',
    icon: ChartNoAxesCombined,
    title: 'See your progress',
    description:
      'Answer a second set of questions and compare your results to see what you have learned.'
  }
];

const features = [
  {
    icon: MessageCircleHeart,
    title: 'Real-life online situations',
    description:
      'Explore common situations students may face on social media and other online platforms.'
  },
  {
    icon: Sparkles,
    title: 'Learning made for you',
    description:
      'Get lessons and activities that match your answers and help you learn what matters.'
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Your learning progress',
    description:
      'See your assessment results and follow your progress through your personal dashboard.'
  }
];

export default function Landing() {
  const { user } = useAuth();

  const mainLink = user ? '/dashboard' : '/register';
  const mainText = user ? 'Go to dashboard' : 'Get started';
  const secondLink = user ? '/assessment' : '/login';
  const secondText = user ? 'Take assessment' : 'Sign in';

  return (
    <main className="prisma-landing">

      {/* HERO SECTION */}
      <section className="pl-hero" id="platform">
        <div className="pl-hero-decoration" />

        <div className="pl-hero-container">

          <div className="pl-hero-content">

            <div className="pl-tag">
              <HeartHandshake size={18} />
              A kinder online world starts with us
            </div>

            <h1>
              Make the online world a
              <span> kinder place.</span>
            </h1>

            <p className="pl-hero-text">
              Cyberbullying affects real people. Learn how to make better
              choices online, understand others, and help create a safer
              digital space for everyone.
            </p>

            <div className="pl-hero-buttons">
              <Link to={mainLink} className="pl-btn pl-btn-primary">
                {mainText}
                <ArrowUpRight size={20} />
              </Link>

              <Link to={secondLink} className="pl-btn pl-btn-secondary">
                {secondText}
                <ArrowRight size={19} />
              </Link>
            </div>

            <div className="pl-hero-points">
              <span><ShieldCheck size={18} /> Learn at your own pace</span>
              <span><HeartHandshake size={18} /> Make thoughtful choices</span>
            </div>

          </div>

          <div className="pl-hero-image-area">

            <div className="pl-image-background" />

            <div className="pl-hero-image">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85"
                alt="University students working and learning together"
              />
            </div>

            <div className="pl-floating-card pl-card-top">
              <div className="pl-floating-icon">
                <Users size={23} />
              </div>
              <div>
                <strong>Stronger together</strong>
                <span>Support one another</span>
              </div>
            </div>

            <div className="pl-floating-card pl-card-bottom">
              <div className="pl-floating-icon peach">
                <HeartHandshake size={23} />
              </div>
              <div>
                <strong>Choose kindness</strong>
                <span>Your actions matter</span>
              </div>
            </div>

          </div>
        </div>

        <div className="pl-hero-footer">
          <span>THINK KINDLY</span>
          <i />
          <span>ACT RESPONSIBLY</span>
          <i />
          <span>MAKE A DIFFERENCE</span>
        </div>
      </section>

      {/* ABOUT PRISMA */}
      <section className="pl-about" id="about">

        <div className="pl-section-label">GET TO KNOW PRISMA</div>

        <div className="pl-about-layout">

          <h2>
            Your online choices
            <span> make a difference.</span>
          </h2>

          <p>
            PRISMA helps university students understand cyberbullying
            and think about how they respond to it. It looks at what
            we believe, how people around us affect our choices, and
            how confident we feel when we need to act.
          </p>

        </div>

        <div className="pl-tpb-grid">

          <div className="pl-tpb-card">
            <span className="pl-tpb-number">01</span>
            <div className="pl-tpb-icon"><Brain size={27} /></div>
            <h3>Attitude</h3>
            <p>
              What we think and feel about online behaviour.
            </p>
          </div>

          <div className="pl-tpb-card">
            <span className="pl-tpb-number">02</span>
            <div className="pl-tpb-icon"><Users size={27} /></div>
            <h3>Subjective Norms</h3>
            <p>
              How friends and people around us affect our choices.
            </p>
          </div>

          <div className="pl-tpb-card">
            <span className="pl-tpb-number">03</span>
            <div className="pl-tpb-icon"><HeartHandshake size={27} /></div>
            <h3>Perceived Behavioural Control</h3>
            <p>
              How confident we feel about knowing what to do.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="pl-process" id="how-it-works">

        <div className="pl-section-heading">
          <div>
            <div className="pl-section-label">HOW PRISMA WORKS</div>
            <h2>
              Three simple steps.
              <span> One positive change.</span>
            </h2>
          </div>

          <p>
            Your learning journey is simple. Start by answering
            questions, learn through helpful activities, and
            check your progress.
          </p>
        </div>

        <div className="pl-steps-grid">

          {steps.map(({ number, icon: Icon, title, description }) => (
            <article className="pl-step-card" key={number}>

              <div className="pl-step-top">
                <span>{number}</span>
                <div className="pl-step-icon">
                  <Icon size={28} />
                </div>
              </div>

              <h3>{title}</h3>
              <p>{description}</p>

            </article>
          ))}

        </div>
      </section>

      {/* FEATURES */}
      <section className="pl-features" id="features">

        <div className="pl-features-intro">
          <div className="pl-section-label">WHAT YOU WILL FIND</div>

          <h2>
            A better way to
            <span> learn and grow.</span>
          </h2>

          <p>
            PRISMA brings together simple assessments,
            useful learning activities, and a clear view
            of your progress.
          </p>
        </div>

        <div className="pl-feature-list">

          {features.map(({ icon: Icon, title, description }, index) => (
            <article className="pl-feature-item" key={title}>

              <span className="pl-feature-number">
                0{index + 1}
              </span>

              <div className="pl-feature-icon">
                <Icon size={27} />
              </div>

              <div className="pl-feature-copy">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>

              <ArrowUpRight className="pl-feature-arrow" size={23} />

            </article>
          ))}

        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="pl-final-cta">

        <div className="pl-cta-decoration">P</div>

        <div className="pl-section-label">
          YOUR JOURNEY STARTS HERE
        </div>

        <h2>
          A kinder online world
          <span> starts with us.</span>
        </h2>

        <p>
          Take the first step. Learn how your choices can
          help make online spaces better for everyone.
        </p>

        <Link to={mainLink} className="pl-btn pl-btn-light">
          {user ? 'Open your dashboard' : 'Start your journey'}
          <ArrowUpRight size={20} />
        </Link>

      </section>

    </main>
  );
}
