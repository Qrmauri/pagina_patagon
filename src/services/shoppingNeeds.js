export const SHOPPING_NEEDS = [
  { id: 'escolar', title: 'Vuelta a clases', description: 'Cuadernos, lápices y materiales escolares', category: 'libros', path: '/libreria', color: 'gold', terms: ['escolar', 'cuaderno', 'lapiz', 'lapices', 'goma', 'regla', 'estuche', 'mochila', 'educativo'] },
  { id: 'oficina', title: 'Para la oficina', description: 'Papel, carpetas y artículos de escritorio', category: 'libros', path: '/libreria', color: 'teal', terms: ['oficina', 'papel', 'carpeta', 'archivador', 'escritorio', 'corchetera', 'clip', 'boligrafo'] },
  { id: 'crear', title: 'Para crear', description: 'Colores y materiales para tus proyectos', category: 'libros', path: '/libreria', color: 'red', terms: ['manualidad', 'cartulina', 'pintura', 'adhesivo', 'color', 'acuarela', 'pincel', 'tempera', 'tijera', 'pegamento'] },
  { id: 'regalos', title: 'Para regalar', description: 'Juguetes para compartir una sonrisa', category: 'juguetes', path: '/juguetes', color: 'teal', terms: [] },
];

const normalize = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function filterByNeed(products, needId) {
  const need = SHOPPING_NEEDS.find(item => item.id === needId);
  if (!need) return products;
  return products.filter(product => {
    if (normalize(product.category) !== normalize(need.category)) return false;
    if (Array.isArray(product.shopping_needs)) return product.shopping_needs.includes(needId);
    const text = normalize(`${product.title ?? ''} ${product.description ?? ''}`);
    return need.terms.length === 0 || need.terms.some(term => text.includes(term));
  });
}
