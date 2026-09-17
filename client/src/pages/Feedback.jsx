import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { interventionsApi, dashboardApi } from '../api';
import {
  MessageSquare, Star, Send, CheckCircle2,
  AlertCircle, Sparkles
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const RATING_LABELS = {
  1: 'Needs Improvement / Limited Utility',
  2: 'Fair / Basic Concept Coverage',
  3: 'Good / Solid Practical Insight',
  4: 'Very Good / Highly Informative',
  5: 'Exceptional / Highly Actionable',
};

export default function Feedback() {
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedInterventionId, setSelectedInterventionId] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [intervRes, feedbackRes] = await Promise.all([
        interventionsApi.getMyInterventions(),
        dashboardApi.getMyFeedback(),
      ]);
      setInterventions(intervRes.data);
      setFeedbacks(feedbackRes.data);

      const submittedIds = new Set(feedbackRes.data.map((f) => f.intervention_id));
      const unrated = intervRes.data.find(
        (r) => r.status === 'completed' && !submittedIds.has(r.intervention.id)
      );
      if (unrated) {
        setSelectedInterventionId(String(unrated.intervention.id));
      } else {
        const anyCompleted = intervRes.data.find((r) => r.status === 'completed');
        if (anyCompleted) {
          setSelectedInterventionId(String(anyCompleted.intervention.id));
        }
      }
    } catch {
      setError('Failed to load feedback telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const completedModules = interventions.filter((r) => r.status === 'completed');
  const submittedIds = new Set(feedbacks.map((f) => f.intervention_id));
  const isAlreadySubmitted = selectedInterventionId && submittedIds.has(parseInt(selectedInterventionId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInterventionId) {
      setError('Please select a completed learning module to rate.');
      return;
    }
    if (!rating) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await dashboardApi.submitFeedback({
        intervention_id: parseInt(selectedInterventionId),
        rating,
        comments: comments.trim() || undefined,
      });
      setSuccess('Feedback recorded successfully! Thank you for contributing to campus safety.');
      setComments('');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit module feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="70px" width="50%" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <Skeleton height="360px" borderRadius="var(--radius-xl)" />
          <Skeleton height="360px" borderRadius="var(--radius-xl)" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
          <Badge variant="cyan" icon={<Sparkles size={12} />}>
            Quality & Efficacy Telemetry
          </Badge>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', fontFamily: 'var(--font-mono)' }}>
            FEEDBACK_LOG: {feedbacks.length}
          </span>
        </div>
        <h1 className="dashboard-greeting">Module Evaluation & Feedback</h1>
        <p className="dashboard-subtitle">
          Help us evaluate the behavioral impact of each micro-intervention module to refine future curriculum calibration.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {completedModules.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={36} color="var(--color-accent)" />}
          title="No Completed Modules Ready for Feedback"
          description="You can provide feedback once you have completed at least one personalized learning module in your Learning hub."
          actionLabel="Go to Learning Modules"
          onAction={() => navigate('/interventions')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {/* Submission Form */}
          <Card glow="primary">
            <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>
              <MessageSquare size={18} color="var(--color-primary-light)" />
              Submit Module Evaluation
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="intervention-select">
                  Select Completed Learning Module
                </label>
                <select
                  id="intervention-select"
                  className="form-input"
                  value={selectedInterventionId}
                  onChange={(e) => setSelectedInterventionId(e.target.value)}
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
                  required
                >
                  <option value="" disabled>-- Select completed module --</option>
                  {completedModules.map((r) => {
                    const alreadyRated = submittedIds.has(r.intervention.id);
                    return (
                      <option key={r.intervention.id} value={r.intervention.id}>
                        {alreadyRated ? '✓ (Rated) ' : '⭐ '}
                        {r.intervention.title} ({r.intervention.target_construct})
                      </option>
                    );
                  })}
                </select>
              </div>

              {isAlreadySubmitted ? (
                <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <div>
                    You have already submitted an evaluation for this module. You can select another module or view your submission history on the right.
                  </div>
                </div>
              ) : (
                <>
                  {/* Rating Stars */}
                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>
                        Efficacy Rating
                      </label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-warning)', fontWeight: 700 }}>
                        {RATING_LABELS[hoverRating || rating]}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || rating) >= star;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 4,
                              color: active ? '#f59e0b' : 'var(--color-text-subtle)',
                              transition: 'transform 0.15s ease, color 0.15s ease',
                              transform: (hoverRating || rating) === star ? 'scale(1.18)' : 'scale(1)',
                            }}
                            title={`${star} Star${star > 1 ? 's' : ''}`}
                          >
                            <Star size={30} fill={active ? '#f59e0b' : 'none'} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <label className="form-label" htmlFor="feedback-comments">
                      Learning Impact & Reflection (Optional)
                    </label>
                    <textarea
                      id="feedback-comments"
                      className="form-input"
                      rows={4}
                      placeholder="What was the most impactful concept? How did this module change your perspective on peer bystanders or reporting cyber harassment?"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      style={{ resize: 'vertical', minHeight: '95px' }}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="cyan"
                    size="lg"
                    style={{ width: '100%', marginTop: '1rem' }}
                    loading={submitting}
                    disabled={!selectedInterventionId}
                    iconRight={<Send size={15} />}
                  >
                    Submit Evaluation Telemetry
                  </Button>
                </>
              )}
            </form>
          </Card>

          {/* Feedback History */}
          <Card glow="cyan">
            <div className="card-header">
              <h2 className="card-title">
                <CheckCircle2 size={18} color="var(--color-success-light)" />
                Your Evaluation History ({feedbacks.length})
              </h2>
              <span className="badge badge-primary">{feedbacks.length} Logged</span>
            </div>

            {feedbacks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                <p>No feedback records logged yet.</p>
                <p style={{ fontSize: '0.82rem', marginTop: '0.5rem', color: 'var(--color-text-subtle)' }}>
                  Select a completed module and record your initial review.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {feedbacks.map((f) => {
                  const interv = interventions.find((r) => r.intervention.id === f.intervention_id)?.intervention;
                  return (
                    <div
                      key={f.id}
                      style={{
                        background: 'var(--color-surface-2)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#fff' }}>
                          {interv?.title || `Module #${f.intervention_id}`}
                        </span>
                        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              color={s <= f.rating ? '#f59e0b' : 'var(--color-text-subtle)'}
                              fill={s <= f.rating ? '#f59e0b' : 'none'}
                            />
                          ))}
                        </div>
                      </div>

                      {f.comments && (
                        <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', margin: '0.4rem 0', fontStyle: 'italic' }}>
                          "{f.comments}"
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                        <span>Target: {interv?.target_construct || 'TPB'}</span>
                        <span>{f.submitted_at ? new Date(f.submitted_at).toLocaleDateString() : 'Archived'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </motion.div>
  );
}
