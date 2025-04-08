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

        const terminalKey = "1742653399078DEMO";
        const secretKey = "o2Pol35%i5XuLogi";
        const orderId = Date.now().toString();
        const notificationUrl = "https://info-products-360.netlify.app/.netlify/functions/paymentCallback";

        const hmacSecret = "abyrepp88p1113dsqwe";
        const secureToken = crypto.createHmac("sha256", hmacSecret).update(id).digest("hex");

        const successUrl = `https://info-products-360.netlify.app/success?id=${id}&token=${secureToken}`;
        const failUrl = `https://info-products-360.netlify.app/fail?id=${id}`;

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

        // 🔐 Полный набор параметров, включая Receipt
        const fullParams = {
            TerminalKey: terminalKey,
            Amount: amount,
            OrderId: orderId,
            Description: `Оплата товара ID: ${id}, заказ №${orderId}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl,
            Receipt: receipt
        };

        // Генерация токена (важно: Receipt сериализуется в строку!)
        const tokenParams = {
            ...fullParams,
            Password: secretKey
        };

        const sortedKeys = Object.keys(tokenParams).sort();

        const tokenString = sortedKeys.map(key => {
            const value = tokenParams[key];
            return typeof value === "object" ? JSON.stringify(value) : String(value);
        }).join("");

        const token = crypto.createHash("sha256").update(tokenString).digest("hex");

        console.log("🔐 Сгенерированный токен:", token);

        // 🔹 Отправка запроса в Tinkoff
        const tinkoffResponse = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...fullParams,
                Token: token
            }),
        });

        const result = await tinkoffResponse.json();
        console.log("📦 Ответ от Tinkoff:", result);

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
