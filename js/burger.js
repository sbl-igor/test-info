// burger
const burger = document.querySelector('.burger');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;
const menuItems = document.querySelectorAll('.nav-menu li'); 

burger.addEventListener('click', () => {
    navMenu.classList.toggle('open'); 
    burger.classList.toggle('active'); 

    if (navMenu.classList.contains('open')) {
        body.classList.add('no-scroll'); 
    } else {
        body.classList.remove('no-scroll');
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-section')) {
        navMenu.classList.remove('open');
        burger.classList.remove('active');
        body.classList.remove('no-scroll'); 
    }
});

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        navMenu.classList.remove('open');
        burger.classList.remove('active');
        body.classList.remove('no-scroll');
    });
});
