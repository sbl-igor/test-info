// qr.js
function checkPaymentStatus(orderId) {
    console.log('Проверка статуса платежа для OrderId:', orderId);  // Логируем начало проверки статуса

    return fetch('/.netlify/functions/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Ответ от сервера:', data);  // Логируем ответ от сервера

        if (data.success && data.status === 'APPROVED') {
            console.log("Статус платежа: подтвержден");
            window.location.href = '/success.html'; // Перенаправляем на страницу успеха
        } else if (data.status === 'REJECTED') {
            console.log("Статус платежа: отклонен");
            window.location.href = '/fail.html'; // Перенаправляем на страницу неудачи
        } else {
            console.log("Неизвестный статус платежа:", data.status);
        }
    })
    .catch(err => {
        console.error("Ошибка при проверке платежа:", err);
        window.location.href = '/fail.html'; // В случае ошибки перенаправляем на страницу неудачи
    });
}

function startPaymentCheck(orderId) {
    console.log('Запуск проверки платежа для OrderId:', orderId);

    const intervalId = setInterval(() => {
        console.log('Проверка статуса платежа...'); // Логируем каждую попытку проверки
        checkPaymentStatus(orderId);
    }, 5000); // Проверка каждые 5 секунд

    // Остановить проверку, когда платеж подтвержден или отклонен
    setTimeout(() => {
        console.log('30 секунд прошли, остановка проверки...');
        clearInterval(intervalId);
    }, 30000); // Остановить через 30 секунд, если не получен результат
}
