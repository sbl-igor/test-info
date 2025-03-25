const crypto = require("crypto");
const fetch = require("node-fetch");

exports.handler = async function (event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Метод не разрешен" };
    }

    try {
        const { amount, id } = JSON.parse(event.body);

        // Логируем данные, которые получаем от клиента
        console.log('Полученные данные:', { amount, id });

        if (!amount || amount <= 0 || !id) {
            return { statusCode: 400, body: JSON.stringify({ error: "Некорректная сумма или отсутствует id" }) };
        }

        const terminalKey = "1742653399078DEMO";
        const secretKey = "o2Pol35%i5XuLogi";
        const orderId = `${id}-${Date.now()}`; // Генерация OrderId с ID товара
        const notificationUrl = "https://info-products-360.netlify.app/.netlify/functions/paymentCallback";
        const successUrl = `https://info-products-360.netlify.app/success?id=${id}`; // Добавляем id в SuccessURL
        const failUrl = `https://info-products-360.netlify.app/fail?id=${id}`; // Добавляем id в FailURL

        // Формируем параметры для токена
        const tokenParams = {
            TerminalKey: terminalKey,
            Amount: amount,
            OrderId: orderId,
            Description: `Оплата заказа №${id}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl,
            Password: secretKey,
        };

        // Генерация токена
        const sortedKeys = Object.keys(tokenParams).sort();
        const tokenString = sortedKeys.map((key) => tokenParams[key]).join("");
        const token = crypto.createHash("sha256").update(tokenString).digest("hex");

        // Формируем данные для запроса
        const data = {
            TerminalKey: terminalKey,
            Amount: amount,
            OrderId: orderId,
            Description: `Оплата заказа №${id}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl, // Теперь содержит id
            FailURL: failUrl, // Теперь содержит id
            Token: token,
        };

        // Отправляем запрос в Тинькофф
        const response = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.Success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ paymentUrl: result.PaymentURL }),
            };
        } else {
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
