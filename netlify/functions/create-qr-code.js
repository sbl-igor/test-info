const fetch = require("node-fetch");
const { shopId, secretKey } = require("../../config");

console.log("shopId:", shopId);
console.log("secretKey:", secretKey);


exports.handler = async (event) => {
  try {
    console.log("🔹 Запрос на генерацию QR-кода получен");

    const { amount } = JSON.parse(event.body);
    console.log("🔹 Сумма платежа:", amount);

    // Проверяем, есть ли shopId и secretKey
    if (!shopId || !secretKey) {
      throw new Error("❌ Не найдены переменные YOOKASSA_SHOP_ID или YOOKASSA_SECRET_KEY");
    }

    const authHeader = `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`;
    console.log("🔹 Авторизация:", authHeader);

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "Idempotence-Key": Date.now().toString(),
      },
      body: JSON.stringify({
        amount: { value: amount, currency: "RUB" },
        confirmation: { type: "qr", return_url: "https://your-website.com/success" },
        description: "Оплата через СБП",
      }),
    });

    const data = await response.json();
    console.log("🔹 Ответ от Юкассы:", data);

    if (!data.confirmation || !data.confirmation.confirmation_url) {
      throw new Error("❌ Юкасса не вернула QR-код");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ qrCodeUrl: data.confirmation.confirmation_url }),
    };

  } catch (error) {
    console.error("❌ Ошибка API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
