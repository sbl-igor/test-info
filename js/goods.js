console.log(document.querySelectorAll('.item-for-buying'));

document.querySelectorAll('.item-for-buying').forEach((card) => {
    card.addEventListener('click', () => {
        const productId = card.getAttribute('data-id');
        window.location.href = `buy.html?id=${productId}`;
    });
});
