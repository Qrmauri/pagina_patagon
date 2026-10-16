import CategoryPage from './CategoryPage'

export default function LibreriaPage() {
  return <CategoryPage title="Librería" emoji="✏️" category="libros" description="Útiles escolares, artículos de oficina, manualidades y libros para estudiar, trabajar y crear.">
    <section className="stationery-guide" aria-labelledby="stationery-heading">
      <h2 id="stationery-heading">Librería para tu día a día</h2>
      <p>En Patagon Store, librería reúne mucho más que libros. Estas son las líneas de productos de esta sección:</p>
      <dl className="stationery-lines">
        <div><dt>Útiles escolares</dt><dd>Cuadernos, lápices, gomas y materiales para clases.</dd></div>
        <div><dt>Oficina</dt><dd>Papel, carpetas, archivadores y artículos de escritorio.</dd></div>
        <div><dt>Manualidades</dt><dd>Cartulinas, pinturas, adhesivos y materiales para crear.</dd></div>
        <div><dt>Libros</dt><dd>Lectura, cuentos y títulos educativos.</dd></div>
      </dl>
      <p className="stationery-availability">Consulta los productos publicados más abajo para conocer precios y disponibilidad.</p>
    </section>
  </CategoryPage>
}
