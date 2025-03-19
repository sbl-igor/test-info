const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const { orderId, amount } = JSON.parse(event.body);

        // Данные для создания платежа
        const paymentData = {
            TerminalKey: process.env.TERMINAL_KEY, // API-ключ заказчика
            OrderId: orderId,
            Amount: amount, // Сумма в копейках (1000 = 10 рублей)
            Description: "Оплата заказа",
            PayType: "QR" // Генерируем QR-код
        };

        // Запрос в API Тинькофф для генерации ссылки на оплату
        const response = await fetch('https://securepay.tinkoff.ru/v2/Init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (result.Success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    success: true, 
                    paymentUrl: result.PaymentURL // Ссылка на оплату
                })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, error: result.Message })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
