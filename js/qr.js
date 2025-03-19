// qr.js
function checkPaymentStatus(orderId) {
    return fetch('/.netlify/functions/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.status === 'APPROVED') {
            console.log("Статус платежа: подтвержден");
            window.location.href = '/success.html'; // Перенаправляем на страницу успеха
        } else if (data.status === 'REJECTED') {
            console.log("Статус платежа: отклонен");
            window.location.href = '/fail.html'; // Перенаправляем на страницу неудачи
        }
    })
    .catch(err => {
        console.error("Ошибка при проверке платежа:", err);
        window.location.href = '/fail.html'; // В случае ошибки перенаправляем на страницу неудачи
    });
}

function startPaymentCheck(orderId) {
    const intervalId = setInterval(() => {
        checkPaymentStatus(orderId);
    }, 5000); // Проверка каждые 5 секунд

    // Остановить проверку, когда платеж подтвержден или отклонен
    setTimeout(() => clearInterval(intervalId), 30000); // Остановить через 30 секунд, если не получен результат
}
