/**
 * pages/Feedback.jsx — Student Feedback on Intervention Modules.
 * Allows students to rate and provide feedback on completed learning modules,
 * and view their previously submitted feedback.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interventionsApi, dashboardApi } from '../api';
import {
  MessageSquare, Star, Send, CheckCircle2,
  BookOpen, Clock, AlertCircle
} from 'lucide-react';

const RATING_LABELS = {
  1: '1 - Needs Improvement',
  2: '2 - Fair',
  3: '3 - Good',
  4: '4 - Very Good',
  5: '5 - Excellent / Highly Useful',
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

      // Pre-select first completed intervention that doesn't have feedback yet
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
      setError('Failed to load feedback information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      setError('Please select a star rating between 1 and 5.');
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
      setSuccess('Thank you! Your feedback has been recorded successfully.');
      setComments('');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-greeting">Intervention Feedback</h1>
        <p className="dashboard-subtitle">
          Help us evaluate and improve the learning experience by sharing your thoughts on completed modules
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {completedModules.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            No Completed Modules Yet
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            You can provide feedback once you have completed at least one personalized learning module.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/interventions')}>
            Go to Learning Modules
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Feedback Form Card */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="var(--color-primary-light)" />
              Submit Module Feedback
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="intervention-select">
                  Select Completed Module
                </label>
                <select
                  id="intervention-select"
                  className="form-input"
                  value={selectedInterventionId}
                  onChange={(e) => setSelectedInterventionId(e.target.value)}
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
                  required
                >
                  <option value="" disabled>-- Select a completed module --</option>
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
                  <AlertCircle size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  You have already submitted feedback for this module. Check your feedback history on the right.
                </div>
              ) : (
                <>
                  {/* Star Rating */}
                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <label className="form-label">
                      Rating: <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{RATING_LABELS[hoverRating || rating]}</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
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
                              transform: (hoverRating || rating) === star ? 'scale(1.15)' : 'scale(1)',
                            }}
                          >
                            <Star size={26} fill={active ? '#f59e0b' : 'none'} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <label className="form-label" htmlFor="feedback-comments">
                      Comments & Learning Experience (Optional)
                    </label>
                    <textarea
                      id="feedback-comments"
                      className="form-input"
                      rows={4}
                      placeholder="What did you find most useful? How has this module helped your understanding of cyberbullying or online communication?"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      style={{ resize: 'vertical', minHeight: '90px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1.25rem' }}
                    disabled={submitting || !selectedInterventionId}
                  >
                    {submitting ? (
                      <>
                        <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                        Submitting Feedback...
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Submit Feedback
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Submitted Feedback History */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--color-success)" />
              Your Feedback History ({feedbacks.length})
            </h2>

            {feedbacks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)' }}>
                <p>No feedback submitted yet.</p>
                <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>
                  Select a completed module above and share your thoughts.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
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
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>
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
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.4rem 0', fontStyle: 'italic' }}>
                          "{f.comments}"
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '0.5rem' }}>
                        <span>Construct: {interv?.target_construct || 'TPB'}</span>
                        <span>{f.submitted_at ? new Date(f.submitted_at).toLocaleDateString() : 'Recorded'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
