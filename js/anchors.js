const anchors = document.querySelectorAll('.about-us a');

anchors.forEach(anc => {
    anc.addEventListener('click', (e) => {
        e.preventDefault();

        const id = anc.getAttribute('href');
        const elem = document.querySelector(id);
        
        window.scroll({
            top: elem.offsetTop,
            behavior: 'smooth',
        })
    })
})
