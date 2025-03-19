document.getElementById('check-payment-status').addEventListener('click', function() {
    const orderId = new URLSearchParams(window.location.search).get('orderId'); // Получаем ID из URL
    checkPaymentStatus(orderId);
});

function checkPaymentStatus(orderId) {
    fetch('/.netlify/functions/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.status === 'CONFIRMED') {
            window.location.href = '/success.html'; // Перенаправление на страницу успешной оплаты
        } else {
            window.location.href = '/fail.html'; // Перенаправление на страницу неудачи
        }
    })
    .catch(error => {
        console.error('Ошибка при проверке платежа:', error);
        window.location.href = '/fail.html'; // В случае ошибки перенаправление на fail
    });
}
