'use strict';

// Получаем все необходимые элементы
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const minSlider = document.querySelector('.range-scale__button[aria-controls="min-price"]');
const maxSlider = document.querySelector('.range-scale__button[aria-controls="max-price"]');
const rangeBar = document.querySelector('.range-scale__progress');
const rangeContainer = document.querySelector('.range-scale');

// Устанавливаем минимальные и максимальные значения
const minValue = 0;
const maxValue = 11500;
const minGap = 100; // Минимальный разрыв между значениями
const step = 100; // Шаг изменения при управлении клавиатурой

// Функция для обновления позиции полосы
function updateRange() {
  let minVal = parseInt(minPriceInput.value) || minValue;
  let maxVal = parseInt(maxPriceInput.value) || maxValue;

  // Применяем минимальный разрыв и границы
  minVal = Math.max(minValue, Math.min(minVal, maxVal - minGap));
  maxVal = Math.min(maxValue, Math.max(maxVal, minVal + minGap));

  // Обновляем значения в инпутах только если они изменились
  if (parseInt(minPriceInput.value) !== minVal) minPriceInput.value = minVal;
  if (parseInt(maxPriceInput.value) !== maxVal) maxPriceInput.value = maxVal;

  // Обновляем ARIA атрибуты
  minSlider.setAttribute('aria-valuenow', minVal);
  maxSlider.setAttribute('aria-valuenow', maxVal);

  // Вычисляем позиции в процентах
  const minPercent = ((minVal - minValue) / (maxValue - minValue)) * 100;
  const maxPercent = ((maxVal - minValue) / (maxValue - minValue)) * 100;

  // Обновляем позицию полосы (rangeBar)
  rangeBar.style.left = `calc(${minPercent}% + 10px)`;
  rangeBar.style.width = `calc(${maxPercent - minPercent}% - 20px)`;
}

// Функция для обработки перетаскивания ползунка
function startDragging(event) {
  const slider = event.target.closest('.range-scale__button');
  if (!slider) return;

  const isMinSlider = slider.getAttribute('aria-controls') === 'min-price';
  const rect = rangeContainer.getBoundingClientRect();

  function onMouseMove(e) {
    const position = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (position / rect.width) * (maxValue - minValue);
    const value = Math.round(percent) + minValue;

    if (isMinSlider) {
      minPriceInput.value = value;
    } else {
      maxPriceInput.value = value;
    }

    updateRange();
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

// Функция для обработки клавиатурного управления
function handleKeyboard(event) {
  const slider = event.target.closest('.range-scale__button');
  if (!slider) return;

  const isMinSlider = slider.getAttribute('aria-controls') === 'min-price';
  let minVal = parseInt(minPriceInput.value) || minValue;
  let maxVal = parseInt(maxPriceInput.value) || maxValue;

  // Определяем направление изменения
  let newValue;
  switch (event.key) {
    case 'ArrowLeft':
      newValue = (isMinSlider ? minVal : maxVal) - step;
      break;
    case 'ArrowRight':
      newValue = (isMinSlider ? minVal : maxVal) + step;
      break;
    default:
      return; // Игнорируем другие клавиши
  }

  // Применяем новое значение с учетом границ и минимального разрыва
  if (isMinSlider) {
    minVal = Math.max(minValue, Math.min(newValue, maxVal - minGap));
    minPriceInput.value = minVal;
  } else {
    maxVal = Math.min(maxValue, Math.max(newValue, minVal + minGap));
    maxPriceInput.value = maxVal;
  }

  updateRange();
  event.preventDefault(); // Предотвращаем прокрутку страницы стрелками
}

// Обработка ввода в поля
function handleInput(event) {
  const input = event.target;
  const currentValue = input.value;

  // Если поле пустое, просто обновляем слайдер с текущими значениями
  if (currentValue === '') {
    let minVal = parseInt(minPriceInput.value) || minValue;
    let maxVal = parseInt(maxPriceInput.value) || maxValue;

    // Обновляем ARIA атрибуты
    minSlider.setAttribute('aria-valuenow', minVal);
    maxSlider.setAttribute('aria-valuenow', maxVal);

    // Вычисляем позиции в процентах
    const minPercent = ((minVal - minValue) / (maxValue - minValue)) * 100;
    const maxPercent = ((maxVal - minValue) / (maxValue - minValue)) * 100;

    // Обновляем позицию полосы
    rangeBar.style.left = `calc(${minPercent}% + 10px)`;
    rangeBar.style.width = `calc(${maxPercent - minPercent}% - 20px)`;
    return;
  }

  // Преобразуем значение в число
  let value = parseInt(currentValue);
  if (isNaN(value)) {
    return; // Пропускаем некорректный ввод, чтобы не мешать стиранию
  }

  // Ограничиваем только основные границы во время ввода
  value = Math.max(minValue, Math.min(value, maxValue));
  input.value = value;

  // Обновляем слайдер сразу
  let minVal = parseInt(minPriceInput.value) || minValue;
  let maxVal = parseInt(maxPriceInput.value) || maxValue;

  // Обновляем ARIA атрибуты
  minSlider.setAttribute('aria-valuenow', minVal);
  maxSlider.setAttribute('aria-valuenow', maxVal);

  // Вычисляем позиции в процентах
  const minPercent = ((minVal - minValue) / (maxValue - minValue)) * 100;
  const maxPercent = ((maxVal - minValue) / (maxValue - minValue)) * 100;

  // Обновляем позицию полосы
  rangeBar.style.left = `calc(${minPercent}% + 10px)`;
  rangeBar.style.width = `calc(${maxPercent - minPercent}% - 20px)`;
}

// Обработка ухода из поля (blur)
function handleBlur(event) {
  const input = event.target;
  let value = parseInt(input.value);

  // Если поле пустое или содержит некорректное значение, устанавливаем значение по умолчанию
  if (input.value === '' || isNaN(value)) {
    input.value = input.id === 'min-price' ? minValue : maxValue;
  }

  // Применяем минимальный разрыв только после завершения ввода
  updateRange();
}

// Добавляем обработчики событий
minSlider.addEventListener('mousedown', startDragging);
maxSlider.addEventListener('mousedown', startDragging);
minSlider.addEventListener('keydown', handleKeyboard);
maxSlider.addEventListener('keydown', handleKeyboard);
minPriceInput.addEventListener('input', handleInput);
maxPriceInput.addEventListener('input', handleInput);
minPriceInput.addEventListener('blur', handleBlur);
maxPriceInput.addEventListener('blur', handleBlur);

// Инициализация
updateRange();
