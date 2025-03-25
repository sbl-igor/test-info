const crypto = require("crypto");

exports.handler = async function (event) {
    if (event.httpMethod !== "GET") {
        return { statusCode: 405, body: "Метод не разрешен" };
    }

    try {
        const urlParams = new URLSearchParams(event.queryStringParameters);
        const id = urlParams.get("id");
        const token = urlParams.get("token");
        const orderId = urlParams.get("orderId"); // Берём OrderID (можно не использовать)

        if (!id || !token) {
            return { statusCode: 403, body: JSON.stringify({ valid: false, message: "Доступ запрещен" }) };
        }

        const hmacSecret = "abyrepp88p1113dsqwe"; // Должен совпадать с `initPayment.js`
        const expectedToken = crypto
            .createHmac("sha256", hmacSecret)
            .update(`${id}:${orderId}`)
            .digest("hex");

        if (token !== expectedToken) {
            return { statusCode: 403, body: JSON.stringify({ valid: false, message: "Неверный токен" }) };
        }

        return { statusCode: 200, body: JSON.stringify({ valid: true }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Ошибка сервера" }) };
    }
};
