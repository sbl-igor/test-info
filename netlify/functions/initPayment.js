const fetch = require("node-fetch"); // Если используете серверную среду (например, Netlify Functions)

exports.handler = async function (event) {
    console.log("Запрос к Netlify-функции initPayment получен");

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Метод не разрешен" };
    }

    try {
        const { amount } = JSON.parse(event.body);
        if (!amount || amount <= 0) {
            return { statusCode: 400, body: JSON.stringify({ error: "Некорректная сумма" }) };
        }

        // Ваши данные из ЛК Тинькофф
        const terminalKey = "1742653399078DEMO"; // TerminalKey
        const secretKey = "o2Pol35%i5XuLogi"; // SecretKey
        const orderId = Date.now().toString(); // Уникальный ID заказа
        const notificationUrl = "https://yourwebsite.com/.netlify/functions/paymentCallback"; // Укажите правильный URL для обработки уведомлений
        const successUrl = "https://yourwebsite.com/success"; // URL для успешного завершения оплаты
        const failUrl = "https://yourwebsite.com/fail"; // URL для неудачной оплаты

        // Логируем параметры перед отправкой
        console.log("Отправляем запрос с параметрами:", {
            TerminalKey: terminalKey,
            Amount: amount,
            OrderId: orderId,
            Description: `Оплата заказа №${orderId}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl,
        });

        // Параметры запроса для API Тинькофф
        const data = {
            TerminalKey: terminalKey,
            Amount: amount, // сумма в копейках (например, 1000 — это 10 рублей)
            OrderId: orderId, // уникальный ID заказа
            Description: `Оплата заказа №${orderId}`, // описание
            NotificationURL: notificationUrl, // URL для получения уведомлений
            SuccessURL: successUrl, // URL для успеха
            FailURL: failUrl, // URL для неудачи
        };

        // Запрос к API Тинькофф для инициализации платежа
        const response = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        console.log("Ответ от Тинькофф:", result);

        if (result.Success) {
            // Если запрос успешный, возвращаем URL для перехода на страницу оплаты
            return {
                statusCode: 200,
                body: JSON.stringify({ paymentUrl: result.PaymentURL }),
            };
        } else {
            // Если произошла ошибка, возвращаем сообщение об ошибке
            return {
                statusCode: 400,
                body: JSON.stringify({ error: result.Message }),
            };
        }
    } catch (error) {
        console.error("Ошибка при обработке запроса:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Ошибка сервера" }),
        };
    }
};
