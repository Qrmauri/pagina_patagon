export default function ProductGallery({ title, images }) {
  return (
    <section className="gallery-section">
      <div className="gallery-header">
        <h2>{title}</h2>
        <p>Explora imágenes destacadas de nuestros productos.</p>
      </div>
      <div className="gallery-grid">
        {images.map((img, index) => (
          <div key={index} className="gallery-card">
            <img src={img.src} alt={img.alt} />
            <div className="gallery-caption">{img.alt}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
