const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const { orderId } = JSON.parse(event.body);

        // Запрос в API Тинькофф для проверки платежа
        const response = await fetch('https://securepay.tinkoff.ru/v2/GetState', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                TerminalKey: process.env.TERMINAL_KEY,
                OrderId: orderId
            })
        });

        const result = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: result.Status === "CONFIRMED", 
                status: result.Status
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
