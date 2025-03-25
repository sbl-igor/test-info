const crypto = require("crypto");
const fetch = require("node-fetch");

exports.handler = async function (event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Метод не разрешен" };
    }

    try {
        const { amount, id, successUrl, failUrl } = JSON.parse(event.body);

        // Проверка на корректность параметров
        if (!amount || amount <= 0) {
            return { statusCode: 400, body: JSON.stringify({ error: "Некорректная сумма" }) };
        }
        if (!id) {
            return { statusCode: 400, body: JSON.stringify({ error: "Отсутствует id заказа" }) };
        }

        const terminalKey = "1742653399078DEMO";
        const secretKey = "o2Pol35%i5XuLogi";
        const orderId = `${id}-${Date.now()}`; // Уникальный OrderId
        const notificationUrl = "https://info-products-360.netlify.app/.netlify/functions/paymentCallback";

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

        const sortedKeys = Object.keys(tokenParams).sort();
        const tokenString = sortedKeys.map((key) => tokenParams[key]).join("");
        const token = crypto.createHash("sha256").update(tokenString).digest("hex");

        const data = {
            TerminalKey: terminalKey,
            Amount: amount,
            OrderId: orderId,
            Description: `Оплата заказа №${id}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl,
            Token: token,
        };

        const response = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.Success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ paymentUrl: result.PaymentURL }), // Возвращаем ссылку на платежную страницу
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
