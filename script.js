
'use strict';

// Мобильное меню
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Форма записи: календарь, выбор времени и маска телефона
const bookingForm = document.getElementById('bookingForm');
const bookingMessage = document.getElementById('bookingMessage');
const bookingDate = document.getElementById('bookingDate');
const bookingTime = document.getElementById('bookingTime');
const bookingPhone = document.getElementById('bookingPhone');
const bookingCalendar = document.getElementById('bookingCalendar');
const calendarTitle = document.getElementById('bookingCalendarTitle');
const calendarDays = document.getElementById('bookingCalendarDays');
const selectedDateText = document.getElementById('bookingSelectedDate');
const previousMonthButton = document.querySelector('[data-calendar-prev]');
const nextMonthButton = document.querySelector('[data-calendar-next]');
const timeSlotsContainer = document.getElementById('bookingTimeSlots');

// Формат даты YYYY-MM-DD по местному времени
const localDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// Начало текущего дня
const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  return date;
};

let calendarView = startOfToday();
calendarView.setDate(1);

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const monthFormatter = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
  year: 'numeric'
});

// Отрисовка календаря
const renderCalendar = () => {
  if (!calendarTitle || !calendarDays) return;

  const year = calendarView.getFullYear();
  const month = calendarView.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Неделя начинается с понедельника
  const mondayFirstOffset = (firstDay.getDay() + 6) % 7;

  const todayString = localDateString(startOfToday());

  const currentMonth = new Date(
    startOfToday().getFullYear(),
    startOfToday().getMonth(),
    1
  );

  const viewedMonth = new Date(year, month, 1);

  calendarTitle.textContent = monthFormatter.format(calendarView);
  calendarTitle.textContent =
    calendarTitle.textContent.charAt(0).toLocaleUpperCase('ru-RU') +
    calendarTitle.textContent.slice(1);

  calendarDays.replaceChildren();

  // Пустые ячейки до первого дня месяца
  for (let blank = 0; blank < mondayFirstOffset; blank += 1) {
    const emptyCell = document.createElement('span');

    emptyCell.className = 'booking-calendar-empty';
    emptyCell.setAttribute('aria-hidden', 'true');

    calendarDays.appendChild(emptyCell);
  }

  // Дни месяца
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateValue = localDateString(date);

    const dayButton = document.createElement('button');

    dayButton.type = 'button';
    dayButton.className = 'booking-calendar-day';
    dayButton.textContent = String(day);
    dayButton.dataset.date = dateValue;

    dayButton.setAttribute(
      'aria-label',
      dateFormatter.format(date)
    );

    dayButton.setAttribute(
      'aria-pressed',
      String(bookingDate?.value === dateValue)
    );

    // Прошедшие даты недоступны
    if (dateValue < todayString) {
      dayButton.disabled = true;
      dayButton.classList.add('is-past');
    }

    if (dateValue === todayString) {
      dayButton.classList.add('is-today');
    }

    if (bookingDate?.value === dateValue) {
      dayButton.classList.add('is-selected');
    }

    if (date.getDay() === 0 || date.getDay() === 6) {
      dayButton.classList.add('is-weekend');
    }

    // Выбор даты
    dayButton.addEventListener('click', () => {
      if (!bookingDate) return;

      bookingDate.value = dateValue;

      // После изменения даты сбрасываем выбранное время
      if (bookingTime) {
        bookingTime.value = '';
      }

      if (timeSlotsContainer) {
        timeSlotsContainer
          .querySelectorAll('[data-time-slot]')
          .forEach((slot) => {
            slot.classList.remove('is-selected');
            slot.setAttribute('aria-pressed', 'false');
          });
      }

      if (selectedDateText) {
        selectedDateText.textContent =
          `Выбрано: ${dateFormatter.format(date)}`;
      }

      renderCalendar();
    });

    calendarDays.appendChild(dayButton);
  }

  // Не позволяем перейти к прошедшему месяцу
  if (previousMonthButton) {
    previousMonthButton.disabled = viewedMonth <= currentMonth;
  }
};

// Инициализация календаря
if (bookingDate && bookingCalendar) {
  bookingDate.min = localDateString(startOfToday());

  renderCalendar();

  previousMonthButton?.addEventListener('click', () => {
    calendarView = new Date(
      calendarView.getFullYear(),
      calendarView.getMonth() - 1,
      1
    );

    renderCalendar();
  });

  nextMonthButton?.addEventListener('click', () => {
    calendarView = new Date(
      calendarView.getFullYear(),
      calendarView.getMonth() + 1,
      1
    );

    renderCalendar();
  });
}

// Слоты времени: компактные мини-карточки с шагом в один час
const createTimeSlots = () => {
  if (!timeSlotsContainer) return;

  timeSlotsContainer.replaceChildren();

  // Время начала записи: каждый час с 09:00 до 19:00
  for (let hour = 9; hour <= 19; hour += 1) {
    const startTime = `${String(hour).padStart(2, '0')}:00`;

    const slot = document.createElement('button');

    slot.type = 'button';
    slot.className = 'booking-time-slot';
    slot.dataset.timeSlot = startTime;

    slot.setAttribute('aria-pressed', 'false');
    slot.setAttribute('aria-label', `Запись на ${startTime}`);

    slot.innerHTML = `
      <span class="booking-time-slot-start">${startTime}</span>
    `;

    slot.addEventListener('click', () => {
      if (!bookingTime) return;

      bookingTime.value = startTime;

      // Разрешаем выбрать только один слот
      timeSlotsContainer
        .querySelectorAll('[data-time-slot]')
        .forEach((otherSlot) => {
          const isSelected = otherSlot === slot;

          otherSlot.classList.toggle(
            'is-selected',
            isSelected
          );

          otherSlot.setAttribute(
            'aria-pressed',
            String(isSelected)
          );
        });
    });

    timeSlotsContainer.appendChild(slot);
  }
};

createTimeSlots();

// Маска российского номера: +7 (999) 123-45-67
const formatRussianPhone = (value) => {
  const trimmedValue = value.trim();
  let digits = trimmedValue.replace(/\D/g, '');

  if (trimmedValue.startsWith('+7')) {
    digits = digits.slice(1);
  } else if (
    digits.startsWith('8') ||
    digits.startsWith('7')
  ) {
    digits = digits.slice(1);
  }

  digits = digits.slice(0, 10);

  if (!digits.length) return '';

  let formatted = `+7 (${digits.slice(0, 3)}`;

  if (digits.length >= 3) {
    formatted += ')';
  }

  if (digits.length > 3) {
    formatted += ` ${digits.slice(3, 6)}`;
  }

  if (digits.length > 6) {
    formatted += `-${digits.slice(6, 8)}`;
  }

  if (digits.length > 8) {
    formatted += `-${digits.slice(8, 10)}`;
  }

  return formatted;
};

// Проверка полноты номера телефона
const validateBookingPhone = () => {
  if (!bookingPhone) return true;

  const digits = bookingPhone.value.replace(/\D/g, '');
  const isEmpty = bookingPhone.value.trim() === '';

  const isComplete =
    digits.length === 11 && digits.startsWith('7');

  bookingPhone.setCustomValidity(
    !isEmpty && !isComplete
      ? 'Введите номер полностью: +7 (999) 123-45-67.'
      : ''
  );

  return isEmpty || isComplete;
};

if (bookingPhone) {
  bookingPhone.addEventListener('input', () => {
    const caretAtEnd =
      bookingPhone.selectionStart === bookingPhone.value.length;

    bookingPhone.value = formatRussianPhone(
      bookingPhone.value
    );

    validateBookingPhone();

    if (caretAtEnd) {
      bookingPhone.setSelectionRange(
        bookingPhone.value.length,
        bookingPhone.value.length
      );
    }
  });

  bookingPhone.addEventListener(
    'blur',
    validateBookingPhone
  );
}

// Маскируем последние четыре цифры номеров в контактных блоках
// Это визуальная маскировка, не полноценная защита от парсеров
const maskLastFourPhoneDigits = (text) => {
  const positions = [];

  for (let index = 0; index < text.length; index += 1) {
    if (/\d/.test(text[index])) {
      positions.push(index);
    }
  }

  if (positions.length < 10) return text;

  const chars = text.split('');

  positions.slice(-4).forEach((position) => {
    chars[position] = '•';
  });

  return chars.join('');
};

document
  .querySelectorAll('.contact-phone, [data-public-phone]')
  .forEach((phoneElement) => {
    phoneElement.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.nodeValue = maskLastFourPhoneDigits(
          node.nodeValue
        );
      }
    });
  });

// Проверка формы записи
// Реальная отправка заявок пока не подключена
if (bookingForm && bookingMessage) {
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!bookingDate?.value) {
      bookingMessage.textContent =
        'Выберите дату в календаре.';

      bookingMessage.hidden = false;

      bookingCalendar?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      return;
    }

    if (!bookingTime?.value) {
      bookingMessage.textContent =
        'Выберите удобный слот времени.';

      bookingMessage.hidden = false;

      timeSlotsContainer?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      return;
    }

    if (!validateBookingPhone()) {
      bookingPhone?.reportValidity();
      return;
    }

    const selectedServices = [
      ...bookingForm.querySelectorAll(
        'input[name="services"]:checked'
      )
    ];

    if (!selectedServices.length) {
      bookingMessage.textContent =
        'Выберите хотя бы одну услугу.';

      bookingMessage.hidden = false;

      const servicePicker =
        bookingForm.querySelector('.service-picker');

      if (servicePicker) {
        servicePicker.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      return;
    }

    bookingMessage.textContent =
      'Форма заполнена. Реальная отправка заявок пока не подключена.';

    bookingMessage.hidden = false;
  });
}

// Заглушка, если видео отсутствует или не загружается
document.querySelectorAll('[data-video-card]').forEach((card) => {
  const video = card.querySelector('video');

  if (!video) return;

  const showMissingVideo = () => {
    card.classList.add('video-not-found');
  };

  video.addEventListener('error', showMissingVideo);

  const source = video.querySelector('source');

  if (source) {
    source.addEventListener('error', showMissingVideo);
  }
});

// Аккордеоны категорий детейлинга в прайсе
document
  .querySelectorAll(
    '.service-direction-column:nth-child(2) .price-group'
  )
  .forEach((group, index) => {
    const heading = group.querySelector('.price-group-heading');

    if (!heading) return;

    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'accordion-toggle';

    button.setAttribute('aria-expanded', 'false');
    button.setAttribute(
      'aria-controls',
      `service-accordion-${index}`
    );

    button.innerHTML = heading.innerHTML;
    heading.replaceWith(button);

    const content = document.createElement('div');

    content.className = 'accordion-content';
    content.id = `service-accordion-${index}`;
    content.hidden = true;

    while (button.nextSibling) {
      content.appendChild(button.nextSibling);
    }

    group.appendChild(content);
    group.classList.add('price-accordion');

    button.addEventListener('click', () => {
      const isExpanded =
        button.getAttribute('aria-expanded') === 'true';

      button.setAttribute(
        'aria-expanded',
        String(!isExpanded)
      );

      content.hidden = isExpanded;
      group.classList.toggle('is-open', !isExpanded);
    });
  });

// Плавное появление карточек при прокрутке
const animatedCards = document.querySelectorAll(
  '.direction-card, .price-group'
);

if ('IntersectionObserver' in window && animatedCards.length) {
  animatedCards.forEach((card, index) => {
    card.classList.add('reveal-on-scroll');
    card.style.transitionDelay = `${(index % 4) * 80}ms`;
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  animatedCards.forEach((card) => {
    revealObserver.observe(card);
  });
}

// Стрелки горизонтальных каруселей фотографий и видео
document.querySelectorAll('[data-scroll]').forEach((button) => {
  button.addEventListener('click', () => {
    const carouselName = button.dataset.scroll;

    const carousel = document.querySelector(
      `[data-carousel="${carouselName}"]`
    );

    if (!carousel) return;

    const direction = Number(
      button.dataset.direction || 1
    );

    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.85,
      behavior: 'smooth'
    });
  });
});

// Полноэкранный просмотр фотографий и видео
const lightbox = document.getElementById('galleryLightbox');

if (lightbox) {
  const lightboxImage =
    lightbox.querySelector('.lightbox-image');

  const lightboxVideo =
    lightbox.querySelector('.lightbox-video');

  const lightboxCaption =
    lightbox.querySelector('.lightbox-caption');

  const closeButton =
    lightbox.querySelector('.lightbox-close');

  const previousButton =
    lightbox.querySelector('.lightbox-prev');

  const nextButton =
    lightbox.querySelector('.lightbox-next');

  const mediaButtons = Array.from(
    document.querySelectorAll('.media-open')
  );

  let currentIndex = 0;
  let lastFocusedElement = null;

  // Информация о выбранном файле
  const getMediaInfo = (button) => {
    const type = button.dataset.mediaType;
    const card = button.closest('.gallery-card');

    const caption =
      card
        ?.querySelector('figcaption span')
        ?.textContent
        ?.trim() || '';

    if (type === 'video') {
      const video = card?.querySelector('video');
      const source = video?.querySelector('source');

      return {
        type: 'video',
        src: source?.src || video?.src || '',
        poster: video?.poster || '',
        alt: caption || 'Видео DMV'
      };
    }

    const image = button.querySelector('img');

    return {
      type: 'image',
      src: image?.currentSrc || image?.src || '',
      alt: image?.alt || caption
    };
  };

  // Отображение выбранной фотографии или видео
  const showMedia = (index) => {
    if (!mediaButtons.length) return;

    currentIndex =
      (index + mediaButtons.length) % mediaButtons.length;

    const button = mediaButtons[currentIndex];
    const media = getMediaInfo(button);

    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');

    lightboxVideo
      .querySelectorAll('source')
      .forEach((source) => source.remove());

    lightboxVideo.load();

    if (media.type === 'video') {
      lightboxImage.hidden = true;
      lightboxImage.removeAttribute('src');

      lightboxVideo.hidden = false;
      lightboxVideo.poster = media.poster || '';

      if (media.src) {
        lightboxVideo.src = media.src;
      }

      lightboxVideo.load();
    } else {
      lightboxVideo.hidden = true;
      lightboxImage.hidden = false;

      lightboxImage.src = media.src;
      lightboxImage.alt = media.alt;
    }

    lightboxCaption.textContent =
      `${media.alt} · ${currentIndex + 1} / ${mediaButtons.length}`;
  };

  // Открываем галерею
  const openLightbox = (button) => {
    lastFocusedElement = button;

    showMedia(mediaButtons.indexOf(button));

    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');

    closeButton.focus();
  };

  // Закрываем галерею
  const closeLightbox = () => {
    lightboxVideo.pause();
    lightbox.hidden = true;

    lightboxImage.removeAttribute('src');
    lightboxVideo.removeAttribute('src');

    lightboxVideo.load();

    document.body.classList.remove('lightbox-open');

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  };

  // Открытие фотографии или видео
  mediaButtons.forEach((button) => {
    button.addEventListener('click', () => {
      openLightbox(button);
    });
  });

  // Переключение между файлами
  previousButton.addEventListener('click', () => {
    showMedia(currentIndex - 1);
  });

  nextButton.addEventListener('click', () => {
    showMedia(currentIndex + 1);
  });

  closeButton.addEventListener('click', closeLightbox);

  lightbox
    .querySelector('.lightbox-backdrop')
    .addEventListener('click', closeLightbox);

  // Управление клавиатурой
  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;

    if (event.key === 'Escape') {
      closeLightbox();
    }

    if (event.key === 'ArrowLeft') {
      showMedia(currentIndex - 1);
    }

    if (event.key === 'ArrowRight') {
      showMedia(currentIndex + 1);
    }
  });
}
