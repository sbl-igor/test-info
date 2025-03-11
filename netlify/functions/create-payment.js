const fetch = require('node-fetch');
require('dotenv').config();

exports.handler = async (event) => {
  try {
    const { amount } = JSON.parse(event.body); // Получаем сумму от клиента

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': Date.now().toString(),
      },
      body: JSON.stringify({
        amount: {
          value: amount,
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect', 
          return_url: 'https://info-products-360.netlify.app/success.html', 
          fail_url: 'https://info-products-360.netlify.app/fail.html',
        },
        description: 'Тестовый платеж через Юкассу',
      }),
    });

    const data = await response.json();

    if (response.ok) {
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
