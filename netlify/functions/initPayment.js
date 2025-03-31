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

        // **Создаём HMAC токен (Только ID товара)**
        const hmacSecret = "abyrepp88p1113dsqwe";
        const secureToken = crypto.createHmac("sha256", hmacSecret).update(id).digest("hex");

        // **Передаём токен в success.html**
        const successUrl = `https://info-products-360.netlify.app/success?id=${id}&token=${secureToken}`;
        const failUrl = `https://info-products-360.netlify.app/fail?id=${id}`;

        // **Упрощённый объект Receipt с корректной суммой**
        const receipt = {
            Email: "shokeator98@gmail.com", // Замени на email покупателя
            Phone: "+79244324908", // Замени на телефон покупателя
            Taxation: "usn_income", // Система налогообложения
            Items: [
                {
                    Name: "Цифровой товар", // Общее название
                    Price: Math.round(amount * 100),
                    Quantity: 1,
                    Amount: Math.round(amount * 100),
                    Tax: "none" // Укажи соответствующую ставку НДС
                }
            ]
        };

        // **Формируем запрос в Тинькофф**
        const tokenParams = {
            TerminalKey: terminalKey,
            Amount: Math.round(amount * 100), // Сумма в копейках
            OrderId: orderId,
            Description: `Оплата товара ID: ${id}, заказ №${orderId}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl,
            Password: secretKey,
            Receipt: receipt,
        };

        // Генерируем токен SHA-256 для API Тинькофф
        const sortedKeys = Object.keys(tokenParams).sort();
        const tokenString = sortedKeys.map((key) => tokenParams[key]).join("");
        const token = crypto.createHash("sha256").update(tokenString).digest("hex");

        console.log("Generated Token:", token);

        // Отправляем запрос в Тинькофф
        const response = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...tokenParams, Token: token })
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
