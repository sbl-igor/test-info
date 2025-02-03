document.addEventListener("DOMContentLoaded", function () {
    const swiperList = document.querySelector(".education-cards-swiper__list");
    const swiperItems = document.querySelectorAll(".education-cards-swiper__item");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");

    const visibleSlides = 4; // Сколько карточек видно
    const totalSlides = swiperItems.length;
    let index = visibleSlides; // Начальная позиция после клонов

    // Дублируем карточки (чтобы создать бесшовный эффект)
    for (let i = 0; i < visibleSlides; i++) {
        let cloneFirst = swiperItems[i].cloneNode(true);
        let cloneLast = swiperItems[totalSlides - 1 - i].cloneNode(true);
        swiperList.appendChild(cloneFirst);
        swiperList.insertBefore(cloneLast, swiperList.firstChild);
    }

    const allItems = document.querySelectorAll(".education-cards-swiper__item");
    const itemWidth = allItems[0].offsetWidth + 10; // Ширина карточки + gap

    // Начальное смещение
    swiperList.style.transform = `translateX(-${index * itemWidth}px)`;

    function slide(direction) {
        index += direction;
        swiperList.style.transition = "transform 0.3s ease-in-out";
        swiperList.style.transform = `translateX(-${index * itemWidth}px)`;

        setTimeout(() => {
            if (index >= allItems.length - visibleSlides) {
                index = visibleSlides;
                swiperList.style.transition = "none";
                swiperList.style.transform = `translateX(-${index * itemWidth}px)`;
            }
            if (index <= 0) {
                index = allItems.length - visibleSlides * 2;
                swiperList.style.transition = "none";
                swiperList.style.transform = `translateX(-${index * itemWidth}px)`;
            }
        }, 300); // Время анимации = 0.3s
    }

    nextBtn.addEventListener("click", () => slide(1));
    prevBtn.addEventListener("click", () => slide(-1));

    // Автоматическая прокрутка (раскомментируй, если нужно)
    // setInterval(() => slide(1), 3000);
});
