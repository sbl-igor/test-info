AOS.init({
    once: true 
});

async function checkPaymentStatus(orderId) {
    try {
        let response = await fetch('/.netlify/functions/check-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
        });

        let data = await response.json();

        if (data.redirect) {
            window.location.href = data.redirect;
        } else {
            setTimeout(() => checkPaymentStatus(orderId), 5000); // Проверяем снова через 5 секунд
        }
    } catch (error) {
        console.error("Ошибка получения статуса платежа:", error);
    }
}

function pay(orderId) {
    setTimeout(() => checkPaymentStatus(orderId), 3000);
}
