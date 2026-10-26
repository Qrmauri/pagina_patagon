export function carouselReducer(state, action) {
  const move = step => (state.index + step + state.count) % state.count;
  if (state.count < 1) return state;
  switch (action.type) {
    case 'tick': return state.playing ? { ...state, index: move(1) } : state;
    case 'next': return { ...state, index: move(1), playing: false };
    case 'previous': return { ...state, index: move(-1), playing: false };
    case 'select': return Number.isInteger(action.index) && action.index >= 0 && action.index < state.count ? { ...state, index: action.index, playing: false } : state;
    case 'pause': return state.playing ? { ...state, playing: false } : state;
    case 'toggle': return { ...state, playing: !state.playing };
    default: return state;
  }
}

export function swipeDirection(start, end) {
  const horizontal = end.x - start.x;
  const vertical = end.y - start.y;
  return Math.abs(horizontal) >= 50 && Math.abs(horizontal) > Math.abs(vertical) ? (horizontal < 0 ? 'next' : 'previous') : null;
}
