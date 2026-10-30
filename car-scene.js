// Матрица фар: 4 колонки × 8 рядов = 32 белые LED-линзы
const matrix = document.getElementById('nivaLedMatrix');
if (matrix) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 32; i += 1) {
    const bulb = document.createElement('span');
    bulb.className = 'niva-mini-bulb';
    fragment.appendChild(bulb);
  }
  matrix.appendChild(fragment);
}