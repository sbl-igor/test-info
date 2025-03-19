// check-payment.js (Netlify Function)

const crypto = require('crypto'); // Для проверки подписи

exports.handler = async (event, context) => {
    const body = JSON.parse(event.body);
    const terminalKey = 't.NJYz9R135O5TIK9EypaAICG5JDkT-PYjq_GFmTlaJh7Yn2Gz6o1G6_qrdmH78fwUxN7UXhfdOU_-hd91pFZvlw'; // TERMINAL_KEY

    console.log('Получен webhook:', body);

    // Статус платежа
    const status = body.Status;
    const orderId = body.OrderId;

    // В этой части можно обновить статус платежа в базе данных

    if (status === 'CONFIRMED') {
        console.log(`Платеж подтвержден для OrderId: ${orderId}`);
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, status: 'CONFIRMED' }),
        };
    } else if (status === 'REJECTED') {
        console.log(`Платеж отклонен для OrderId: ${orderId}`);
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, status: 'REJECTED' }),
        };
    } else {
        console.log(`Неизвестный статус платежа для OrderId: ${orderId}`);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Неизвестный статус' }),
        };
    }
};
