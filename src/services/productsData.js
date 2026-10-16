export const INITIAL_PRODUCTS = [
  {
    id: 1,
    title: 'Peluche Clásico',
    category: 'juguetes',
    price: 15990,
    stock: 15,
    image: '/products/illustrations/peluche-clasico.webp',
    description: 'Peluche suave y adorable para los más pequeños',
  },
  {
    id: 2,
    title: 'Consola Gaming',
    category: 'electrónica',
    price: 299990,
    stock: 8,
    image: '/products/illustrations/consola-gaming.webp',
    description: 'Última generación para juegos ultra HD',
  },
  {
    id: 3,
    title: 'Libro Aventuras',
    category: 'libros',
    price: 8990,
    stock: 20,
    image: '/products/illustrations/libro-aventuras.webp',
    description: 'Historias fascinantes para todas las edades',
  },
  {
    id: 4,
    title: 'Robot Educativo',
    category: 'juguetes',
    price: 45990,
    stock: 5,
    image: '/products/illustrations/robot-educativo.webp',
    description: 'Aprende programación de forma divertida',
  },
  {
    id: 5,
    title: 'Audífonos Premium',
    category: 'electrónica',
    price: 129990,
    stock: 12,
    image: '/products/illustrations/audifonos-premium.webp',
    description: 'Sonido cristalino con cancelación de ruido',
  },
  {
    id: 6,
    title: 'Libro de Ciencia',
    category: 'libros',
    price: 12990,
    stock: 18,
    image: '/products/illustrations/libro-ciencia.webp',
    description: 'Explora los misterios del universo',
  },
  { id: 7, title: 'Cuaderno escolar · ejemplo', category: 'libros', price: 2490, stock: 10, image: '/product-placeholder.svg', shopping_needs: ['escolar', 'oficina'], description: 'Producto de demostración para organizar apuntes. Reemplazar con un artículo real antes de vender.', specifications: {}, gallery: [] },
  { id: 8, title: 'Lápices de colores · ejemplo', category: 'libros', price: 3990, stock: 10, image: '/product-placeholder.svg', shopping_needs: ['escolar', 'crear'], description: 'Ejemplo de materiales escolares y creativos. Precio y stock de demostración.', specifications: {}, gallery: [] },
  { id: 9, title: 'Carpeta de oficina · ejemplo', category: 'libros', price: 1990, stock: 10, image: '/product-placeholder.svg', shopping_needs: ['oficina', 'escolar'], description: 'Ejemplo para organizar documentos. Reemplazar con información y fotografías reales.', specifications: {}, gallery: [] },
  { id: 10, title: 'Pinturas para manualidades · ejemplo', category: 'libros', price: 4990, stock: 10, image: '/product-placeholder.svg', shopping_needs: ['crear', 'escolar'], description: 'Producto de demostración para proyectos creativos. No corresponde a una oferta real.', specifications: {}, gallery: [] },
];

// Actualiza únicamente las imágenes originales de ejemplo. Conserva las fotos
// personalizadas y las subidas al backend, incluso con el mismo título.
const LEGACY_IMAGES = [
  '1594787318286-3d835c1cabab', '1586348943529-beaae6c28db9',
  '1512820790803-83ca734da794', '1485846234645-a62644f84728',
  '1505740420928-5e560c06d30e', '150784272343-583f20270319',
];

export function withCatalogIllustration(product) {
  if (product.image_file) return product;
  const index = INITIAL_PRODUCTS.findIndex((item) => item.title === product.title);
  if (index >= 0 && product.image === INITIAL_PRODUCTS[index].image.replace('.webp', '.png')) {
    return { ...product, image: INITIAL_PRODUCTS[index].image };
  }
  if (index < 0 || !product.image?.startsWith(`https://images.unsplash.com/photo-${LEGACY_IMAGES[index]}?`)) return product;
  return { ...product, image: INITIAL_PRODUCTS[index].image };
}

export function isProductIllustration(product) {
  return product.image?.startsWith('/products/illustrations/') === true;
}

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

