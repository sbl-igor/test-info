console.log("Запрос к Netlify-функции initPayment получен");

exports.handler = async function(event) {
    console.log("Received event:", event);
    return { statusCode: 200, body: "OK" };
};



export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Метод не разрешен" };
    }

    try {
        const { amount } = JSON.parse(event.body);
        if (!amount || amount <= 0) {
            return { statusCode: 400, body: JSON.stringify({ error: "Некорректная сумма" }) };
        }

        const terminalKey = "1742653399078DEMO";
        const password = "o2Pol35%i5XuLogi";
        const orderId = Date.now().toString(); // Уникальный ID заказа
        const notificationUrl = "https://yourwebsite.com/.netlify/functions/paymentCallback";
        const successUrl = "https://yourwebsite.com/success";
        const failUrl = "https://yourwebsite.com/fail";

        const data = {
            TerminalKey: terminalKey,
            Amount: amount,
            OrderId: orderId,
            Description: `Оплата заказа №${orderId}`,
            NotificationURL: notificationUrl,
            SuccessURL: successUrl,
            FailURL: failUrl
        };

        const response = await fetch("https://securepay.tinkoff.ru/v2/Init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.Success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ paymentUrl: result.PaymentURL })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: result.Message });
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Ошибка сервера" })
        };
    }
}
