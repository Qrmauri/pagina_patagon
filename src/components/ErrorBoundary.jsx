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
          fontFamily: 'system-ui, -apple-system, sans-serif',
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
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🛒</span>
            <h1 style={{ fontSize: '24px', color: '#1c1a18', marginBottom: '8px' }}>
              Actualizando Patagon Store
            </h1>
            <p style={{ color: '#7a746e', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
              Hubo una actualización en la tienda. Haz clic abajo para sincronizar tu navegador.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  background: '#f26419',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: 700,
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
                  fontSize: '14px',
                  fontWeight: 600,
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
