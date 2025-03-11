const fetch = require('node-fetch');
require('dotenv').config();

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
        amount: { value: amount, currency: "RUB" },
        confirmation: { type: "qr", return_url: "https://your-website.com/success" },
        description: "Тестовый платеж через Юкассу",
        payment_method_data: { type: "yoomoney" },
      }),
    });

    const data = await response.json();

    // 🔹 Отладка: Выводим ответ Юкассы в логи Netlify
    console.log("Юкасса ответ:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.description || "Неизвестная ошибка");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ payment_url: data.confirmation.confirmation_url }),
    };
  } catch (error) {
    console.error("Ошибка API:", error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
