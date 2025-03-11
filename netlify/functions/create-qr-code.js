const fetch = require("node-fetch");
require("dotenv").config();

exports.handler = async (event) => {
  try {
    const { amount } = JSON.parse(event.body); // Получаем сумму от клиента

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
          type: "qr", // Генерация QR-кода
          return_url: "https://your-website.com/success",
        },
        description: "Оплата через СБП",
      }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ qrCodeUrl: data.confirmation.confirmation_url }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
