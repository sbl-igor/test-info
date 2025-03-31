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

        // **Настройки мерчанта**
        const terminalKey = "1742653399078DEMO"; // Заменить на реальный TerminalKey
        const secretKey = "o2Pol35%i5XuLogi"; // Заменить на реальный SecretKey
        const orderId = Date.now().toString();
        const notificationUrl = "https://info-products-360.netlify.app/.netlify/functions/paymentCallback";

        // **Формируем объект Receipt**
        const receipt = {
            Email: "shokeator98@gmail.com",
            Phone: "+79244324908",
            Taxation: "usn_income",
            Items: [
                {
                    Name: "Цифровой товар",
                    Price: Math.round(amount * 100),
                    Quantity: 1,
                    Amount: Math.round(amount * 100),
                    Tax: "none"
                }
            ]
        };

        // **Формируем параметры для запроса**
        const requestParams = {
            TerminalKey: terminalKey,
            Amount: Math.round(amount * 100).toString(), // Обязательно строка!
            OrderId: orderId,
            Description: `Оплата товара ID: ${id}, заказ №${orderId}`,
            NotificationURL: notificationUrl
        };

        // **Формируем строку для токена (без Receipt!)**
        const tokenString = Object.keys(requestParams)
            .sort()
            .map((key) => requestParams[key])
            .join("") + secretKey;
        const token = crypto.createHash("sha256").update(tokenString).digest("hex");

        console.log("Generated Token:", token);

        // **Добавляем токен в запрос**
        const requestBody = {
            ...requestParams,
            Token: token,
            Receipt: receipt // Receipt добавляем, но не включаем в токен
        };

        // **Отправляем запрос в Тинькофф**
        const response = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        console.log("Ответ от Тинькофф:", result);

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
