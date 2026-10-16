// La API conserva la clave histórica para no alterar productos ni pedidos.
export function categoryLabel(category) {
  return category === 'libros' ? 'Librería' : category;
}
