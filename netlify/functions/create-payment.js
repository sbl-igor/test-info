const fetch = require("node-fetch");
const crypto = require("crypto");

const SHOP_ID = '123456';
const SECRET_KEY = 'test_ABC123';

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
    return {
        statusCode: 200,
        body: JSON.stringify({ url: result.confirmation.confirmation_url }),
    };
};
