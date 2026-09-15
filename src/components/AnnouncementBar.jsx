import { useState, useEffect } from 'react';

const ANNOUNCEMENTS = [
  '🚚 Envío gratis a todo Chile en compras sobre $30.000',
  '✨ Usa el cupón PATAGON10 para un 10% de descuento en tu primera compra',
  '🧸 Nuevos ingresos en Juguetes y Electrónica cada semana',
  '🔒 Compra protegida y devoluciones garantizadas por 30 días',
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="announcement-bar" aria-label="Avisos importantes">
      <div className="announcement-content">
        <span key={index} className="announcement-text fade-in-text">
          {ANNOUNCEMENTS[index]}
        </span>
      </div>
    </aside>
  );
}
