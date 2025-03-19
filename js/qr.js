document.getElementById('check-payment-status').addEventListener('click', async function() {
    const orderId = new URLSearchParams(window.location.search).get('id');
    if (!orderId) {
        alert('Не найден идентификатор заказа.');
        return;
    }

    try {
        const response = await fetch('/.netlify/functions/check-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
        });

        const data = await response.json();
        
        if (data.success) {
            if (data.status === 'CONFIRMED') {
                window.location.href = '/success.html';
            } else {
                window.location.href = '/fail.html';
            }
        } else {
            alert('Ошибка при проверке статуса платежа.');
        }
    } catch (error) {
        console.error('Ошибка запроса:', error);
        alert('Ошибка соединения с сервером.');
    }
});