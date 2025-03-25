const crypto = require("crypto");
const fetch = require("node-fetch");

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

        // Данные из личного кабинета Тинькофф (ТЕСТОВЫЕ)
        const terminalKey = "1742653399078DEMO"; // TerminalKey
        const secretKey = "o2Pol35%i5XuLogi"; // SecretKey (тестовый пароль)
        const orderId = Date.now().toString(); // Уникальный ID заказа
        const notificationUrl = "https://info-products-360.netlify.app/.netlify/functions/paymentCallback"; 
        const successUrl = "https://info-products-360.netlify.app/success";
        const failUrl = "https://info-products-360.netlify.app/fail";

        // Формируем строку для подписи токена
        const tokenParams = {
            TerminalKey: terminalKey,
            Amount: amount,
            OrderId: orderId,
            Description: `Оплата заказа №${orderId}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl,
            Password: secretKey,
        };

        // Сортируем параметры по алфавиту и формируем строку
        const sortedKeys = Object.keys(tokenParams).sort();
        const tokenString = sortedKeys.map((key) => `${key}=${tokenParams[key]}`).join("");

        // Генерируем токен
        const token = crypto.createHash("sha256").update(tokenString).digest("hex");

        console.log("Generated Token:", token);

        // Параметры запроса для API Тинькофф
        const data = {
            TerminalKey: terminalKey,
            Amount: amount, 
            OrderId: orderId, 
            Description: `Оплата заказа №${orderId}`, 
            NotificationURL: notificationUrl, 
            SuccessURL: successUrl, 
            FailURL: failUrl, 
            Token: token, 
        };

        // Запрос к API Тинькофф
        const response = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        console.log("Ответ от Тинькофф:", result);

        if (result.Success) {
            // Возвращаем ссылку на страницу оплаты
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
