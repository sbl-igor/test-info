const crypto = require("crypto");
const fetch = require("node-fetch");

exports.handler = async function (event) {
    console.log("📥 Запрос к Netlify-функции initPayment получен");

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Метод не разрешен" }),
        };
    }

    try {
        // 🔹 Извлечение и проверка данных из запроса
        const { amount, id } = JSON.parse(event.body);

        if (!amount || amount <= 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Некорректная сумма" }),
            };
        }

        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Некорректный ID товара" }),
            };
        }

        console.log("🛒 ID товара:", id);

        // 🔹 Константы и параметры
        const terminalKey = "1742653399078DEMO";
        const secretKey = "o2Pol35%i5XuLogi";
        const orderId = Date.now().toString();
        const notificationUrl = "https://info-products-360.netlify.app/.netlify/functions/paymentCallback";

        // HMAC-токен для SuccessURL
        const hmacSecret = "abyrepp88p1113dsqwe";
        const secureToken = crypto.createHmac("sha256", hmacSecret).update(id).digest("hex");

        const successUrl = `https://info-products-360.netlify.app/success?id=${id}&token=${secureToken}`;
        const failUrl = `https://info-products-360.netlify.app/fail?id=${id}`;

        // 🔹 Чек для фискализации
        const receipt = {
            Email: "shokeator98@gmail.com",
            Phone: "+79244324908",
            Taxation: "usn_income",
            Items: [{
                Name: "Цифровой товар",
                Price: amount,
                Quantity: 1,
                Amount: amount,
                Tax: "none",
            }],
        };

        // 🔹 Подготовка параметров для генерации токена
        const paymentParams = {
            TerminalKey: terminalKey,
            Amount: amount,
            OrderId: orderId,
            Description: `Оплата товара ID: ${id}, заказ №${orderId}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl,
            Password: secretKey, // Только для генерации токена
        };

        // 🔹 Генерация токена
        const sortedKeys = Object.keys(paymentParams).sort();
        const tokenString = sortedKeys.map((key) => paymentParams[key]).join("") + secretKey;
        const token = crypto.createHash("sha256").update(tokenString).digest("hex");

        console.log("🔐 Сгенерированный токен:", token);

        // 🔹 Отправка запроса в Tinkoff
        const tinkoffResponse = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...paymentParams,
                Token: token,
                Receipt: receipt,
            }),
        });

        const result = await tinkoffResponse.json();
        console.log("📦 Ответ от Tinkoff:", result);

        // 🔹 Возврат ссылки на оплату или сообщение об ошибке
        if (result.Success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ paymentUrl: result.PaymentURL }),
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: result.Message || "Ошибка при инициализации оплаты" }),
            };
        }

    } catch (err) {
        console.error("❌ Ошибка сервера:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Внутренняя ошибка сервера" }),
        };
    }
};
