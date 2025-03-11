const fetch = require("node-fetch");
require("dotenv").config();

exports.handler = async (event) => {
  try {
    const { amount } = JSON.parse(event.body);

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString("base64")}`,
        "Content-Type": "application/json",
        "Idempotence-Key": Date.now().toString(),
      },
      body: JSON.stringify({
        amount: {
          value: amount,
          currency: "RUB",
        },
        confirmation: {
          type: "redirect", // можно заменить на "qr", если нужен QR-код
          return_url: "https://your-website.com/success",
        },
        capture: true,
        description: "Тестовый платеж через Юкассу",
      }),
    });

    console.log("HTTP Status:", response.status, response.statusText);

    const text = await response.text();
    console.log("Raw response:", text);

    const data = JSON.parse(text); // Теперь обрабатываем JSON безопасно

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ payment_url: data.confirmation.confirmation_url }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data.description || "Неизвестная ошибка" }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
