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

        // **Формируем объект Receipt (чек)**
        const Receipt = {
            Email: "customer@example.com",
            Phone: "+79001234567",
            Taxation: "usn_income",
            Items: [
                {
                    Name: "Инфо-продукт",
                    Price: amount,
                    Quantity: 1,
                    Amount: amount,
                    Tax: "none",
                    PaymentMethod: "full_prepayment",
                    PaymentObject: "commodity"
                }
            ]
        };

        // **Формируем запрос в Тинькофф (без Receipt для токена)**
        const tokenParams = {
            TerminalKey: terminalKey,
            Amount: amount,
            OrderId: orderId,
            Description: `Оплата товара ID: ${id}, заказ №${orderId}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl
        };

        // **Генерация токена по правилам Тинькофф**
        function generateToken(params, secretKey) {
            const filteredParams = Object.keys(params)
                .sort()
                .map(key => params[key])
                .concat(secretKey)
                .join("");

            return crypto.createHash("sha256").update(filteredParams).digest("hex");
        }

        // Создаём токен
        const token = generateToken(tokenParams, secretKey);
        console.log("Generated Token:", token);

        // **Отправляем запрос в Тинькофф**
        const response = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...tokenParams, Token: token, Receipt }) // Добавляем Receipt, но не используем в токене
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
