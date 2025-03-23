const fetch = require('node-fetch');  // Импортируем fetch

// Обработчик для Netlify Function
exports.handler = async function(event) {
    console.log("Запрос к Netlify-функции initPayment получен");

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Метод не разрешен" };
    }

    try {
        // Парсим тело запроса
        const { amount } = JSON.parse(event.body);

        // Проверка на корректность суммы
        if (!amount || amount <= 0) {
            return { statusCode: 400, body: JSON.stringify({ error: "Некорректная сумма" }) };
        }

        // Данные для запроса к Тинькофф
        const terminalKey = "1742653399078DEMO";
        const password = "o2Pol35%i5XuLogi";
        const orderId = Date.now().toString(); // Уникальный ID заказа
        const notificationUrl = "https://info-products-360.netlify.app/.netlify/functions/paymentCallback";
        const successUrl = "https://info-products-360.netlify.app/success";
        const failUrl = "https://info-products-360.netlify.app/fail";

        const data = {
            TerminalKey: terminalKey,
            Amount: amount,
            OrderId: orderId,
            Description: `Оплата заказа №${orderId}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl
        };

        // Отправляем запрос к Тинькофф API
        const response = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        // Получаем ответ от Тинькофф
        const result = await response.json();

        if (result.Success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ paymentUrl: result.PaymentURL })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: result.Message })
            };
        }
    } catch (error) {
        console.error("Ошибка при обработке запроса:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Ошибка сервера" })
        };
    }
};
