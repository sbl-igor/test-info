// netlify/functions/check-payment.js
const fetch = require('node-fetch');
exports.handler = async (event) => {
    try {
        const { orderId } = JSON.parse(event.body);
        const terminalKey = process.env.TERMINAL_KEY;

        console.log('Используемый TerminalKey:', process.env.TERMINAL_KEY);

        const response = await fetch('https://securepay.tinkoff.ru/v2/GetState', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ TerminalKey: terminalKey, OrderId: orderId })
        });

        const data = await response.json();
        console.log('Ответ Тинькофф:', data);

        if (data.Success && data.Status === 'CONFIRMED') {
            return { statusCode: 200, body: JSON.stringify({ success: true, status: 'CONFIRMED' }) };
        } else {
            return { statusCode: 200, body: JSON.stringify({ success: true, status: 'FAILED' }) };
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        return { statusCode: 500, body: JSON.stringify({ success: false, error: 'Ошибка сервера' }) };
    }
};
