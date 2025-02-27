import fetch from "node-fetch";
const crypto = require("crypto");

const SHOP_ID = process.env.YOOKASSA_SHOP_ID; // Данные хранятся в переменных окружения
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

exports.handler = async function(event) {
    const idempotenceKey = crypto.randomUUID();

    const paymentData = {
        amount: { value: "100.00", currency: "RUB" }, // Укажи цену
        confirmation: { type: "redirect", return_url: "https://info-products-360.netlify.app/success" }, // Куда вернет после оплаты
        capture: true,
        description: "Покупка документа"
    };

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Idempotence-Key": idempotenceKey,
            Authorization: "Basic " + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString("base64")
        },
        body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (!result.confirmation || !result.confirmation.confirmation_url) {
        console.error("Ошибка: confirmation_url отсутствует!", result);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Ошибка создания платежа. Попробуйте позже." }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ url: result.confirmation.confirmation_url }),
    };
};

console.log("SHOP_ID:", process.env.YOOKASSA_SHOP_ID);
console.log("SECRET_KEY:", process.env.YOOKASSA_SECRET_KEY ? "Exist" : "Not set");
