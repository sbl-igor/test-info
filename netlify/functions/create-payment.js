const fetch = require("node-fetch");
require("dotenv").config();

exports.handler = async (event) => {
  try {
    const { amount } = JSON.parse(event.body); // Получаем сумму из запроса

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
          type: "redirect", // Используем редирект вместо QR-кода для тестирования
          return_url: "https://info-products-360.netlify.app/success.html",
        },
        capture: true, // Автоматически подтверждаем платеж
        description: "Тестовый платеж через Юкассу",
      }),
    });

    const textResponse = await response.text(); // Читаем ответ как текст
    console.log("Сырой ответ от Юкассы:", textResponse);

    try {
      const data = JSON.parse(textResponse); // Пробуем распарсить JSON
      console.log("Парсенный JSON от Юкассы:", JSON.stringify(data, null, 2));

      if (response.ok && data.confirmation && data.confirmation.confirmation_url) {
        return {
          statusCode: 200,
          body: JSON.stringify({ payment_url: data.confirmation.confirmation_url }),
        };
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: data.description || "Ошибка создания платежа" }),
        };
      }
    } catch (parseError) {
      console.error("Ошибка при парсинге JSON:", parseError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Ошибка обработки ответа от Юкассы", rawResponse: textResponse }),
      };
    }
  } catch (error) {
    console.error("Ошибка:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
