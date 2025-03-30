const crypto = require("crypto");
const fetch = require("node-fetch");

exports.handler = async function (event) {
    console.log("Запрос к Netlify-функции initPayment получен");

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Метод не разрешен" };
    }

    try {
        const { amount, id } = JSON.parse(event.body);
        if (!amount || amount <= 0) {
            return { statusCode: 400, body: JSON.stringify({ error: "Некорректная сумма" }) };
        }
        if (!id) {
            return { statusCode: 400, body: JSON.stringify({ error: "Некорректный ID товара" }) };
        }

        console.log("ID товара для оплаты:", id);

        const terminalKey = "1742653399078DEMO";
        const secretKey = "o2Pol35%i5XuLogi";
        const orderId = Date.now().toString();
        const notificationUrl = "https://info-products-360.netlify.app/.netlify/functions/paymentCallback";

        const successUrl = `https://info-products-360.netlify.app/success?id=${id}`;
        const failUrl = `https://info-products-360.netlify.app/fail?id=${id}`;

        const tokenParams = {
            TerminalKey: terminalKey,
            Amount: amount,
            OrderId: orderId,
            Description: `Оплата товара ID: ${id}, заказ №${orderId}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl,
            Password: secretKey // Пароль используется только для генерации токена, не отправляется
        };

        // Создание токена согласно документации Тинькофф
        const sortedKeys = Object.keys(tokenParams).filter(key => key !== "Password").sort();
        const tokenString = sortedKeys.map(key => tokenParams[key]).join("") + secretKey;
        const token = crypto.createHash("sha256").update(tokenString).digest("hex");

        console.log("Generated Token:", token);

        delete tokenParams.Password; // Удаляем пароль, он не должен отправляться в запросе

        const requestBody = { ...tokenParams, Token: token };

        const response = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        console.log("Ответ от Тинькофф:", result);

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
