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

        // Ваши данные из ЛК Тинькофф
        const terminalKey = "1742653399078DEMO"; // TerminalKey
        const secretKey = "o2Pol35%i5XuLogi"; // SecretKey
        const orderId = Date.now().toString(); // Уникальный ID заказа
        const notificationUrl = "https://info-products-360.netlify.app/.netlify/functions/paymentCallback"; // Укажите правильный URL для обработки уведомлений
        const successUrl = "https://info-products-360.netlify.app/success"; // URL для успешного завершения оплаты
        const failUrl = "https://info-products-360.netlify.app/fail"; // URL для неудачной оплаты

        const data = {
            TerminalKey: terminalKey,
            Amount: amount, // сумма в копейках (например, 1000 — это 10 рублей)
            OrderId: orderId, // уникальный ID заказа
            Description: `Оплата заказа №${orderId}`, // описание
            NotificationURL: notificationUrl, // URL для получения уведомлений
            SuccessURL: successUrl, // URL для успеха
            FailURL: failUrl, // URL для неудачи
        };

        // Сортировка параметров по алфавиту
        const sortedData = Object.keys(data).sort().reduce((result, key) => {
            result[key] = data[key];
            return result;
        }, {});

        // Генерация токена
        const token = generateToken(sortedData, secretKey);
        console.log("Generated Token:", token);

        // Включаем токен в параметры запроса
        const dataWithToken = {
            ...sortedData,
            Token: token
        };

        console.log("Отправляем запрос с параметрами:", dataWithToken);

        // Запрос к API Тинькофф для инициализации платежа
        const response = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataWithToken),
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

// Функция для генерации токена
const generateToken = (data, secretKey) => {
    const signData = JSON.stringify(data); // Сериализация данных в JSON
    return crypto.createHmac("sha256", secretKey).update(signData).digest("hex");
};
