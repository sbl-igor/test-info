const fetch = require('node-fetch'); // Импортируем fetch

// Обработчик для Netlify Function
exports.handler = async function(event) {
    console.log("Запрос к Netlify-функции initPayment получен");

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Метод не разрешен" };
    }

    try {
        // Парсим тело запроса
        const { amount } = JSON.parse(event.body);

        // Проверка на корректность суммы
        if (!amount || amount <= 0) {
            return { statusCode: 400, body: JSON.stringify({ error: "Некорректная сумма" }) };
        }

        // Параметры для запроса к Тинькофф
        const terminalKey = "1742653399078DEMO";  // Проверь, что это правильный ключ
        const password = "o2Pol35%i5XuLogi";  // Проверь, что это правильный пароль
        const orderId = Date.now().toString(); // Уникальный ID заказа
        const notificationUrl = "https://yourwebsite.com/.netlify/functions/paymentCallback"; // Проверь URL
        const successUrl = "https://yourwebsite.com/success";  // Проверь URL
        const failUrl = "https://yourwebsite.com/fail";  // Проверь URL

        // Ваш токен
        const token = "t.EcEq_nbmYNGU4wwqso_tGCOl_PU1mOXdqNSmCqIxO00o6yKhfgL55qmMfHqLiem6rMdvntl4pNor0TyuC0i95A"; 

        // Логируем параметры для отладки
        console.log("Отправляем запрос с параметрами:");
        console.log({
            terminalKey,
            amount,
            orderId,
            notificationUrl,
            successUrl,
            failUrl,
            token
        });

        const data = {
            TerminalKey: terminalKey,
            Amount: amount * 100, // Тинькофф принимает сумму в копейках, поэтому умножаем на 100
            OrderId: orderId,
            Description: `Оплата заказа №${orderId}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl,
            Token: token  // Добавляем ваш токен в запрос
        };

        // Отправляем запрос к Тинькофф API
        const response = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        // Получаем ответ от Тинькофф
        const result = await response.json();

        // Логируем ответ для отладки
        console.log("Ответ от Тинькофф:");
        console.log(result);

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
