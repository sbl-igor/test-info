const fetch = require('node-fetch'); // Для отправки HTTP-запросов
const payments = new Map();  // Временное хранилище статусов платежей


// Получаем ключи из переменных окружения
const TERMINAL_KEY = 't.NJYz9R135O5TIK9EypaAICG5JDkT-PYjq_GFmTlaJh7Yn2Gz6o1G6_qrdmH78fwUxN7UXhfdOU_-hd91pFZvlw';

exports.handler = async (event) => {
  const { OrderId, Status } = JSON.parse(event.body);  // Получаем данные из вебхука

  console.log("Вебхук от Тинькофф:", OrderId, Status);
  console.log("Данные вебхука:", JSON.parse(event.body));
  console.log('TERMINAL_KEY:', process.env.TERMINAL_KEY);


  // Если статус платежа "CONFIRMED", можно отправить запрос для дальнейшей проверки через API Тинькофф
  if (Status === "CONFIRMED") {
      try {
          const checkResponse = await fetch('https://securepay.tinkoff.ru/v2/GetState', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  TerminalKey: TERMINAL_KEY,
                  OrderId: OrderId
              })
          });

          const checkData = await checkResponse.json();

          if (checkData.Status === "CONFIRMED") {
              payments.set(OrderId, "CONFIRMED");  // Обновляем статус на "CONFIRMED"
          } else {
              payments.set(OrderId, "REJECTED");  // Обновляем статус на "REJECTED"
          }

      } catch (error) {
          console.error("Ошибка при проверке платежа:", error);
          payments.set(OrderId, "FAILED");  // В случае ошибки считаем платёж неуспешным
      }
  }

  // Возвращаем ответ
  return {
      statusCode: 200,
      body: "OK"
  };
};

