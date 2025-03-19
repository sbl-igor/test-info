// webhook.js
exports.handler = async (event, context) => {
    const body = JSON.parse(event.body);
    const terminalKey = 't.NJYz9R135O5TIK9EypaAICG5JDkT-PYjq_GFmTlaJh7Yn2Gz6o1G6_qrdmH78fwUxN7UXhfdOU_-hd91pFZvlw'; // Твой TERMINAL_KEY

    console.log('Получен webhook:', body);

    // Статус платежа
    const status = body.Status;
    const orderId = body.OrderId;

    // Здесь можешь обновить статус платежа в базе данных или выполнить действия, связанные с оплатой

    if (status === 'CONFIRMED') {
        console.log(`Платеж подтвержден для OrderId: ${orderId}`);
        // Здесь можно обновить статус в базе данных или выполнить другие действия для подтвержденного платежа
    } else if (status === 'REJECTED') {
        console.log(`Платеж отклонен для OrderId: ${orderId}`);
        // Обработка отклоненного платежа
    } else {
        console.log(`Неизвестный статус платежа для OrderId: ${orderId}`);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
    };
};
