import { useState, useEffect } from 'react';
import { INITIAL_TESTIMONIALS } from '../services/productsData';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const STORAGE_KEY = 'patagon-testimonials';

const AVATAR_OPTIONS = ['👩‍🦰', '👨‍💼', '👩‍🏫', '🧑‍🎨', '🧑‍💻', '👨‍🌾', '👧', '👵', '⭐'];

const RATING_LABELS = {
  1: 'Mala experiencia',
  2: 'Regular',
  3: 'Buena',
  4: 'Muy buena',
  5: '¡Excelente!',
};

export default function TestimonialsSection() {
  const { addToast } = useToast();
  const [testimonials, setTestimonials] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error leyendo testimonios locales:', e);
    }
    return INITIAL_TESTIMONIALS;
  });

  const [showForm, setShowForm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    city: '',
    rating: 5,
    comment: '',
    avatar: '👩‍🦰',
  });

  // Sincronizar testimonios con backend Django si está encendido
  useEffect(() => {
    let isMounted = true;
    api.getTestimonials()
      .then(async (data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } else if (Array.isArray(data) && data.length === 0) {
          try {
            await api.seedTestimonials();
            const seeded = await api.getTestimonials();
            if (isMounted && Array.isArray(seeded) && seeded.length > 0) {
              setTestimonials(seeded);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
            }
          } catch (err) {
            console.warn('No se pudo sembrar testimonios en Django:', err);
          }
        }
      })
      .catch((err) => {
        console.warn('Backend inactivo para testimonios, usando local:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
    } catch (e) {
      console.error('Error guardando testimonios locales:', e);
    }
  }, [testimonials]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (num) => {
    setForm((prev) => ({ ...prev, rating: num }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('Por favor, ingresa tu nombre.', 'error');
      return;
    }
    if (!form.comment.trim()) {
      addToast('Por favor, cuéntanos brevemente tu experiencia.', 'error');
      return;
    }

    setSubmitting(true);
    const newTestimonial = {
      name: form.name.trim(),
      city: form.city.trim() || 'Chile',
      rating: form.rating,
      comment: form.comment.trim(),
      avatar: form.avatar || '👤',
    };

    try {
      const created = await api.createTestimonial(newTestimonial);
      setTestimonials((prev) => [created, ...prev]);
      addToast('¡Muchas gracias! Tu opinión ha sido publicada exitosamente. ⭐', 'success');
    } catch (err) {
      console.warn('Guardando testimonio en modo local:', err.message);
      const localItem = {
        ...newTestimonial,
        id: Date.now(),
        created_at: new Date().toISOString(),
      };
      setTestimonials((prev) => [localItem, ...prev]);
      addToast('¡Muchas gracias por dejarnos tu reseña! ⭐', 'success');
    } finally {
      setSubmitting(false);
      setForm({
        name: '',
        city: '',
        rating: 5,
        comment: '',
        avatar: '👩‍🦰',
      });
      setShowForm(false);
    }
  };

  return (
    <section className="testimonials-section">
      <div className="section-heading" style={{ textAlign: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <div>
          <span className="section-kicker">Comunidad Patagon</span>
          <h2>Clientes felices en todo Chile</h2>
          <p style={{ color: '#7a746e', maxWidth: '600px', margin: '8px auto 0', fontSize: '15px' }}>
            Tu opinión nos ayuda a seguir mejorando cada día. ¿Compraste con nosotros? ¡Comparte tu experiencia!
          </p>
        </div>
      </div>

      {/* Botón para abrir el formulario */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          style={{
            background: showForm ? '#eedec9' : '#f26419',
            color: showForm ? '#1c1a18' : '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '12px 28px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: showForm ? 'none' : '0 4px 16px rgba(242,100,25,.3)',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {showForm ? '✕ Cerrar formulario' : '✍️ Comentar mi experiencia'}
        </button>
      </div>

      {/* Formulario de comentario de cliente */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="fade-up"
          style={{
            maxWidth: '680px',
            margin: '0 auto 48px',
            background: '#fff',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 8px 32px rgba(28,26,24,.10)',
            border: '2px solid #eedec9',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', color: '#1c1a18', marginBottom: '4px' }}>
              🌟 Comparte tu experiencia en Patagon Store
            </h3>
            <p style={{ color: '#7a746e', fontSize: '14px' }}>
              Tu comentario se publicará para que otros compradores conozcan tu experiencia.
            </p>
          </div>

          {/* Calificación de Estrellas Interactivas */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '14px', marginBottom: '8px', color: '#1c1a18' }}>
              ¿Cómo calificarías tu experiencia?
            </span>
            <div
              style={{
                display: 'inline-flex',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '32px',
                lineHeight: 1,
              }}
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hoverRating || form.rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '32px',
                      color: filled ? '#f59e0b' : '#d1d5db',
                      transform: filled ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s, color 0.15s',
                      padding: 0,
                    }}
                    title={`${star} estrellas`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <div style={{ color: '#f26419', fontWeight: 700, fontSize: '13px', marginTop: '6px', minHeight: '20px' }}>
              {RATING_LABELS[hoverRating || form.rating]}
            </div>
          </div>

          {/* Campos Nombre y Ciudad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <label>
              <span style={{ display: 'block', fontWeight: 700, fontSize: '13px', marginBottom: '6px', color: '#1c1a18' }}>
                Tu Nombre *
              </span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej: Carolina Morales"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 700, fontSize: '13px', marginBottom: '6px', color: '#1c1a18' }}>
                Ciudad o Región
              </span>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Ej: Valparaíso, Temuco, etc."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </label>
          </div>

          {/* Selector de Avatar */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: '#1c1a18' }}>
              Elige tu avatar o ícono:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, avatar: emoji }))}
                  style={{
                    fontSize: '22px',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    border: form.avatar === emoji ? '2px solid #f26419' : '1px solid #e5e7eb',
                    background: form.avatar === emoji ? '#fff0e6' : '#fff',
                    cursor: 'pointer',
                    transform: form.avatar === emoji ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.15s',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Comentario */}
          <label style={{ display: 'block', marginBottom: '20px' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '13px', marginBottom: '6px', color: '#1c1a18' }}>
              Tu Comentario o Experiencia *
            </span>
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              placeholder="Cuéntanos qué compraste, qué tal fue el envío, la atención o la calidad de los productos..."
              rows={4}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                lineHeight: 1.5,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </label>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                background: '#f3f4f6',
                color: '#4b5563',
                border: 'none',
                borderRadius: '999px',
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: '#f26419',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '10px 24px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Publicando...' : '⭐ Publicar mi reseña'}
            </button>
          </div>
        </form>
      )}

      {/* Cuadrícula de testimonios */}
      <div className="testimonials-grid">
        {Array.isArray(testimonials) && testimonials.map((t) => {
          const safeRating = Math.min(5, Math.max(1, Math.round(Number(t.rating) || 5)));
          return (
            <article key={t.id || t.created_at || Math.random()} className="testimonial-card fade-up">
              <div className="testimonial-stars">
                {'★'.repeat(safeRating)}
                <span style={{ color: '#d1d5db' }}>
                  {'★'.repeat(Math.max(0, 5 - safeRating))}
                </span>
              </div>
              <p className="testimonial-comment">"{t.comment || ''}"</p>
              <div className="testimonial-author">
                <span className="author-avatar">{t.avatar || '👤'}</span>
                <div>
                  <strong>{t.name || 'Cliente'}</strong>
                  <small>{t.city ? `${t.city}, Chile` : 'Cliente verificado'}</small>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

