const axios = require('axios');
const fetch = require('node-fetch');

const TERMINAL_KEY = 't.NJYz9R135O5TIK9EypaAICG5JDkT-PYjq_GFmTlaJh7Yn2Gz6o1G6_qrdmH78fwUxN7UXhfdOU_-hd91pFZvlw';

exports.handler = async (event, context) => {
    const { OrderId, Status } = JSON.parse(event.body);  // Получаем данные из вебхука
    console.log("Вебхук от Тинькофф:", OrderId, Status);

    // Платеж подтвержден, отправляем запрос для получения дополнительной информации
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
                return {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',  // Разрешаем доступ с любого домена
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ success: true, status: 'APPROVED' })
                };
            } else {
                return {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',  // Разрешаем доступ с любого домена
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ success: true, status: 'REJECTED' })
                };
            }
        } catch (error) {
            console.error("Ошибка при проверке платежа:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: 'Ошибка при проверке платежа' }),
            };
        }
    }

    return {
        statusCode: 200,
        body: "OK"
    };
};
