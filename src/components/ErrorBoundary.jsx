import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  handleClearCache = () => {
    try {
      localStorage.clear()
    } catch (e) {
      console.error(e)
    }
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fdf6ee',
          fontFamily: 'var(--font-body)',
          padding: '24px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '20px',
            padding: '36px 32px',
            boxShadow: '0 10px 40px rgba(28,26,24,0.12)',
            textAlign: 'center',
            border: '1px solid #eedec9',
          }}>
            <span style={{ fontSize: 'var(--text-4xl)', display: 'block', marginBottom: '16px' }}>🛒</span>
            <h1 style={{ fontSize: 'var(--text-page-title)', color: '#1c1a18', marginBottom: '8px' }}>
              Actualizando Patagon Store
            </h1>
            <p style={{ color: '#7a746e', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-body)', marginBottom: '20px' }}>
              Hubo una actualización en la tienda. Haz clic abajo para sincronizar tu navegador.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  background: 'var(--brand-red-dark)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '12px 24px',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-bold)',
                  cursor: 'pointer',
                }}
              >
                🔄 Actualizar vista
              </button>
              <button
                type="button"
                onClick={this.handleClearCache}
                style={{
                  background: '#f3f4f6',
                  color: '#1c1a18',
                  border: '1px solid #d1d5db',
                  borderRadius: '999px',
                  padding: '12px 20px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-semibold)',
                  cursor: 'pointer',
                }}
              >
                🧹 Limpiar caché local
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
