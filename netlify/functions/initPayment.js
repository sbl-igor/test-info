const crypto = require("crypto");
const fetch = require("node-fetch");

exports.handler = async function (event) {
    console.log("Запрос к Netlify-функции initPayment получен");

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Метод не разрешен" };
    }

    try {
        const { amount, id } = JSON.parse(event.body);  // Получаем id из запроса
        if (!amount || amount <= 0) {
            return { statusCode: 400, body: JSON.stringify({ error: "Некорректная сумма" }) };
        }

        if (!id) {
            return { statusCode: 400, body: JSON.stringify({ error: "Некорректный ID товара" }) };  // Проверка на наличие ID товара
        }

        console.log("ID товара для оплаты:", id);  // Выводим ID товара в лог

        // Данные из личного кабинета Тинькофф (ТЕСТОВЫЕ)
        const terminalKey = "1742653399078DEMO"; // TerminalKey
        const secretKey = "o2Pol35%i5XuLogi"; // SecretKey (тестовый пароль)
        const orderId = Date.now().toString(); // Уникальный ID заказа
        const notificationUrl = "https://info-products-360.netlify.app/.netlify/functions/paymentCallback"; 
        const successUrl = `https://info-products-360.netlify.app/success?id=${id}`;  // Включаем ID товара в URL
        const failUrl = `https://info-products-360.netlify.app/fail?id=${id}`;  // Включаем ID товара в URL

        // Формируем параметры без вложенных объектов (Receipt, DATA)
        const tokenParams = {
            TerminalKey: terminalKey,
            Amount: amount,
            OrderId: orderId,
            Description: `Оплата товара ID: ${id}, заказ №${orderId}`,  // Включаем ID товара в описание
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl,
            Password: secretKey, // Пароль добавляется в конец!
        };

        // Сортируем параметры по ключу
        const sortedKeys = Object.keys(tokenParams).sort();
        const tokenString = sortedKeys.map((key) => tokenParams[key]).join(""); // Берём только значения

        // Генерируем токен (SHA-256)
        const token = crypto.createHash("sha256").update(tokenString).digest("hex");

        console.log("Generated Token:", token);

        // Параметры запроса для API Тинькофф
        const data = {
            TerminalKey: terminalKey,
            Amount: amount,
            OrderId: orderId,
            Description: `Оплата товара ID: ${id}, заказ №${orderId}`,  // Включаем ID товара в описание
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl,
            Token: token, // Используем новый токен
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
