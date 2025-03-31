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

        const terminalKey = "1742653399078DEMO";  // Ваш TerminalKey
        const secretKey = "o2Pol35%i5XuLogi";  // Ваш SecretKey
        const password = "usaf8fw8fsw21g";  // Пароль из ЛК Тинькофф
        const orderId = Date.now().toString();
        const notificationUrl = "https://info-products-360.netlify.app/.netlify/functions/paymentCallback";
        
        const successUrl = `https://info-products-360.netlify.app/success?id=${id}`;
        const failUrl = `https://info-products-360.netlify.app/fail?id=${id}`;

        const receipt = {
            Email: "shokeator98@gmail.com",
            Phone: "+79244324908",
            Taxation: "usn_income",
            Items: [{
                Name: "Цифровой товар",
                Price: Math.round(amount * 100),
                Quantity: 1,
                Amount: Math.round(amount * 100),
                Tax: "none"
            }]
        };

        // Формируем объект для подписи (ТОЛЬКО КОРНЕВЫЕ ПОЛЯ!)
        const tokenParams = {
            TerminalKey: terminalKey,
            Amount: Math.round(amount * 100).toString(),
            OrderId: orderId,
            Description: `Оплата товара ID: ${id}, заказ №${orderId}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl
        };

        // Генерация строки для подписи (ключи сортируем)
        const tokenString = Object.keys(tokenParams)
            .sort()  // Сортируем ключи
            .reduce((acc, key) => acc + tokenParams[key], "") + secretKey; // Объединяем значения и добавляем SecretKey

        // Генерация токена SHA-256
        const token = crypto.createHash("sha256").update(tokenString).digest("hex");

        console.log("Данные для подписи (tokenString):", tokenString);
        console.log("Generated Token:", token);

        // Отправляем запрос в Тинькофф
        const response = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...tokenParams,
                Token: token,  // Передаем токен
                Receipt: receipt // Receipt передаем, но не включаем в токен
            })
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
