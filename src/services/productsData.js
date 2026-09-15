export const INITIAL_PRODUCTS = [
  {
    id: 1,
    title: 'Peluche Clásico',
    category: 'juguetes',
    price: 15990,
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1cabab?w=400&auto=format&fit=crop',
    description: 'Peluche suave y adorable para los más pequeños',
  },
  {
    id: 2,
    title: 'Consola Gaming',
    category: 'electrónica',
    price: 299990,
    image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=400&auto=format&fit=crop',
    description: 'Última generación para juegos ultra HD',
  },
  {
    id: 3,
    title: 'Libro Aventuras',
    category: 'libros',
    price: 8990,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop',
    description: 'Historias fascinantes para todas las edades',
  },
  {
    id: 4,
    title: 'Robot Educativo',
    category: 'juguetes',
    price: 45990,
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop',
    description: 'Aprende programación de forma divertida',
  },
  {
    id: 5,
    title: 'Audífonos Premium',
    category: 'electrónica',
    price: 129990,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop',
    description: 'Sonido cristalino con cancelación de ruido',
  },
  {
    id: 6,
    title: 'Libro de Ciencia',
    category: 'libros',
    price: 12990,
    image: 'https://images.unsplash.com/photo-150784272343-583f20270319?w=400&auto=format&fit=crop',
    description: 'Explora los misterios del universo',
  },
];

/**
 * Normaliza cualquier precio (string como "$15.990", "15990" o número) a número entero.
 */
export function parsePrice(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Formatea un número a formato de moneda chilena: "$ 15.990"
 */
export function formatPrice(num) {
  const cleanNum = parsePrice(num);
  return '$' + cleanNum.toLocaleString('es-CL');
}

export const INITIAL_TESTIMONIALS = [
  {
    id: 1,
    name: 'Camila Valenzuela',
    city: 'Punta Arenas',
    rating: 5,
    comment: 'Compré el peluche y un libro de cuentos para mi sobrino. La calidad es increíble y llegó antes de lo esperado a Magallanes. ¡100% recomendados!',
    avatar: '👩‍🦰',
    created_at: '2026-09-01T12:00:00Z',
  },
  {
    id: 2,
    name: 'Matías Osorio',
    city: 'Santiago',
    rating: 5,
    comment: 'Los audífonos llegaron impecables y con un empaque muy cuidado. El proceso de compra fue súper sencillo y la atención excelente.',
    avatar: '👨‍💼',
    created_at: '2026-09-03T15:30:00Z',
  },
  {
    id: 3,
    name: 'Francisca Morales',
    city: 'Concepción',
    rating: 5,
    comment: 'Excelente catálogo. Es muy reconfortante encontrar una tienda que cuide los detalles y ofrezca productos educativos de tan buen nivel.',
    avatar: '👩‍🏫',
    created_at: '2026-09-05T18:15:00Z',
  },
];

