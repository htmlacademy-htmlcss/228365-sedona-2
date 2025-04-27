'use strict';

const MAX_PRICE = 9000;
const MIN_DIFFERENCE = 10;
const INPUT_DELAY = 500;

// Динамические шаги
const STEP_SMALL = 10; // Шаг для значений до 500
const STEP_LARGE = 50; // Шаг для значений выше 500
const STEP_THRESHOLD = 500; // Порог для смены шага

// Элементы DOM
const rangeMin = document.querySelector('.range-min');
const rangeMax = document.querySelector('.range-max');
const minPriceInput = document.querySelector('#min-price');
const maxPriceInput = document.querySelector('#max-price');
const progress = document.querySelector('.progress');

// Таймеры
let minPriceTimeout;
let maxPriceTimeout;

// Получение динамического шага в зависимости от значения
function getDynamicStep(value) {
  return value < STEP_THRESHOLD ? STEP_SMALL : STEP_LARGE;
}

// Округление значения до ближайшего шага
function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

// Обновление слайдера
function updateSlider(event) {
  let minVal = parseInt(rangeMin.value);
  let maxVal = parseInt(rangeMax.value);

  // Если это событие от клавиатуры, корректируем значение с учетом динамического шага
  if (event && (event.type === 'keydown' || event.type === 'input')) {
    const isMinSlider = this === rangeMin;
    const currentVal = isMinSlider ? minVal : maxVal;
    const step = getDynamicStep(currentVal);
    const roundedVal = roundToStep(currentVal, step);

    if (isMinSlider) {
      minVal = roundedVal;
      rangeMin.value = minVal;
    } else {
      maxVal = roundedVal;
      rangeMax.value = maxVal;
    }
  }

  // Проверка минимального разрыва
  if (maxVal - minVal < MIN_DIFFERENCE) {
    if (this === rangeMin) {
      rangeMin.value = maxVal - MIN_DIFFERENCE;
      minVal = rangeMin.value;
    } else {
      rangeMax.value = minVal + MIN_DIFFERENCE;
      maxVal = rangeMax.value;
    }
  }

  minPriceInput.value = minVal;
  maxPriceInput.value = maxVal;
  updateProgressBar(minVal, maxVal);
}

// Валидация цен с учетом динамического шага
function validatePrice(min, max, isMinInput) {
  let newMin = Math.max(0, Math.min(min, MAX_PRICE));
  let newMax = Math.max(0, Math.min(max, MAX_PRICE));

  // Округляем значения до ближайшего шага
  newMin = roundToStep(newMin, getDynamicStep(newMin));
  newMax = roundToStep(newMax, getDynamicStep(newMax));

  if (isMinInput) {
    if (newMax - newMin < MIN_DIFFERENCE) {
      newMax = Math.min(MAX_PRICE, newMin + MIN_DIFFERENCE);
      newMax = roundToStep(newMax, getDynamicStep(newMax));
    }
  } else {
    if (newMax - newMin < MIN_DIFFERENCE) {
      newMin = Math.max(0, newMax - MIN_DIFFERENCE);
      newMin = roundToStep(newMin, getDynamicStep(newMin));
    }
  }

  return { min: newMin, max: newMax };
}

// Обновление прогресс-бара
function updateProgressBar(minVal, maxVal) {
  const minPercent = (minVal / MAX_PRICE) * 100;
  const maxPercent = (maxVal / MAX_PRICE) * 100;

  progress.style.left = minPercent + '%';
  progress.style.right = (100 - maxPercent) + '%';
}

// Обновление диапазона из полей ввода
function updateRangeFromInput(event) {
  clearTimeout(minPriceTimeout);
  clearTimeout(maxPriceTimeout);

  const isMinPriceInput = event.target === minPriceInput;

  const timeoutFunction = () => {
    let minVal = parseInt(minPriceInput.value);
    let maxVal = parseInt(maxPriceInput.value);

    if (isNaN(minVal)) minVal = parseInt(rangeMin.value) || 0;
    if (isNaN(maxVal)) maxVal = parseInt(rangeMax.value) || MAX_PRICE;

    const validatedPrices = validatePrice(minVal, maxVal, isMinPriceInput);
    minVal = validatedPrices.min;
    maxVal = validatedPrices.max;

    minPriceInput.value = minVal;
    maxPriceInput.value = maxVal;
    rangeMin.value = minVal;
    rangeMax.value = maxVal;
    updateProgressBar(minVal, maxVal);
  };

  if (event.type === 'input') {
    if (isMinPriceInput) {
      minPriceTimeout = setTimeout(timeoutFunction, INPUT_DELAY);
    } else {
      maxPriceTimeout = setTimeout(timeoutFunction, INPUT_DELAY);
    }
  } else if (event.type === 'change') {
    timeoutFunction();
  } else if (event.type === 'keydown') {
    // Для клавиатурного управления обновляем сразу
    timeoutFunction();
  }
}

// Обработка клавиатурного управления для ползунков
function handleKeyboard(event) {
  const isMinSlider = this === rangeMin;
  let minVal = parseInt(rangeMin.value);
  let maxVal = parseInt(rangeMax.value);
  const currentVal = isMinSlider ? minVal : maxVal;
  const step = getDynamicStep(currentVal);

  let newValue;
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      newValue = currentVal - step;
      break;
    case 'ArrowRight':
    case 'ArrowUp':
      newValue = currentVal + step;
      break;
    default:
      return;
  }

  if (isMinSlider) {
    minVal = Math.max(0, Math.min(newValue, maxVal - MIN_DIFFERENCE));
    rangeMin.value = minVal;
  } else {
    maxVal = Math.min(MAX_PRICE, Math.max(newValue, minVal + MIN_DIFFERENCE));
    rangeMax.value = maxVal;
  }

  updateSlider.call(this, event);
  event.preventDefault();
}

// Обработка клавиатурного управления для полей ввода
function handleInputKeyboard(event) {
  const isMinInput = this === minPriceInput;
  let minVal = parseInt(minPriceInput.value);
  let maxVal = parseInt(maxPriceInput.value);

  // Если значения не определены, берём текущие значения слайдера
  if (isNaN(minVal)) minVal = parseInt(rangeMin.value) || 0;
  if (isNaN(maxVal)) maxVal = parseInt(rangeMax.value) || MAX_PRICE;

  const currentVal = isMinInput ? minVal : maxVal;
  const step = getDynamicStep(currentVal);

  let newValue;
  switch (event.key) {
    case 'ArrowUp':
      newValue = currentVal + step;
      break;
    case 'ArrowDown':
      newValue = currentVal - step;
      break;
    default:
      return;
  }

  if (isMinInput) {
    minVal = newValue;
  } else {
    maxVal = newValue;
  }

  // Валидируем значения
  const validatedPrices = validatePrice(minVal, maxVal, isMinInput);
  minVal = validatedPrices.min;
  maxVal = validatedPrices.max;

  // Обновляем поля и слайдер
  minPriceInput.value = minVal;
  maxPriceInput.value = maxVal;
  rangeMin.value = minVal;
  rangeMax.value = maxVal;
  updateProgressBar(minVal, maxVal);

  event.preventDefault();
}

// Инициализация событий
function initEvents() {
  // События для мыши
  rangeMin.addEventListener('input', updateSlider.bind(rangeMin));
  rangeMax.addEventListener('input', updateSlider.bind(rangeMax));

  // События для тач-устройств
  rangeMin.addEventListener('touchstart', handleTouchStart.bind(rangeMin), { passive: false });
  rangeMax.addEventListener('touchstart', handleTouchStart.bind(rangeMax), { passive: false });

  // Клавиатурное управление для ползунков
  rangeMin.addEventListener('keydown', handleKeyboard.bind(rangeMin));
  rangeMax.addEventListener('keydown', handleKeyboard.bind(rangeMax));

  // Клавиатурное управление для полей ввода
  minPriceInput.addEventListener('keydown', handleInputKeyboard.bind(minPriceInput));
  maxPriceInput.addEventListener('keydown', handleInputKeyboard.bind(maxPriceInput));

  // События для полей ввода
  minPriceInput.addEventListener('input', updateRangeFromInput);
  maxPriceInput.addEventListener('input', updateRangeFromInput);
  minPriceInput.addEventListener('change', updateRangeFromInput);
  maxPriceInput.addEventListener('change', updateRangeFromInput);
}

// Обработка касания
function handleTouchStart(event) {
  event.preventDefault(); // Предотвращаем прокрутку страницы при касании

  const slider = this;
  const isMinSlider = slider === rangeMin;

  function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = slider.parentElement.getBoundingClientRect();
    const position = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const percent = (position / rect.width) * MAX_PRICE;
    let value = Math.round(percent);

    // Округляем значение до ближайшего шага
    const step = getDynamicStep(value);
    value = roundToStep(value, step);

    if (isMinSlider) {
      rangeMin.value = value;
    } else {
      rangeMax.value = value;
    }

    updateSlider.call(slider);
  }

  function handleTouchEnd() {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }

  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd);
}

// Инициализация
function init() {
  rangeMin.max = MAX_PRICE;
  rangeMax.max = MAX_PRICE;
  rangeMin.value = 0;
  rangeMax.value = MAX_PRICE;
  minPriceInput.value = 0;
  maxPriceInput.value = MAX_PRICE;
  updateProgressBar(0, MAX_PRICE);
  initEvents();
}

document.addEventListener('DOMContentLoaded', init);
