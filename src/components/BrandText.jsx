// Pooh conserva sus letras originales. Los acentos se dibujan sobre la letra
// base; el texto español completo permanece disponible para lectores de pantalla.
const accents = {
  á: ['a', 'acute'], é: ['e', 'acute'], í: ['i', 'acute'],
  ó: ['o', 'acute'], ú: ['u', 'acute'], ñ: ['n', 'tilde'], ü: ['u', 'diaeresis'],
  Á: ['A', 'acute'], É: ['E', 'acute'], Í: ['I', 'acute'],
  Ó: ['O', 'acute'], Ú: ['U', 'acute'], Ñ: ['N', 'tilde'], Ü: ['U', 'diaeresis'],
};

export default function BrandText({ text }) {
  return <span className="brand-text"><span className="brand-sr-only">{text}</span><span aria-hidden="true">{text.normalize('NFC').split(/(\s+)/u).map((word, wordIndex) => /\s/u.test(word) ? word : <span className="brand-word" key={wordIndex}>{Array.from(word).map((letter, index) => {
    const accent = accents[letter];
    if (!accent) return letter;
    return <span key={index} className={`brand-letter brand-letter--${accent[1]}${letter === letter.toUpperCase() ? ' brand-letter--capital' : ''}`}>
      <span className={letter === 'í' ? 'brand-letter-base brand-letter-base--dotless' : 'brand-letter-base'}>{accent[0]}</span><svg className="brand-letter-mark" viewBox="0 0 24 12" fill="none" focusable="false">
        {accent[1] === 'acute' && <path d="M9 9 15 3" />}
        {accent[1] === 'tilde' && <path d="M3 8C8 0 16 12 21 4" />}
        {accent[1] === 'diaeresis' && <><circle cx="7" cy="6" r="2" /><circle cx="17" cy="6" r="2" /></>}
      </svg>
    </span>;
  })}</span>)}</span></span>;
}
