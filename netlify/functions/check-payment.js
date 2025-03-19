const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { orderId } = JSON.parse(event.body);  // Получаем orderId из тела запроса

  const TERMINAL_KEY = process.env.TERMINAL_KEY; // Используем ключ из переменных окружения

  try {
    const response = await fetch('https://securepay.tinkoff.ru/v2/GetState', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        TerminalKey: TERMINAL_KEY,
        OrderId: orderId
      })
    });

    const data = await response.json();

    if (data.Status === 'CONFIRMED') {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, status: 'CONFIRMED' })
      };
    } else if (data.Status === 'REJECTED') {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: false, status: 'REJECTED' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: false, status: 'PENDING' })
    };
  } catch (error) {
    console.error("Ошибка при проверке платежа:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Ошибка при обработке запроса' })
    };
  }
};
