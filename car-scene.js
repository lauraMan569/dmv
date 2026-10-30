// Матрица фар: 14 колонок × 6 рядов = 84 линзы
const matrix = document.getElementById('matrixLenses');
if (matrix) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 84; i += 1) {
    const lens = document.createElement('span');
    lens.className = 'car-scene-lens';
    fragment.appendChild(lens);
  }
  matrix.appendChild(fragment);
}