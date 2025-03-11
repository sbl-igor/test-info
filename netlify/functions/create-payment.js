const fetch = require('node-fetch');
require('dotenv').config();

exports.handler = async (event) => {
  try {
    const { amount } = JSON.parse(event.body);

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': Date.now().toString(),
      },
      body: JSON.stringify({
        amount: { value: amount, currency: 'RUB' },
        confirmation: { 
          type: 'redirect', 
          return_url: 'https://info-products-360.netlify.app/success.html' 
        },
        capture: true, // Подтверждение платежа сразу
        description: 'Тестовый платеж',
      }),
    });

    const data = await response.json();
    console.log("Ответ от Юкассы:", JSON.stringify(data, null, 2));

    if (response.ok && data.confirmation && data.confirmation.confirmation_url) {
      return {
        statusCode: 200,
        body: JSON.stringify({ payment_url: data.confirmation.confirmation_url }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data.description || 'Ошибка создания платежа' }),
      };
    }
  } catch (error) {
    console.error("Ошибка API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
