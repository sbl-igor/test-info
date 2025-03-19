function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function checkPaymentStatus() {
    const productId = getProductIdFromUrl();

    fetch(`https://yourserver.com/check-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: productId })  // Отправляем ID заказа
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Оплата подтверждена! Перенаправляем...");
            window.location.href = data.redirect; // success.html
        } else if (data.redirect) {
            console.log("Оплата отклонена. Перенаправляем...");
            window.location.href = data.redirect; // fail.html
        } else {
            console.log("Ожидаем подтверждения платежа...");
        }
    })
    .catch(error => console.error("Ошибка при проверке платежа:", error));
}

// Проверяем оплату каждые 5 секунд
setInterval(checkPaymentStatus, 5000);