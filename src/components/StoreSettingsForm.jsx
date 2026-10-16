import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { publishStoreContact } from '../hooks/useStoreContact';
import { useToast } from '../hooks/useToast';

const fields = { whatsapp: 'WhatsApp (código de país y número, solo dígitos)', email: 'Correo de atención', hours: 'Horario de atención', delivery: 'Zonas, plazos y condiciones de despacho', pickup: 'Retiro: dirección, horarios y coordinación', returns: 'Cambios y devoluciones' };

export default function StoreSettingsForm() {
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  useEffect(() => {
    let active = true;
    api.getStoreSettings().then(data => { if (active) setForm(data); }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, []);
  const save = async event => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const data = await api.saveStoreSettings(form);
      setForm(data); publishStoreContact(data); addToast('Datos comerciales guardados.', 'success');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };
  return <section className="store-settings-admin"><h2>Información comercial</h2>
    <p>Completa únicamente datos confirmados. Déjalos vacíos si todavía no están definidos. Estos cambios no activan pagos ni modifican las tarifas del carrito.</p>
    {error && <p role="alert">{error}</p>}
    {!form && !error && <p role="status">Cargando configuración…</p>}
    {!form && error && <button type="button" onClick={() => { setError(''); api.getStoreSettings().then(setForm).catch(err => setError(err.message)); }}>Reintentar conexión</button>}
    {form && <form onSubmit={save}>{Object.entries(fields).map(([key, label]) => <label key={key}>{label}{['delivery', 'pickup', 'returns'].includes(key) ? <textarea maxLength={2000} rows={3} value={form[key] || ''} onChange={event => setForm(previous => ({ ...previous, [key]: event.target.value }))} /> : <input type={key === 'email' ? 'email' : 'text'} maxLength={key === 'whatsapp' ? 15 : 250} pattern={key === 'whatsapp' ? '[0-9]{8,15}' : undefined} inputMode={key === 'whatsapp' ? 'numeric' : undefined} value={form[key] || ''} onChange={event => setForm(previous => ({ ...previous, [key]: event.target.value }))} />}</label>)}<button className="btn-primary" disabled={saving} aria-busy={saving}>{saving ? 'Guardando…' : 'Guardar información'}</button></form>}
  </section>;
}
