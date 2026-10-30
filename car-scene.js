// Матрица линз в анимированной сцене DMV AUTO
const headlightMatrix = document.querySelector('[data-car-matrix]');

if (headlightMatrix) {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 112; index += 1) {
    const lens = document.createElement('span');
    lens.className = 'car-scene-lens';
    fragment.appendChild(lens);
  }

  headlightMatrix.appendChild(fragment);
}
