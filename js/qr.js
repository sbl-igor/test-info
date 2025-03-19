// qr.js
function checkPaymentStatus(orderId) {
    fetch('/.netlify/functions/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.status === 'APPROVED') {
            // Платеж подтвержден
            console.log("Статус платежа: подтвержден");
            window.location.href = '/success.html'; // Перенаправляем на страницу успеха
        } else if (data.status === 'REJECTED') {
            // Платеж отклонен
            console.log("Статус платежа: отклонен");
            window.location.href = '/fail.html'; // Перенаправляем на страницу неудачи
        }
    })
    .catch(err => {
        console.error("Ошибка при проверке платежа:", err);
        window.location.href = '/fail.html'; // В случае ошибки перенаправляем на страницу неудачи
    });
}

// qr.js
function startPaymentCheck(orderId) {
    const intervalId = setInterval(() => {
        checkPaymentStatus(orderId);
    }, 5000); // Проверка каждые 5 секунд

    // Остановить проверку, когда платеж подтвержден или отклонен
    const checkPaymentStatus = (orderId) => {
        fetch('/.netlify/functions/check-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: orderId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.status === 'APPROVED') {
                clearInterval(intervalId);  // Останавливаем проверку
                console.log("Платеж подтвержден");
                window.location.href = '/success.html'; // Перенаправление на страницу успеха
            } else if (data.status === 'REJECTED') {
                clearInterval(intervalId);  // Останавливаем проверку
                console.log("Платеж отклонен");
                window.location.href = '/fail.html'; // Перенаправление на страницу неудачи
            }
        })
        .catch(err => {
            console.error("Ошибка при проверке платежа:", err);
            clearInterval(intervalId);  // Останавливаем проверку в случае ошибки
            window.location.href = '/fail.html'; // Перенаправление на страницу неудачи
        });
    }
}
