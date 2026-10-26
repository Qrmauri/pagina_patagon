import test from 'node:test';
import assert from 'node:assert/strict';
import { carouselReducer, swipeDirection } from './heroCarousel.js';

const initial = { index: 0, playing: true, count: 5 };
test('el carrusel recorre y vuelve al inicio, y la navegación manual pausa', () => {
  assert.equal(carouselReducer({ ...initial, index: 4 }, { type: 'tick' }).index, 0);
  const previous = carouselReducer(initial, { type: 'previous' });
  assert.equal(previous.index, 4);
  assert.equal(previous.playing, false);
  assert.equal(carouselReducer(previous, { type: 'tick' }), previous);
  assert.deepEqual(carouselReducer(initial, { type: 'select', index: 2 }), { ...initial, index: 2, playing: false });
  assert.equal(carouselReducer(initial, { type: 'select', index: 9 }), initial);
  assert.equal(carouselReducer(previous, { type: 'toggle' }).playing, true);
});
test('pausa explícita y desplazamientos verticales o pequeños no cambian la foto', () => {
  assert.equal(carouselReducer(initial, { type: 'pause' }).playing, false);
  assert.equal(swipeDirection({ x: 200, y: 50 }, { x: 110, y: 55 }), 'next');
  assert.equal(swipeDirection({ x: 100, y: 50 }, { x: 190, y: 55 }), 'previous');
  assert.equal(swipeDirection({ x: 100, y: 50 }, { x: 110, y: 140 }), null);
  assert.equal(swipeDirection({ x: 100, y: 50 }, { x: 120, y: 52 }), null);
});
