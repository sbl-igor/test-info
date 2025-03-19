// netlify/functions/check-payment.js

const axios = require('axios'); // Мы используем axios для запросов к внешнему API

exports.handler = async (event, context) => {
    const { orderId } = JSON.parse(event.body); // Получаем orderId из запроса

    try {
        // Запрос к стороннему API для проверки платежа
        const response = await axios.post('https://info-products-360.netlify.app/.netlify/functions/check-payment', {
            orderId: orderId
        });

        // Добавляем CORS заголовки, чтобы разрешить запросы с любого домена
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',  // Разрешаем доступ с любого домена
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(response.data),  // Ответ от стороннего API
        };
    } catch (error) {
        console.error('Ошибка при проверке платежа:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: 'Ошибка при проверке платежа' }),
        };
    }
};
