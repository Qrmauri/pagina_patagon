const env = import.meta.env || {};
export const STORE_CONTACT = {
  whatsapp: /^\d{8,15}$/.test(env.VITE_STORE_WHATSAPP || '') ? env.VITE_STORE_WHATSAPP : '',
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.VITE_STORE_EMAIL || '') ? env.VITE_STORE_EMAIL : '',
  hours: env.VITE_STORE_HOURS || 'Horario de atención pendiente de definir.',
  delivery: env.VITE_STORE_DELIVERY || 'Las zonas y los plazos de entrega todavía no están definidos. Esta demostración no realiza despachos.',
  returns: env.VITE_STORE_RETURNS || 'Las condiciones de cambios y devoluciones estarán disponibles antes de iniciar las ventas reales.',
  pickup: env.VITE_STORE_PICKUP || 'El retiro en tienda todavía no está disponible.',
};
export function whatsappLink(message = '', contact = STORE_CONTACT) {
  return /^\d{8,15}$/.test(contact.whatsapp || '') ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}` : '/ayuda';
}
