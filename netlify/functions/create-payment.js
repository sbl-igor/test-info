const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            body: ""
        };
    }

    try {
        const { orderId, amount } = JSON.parse(event.body);

        if (!orderId || !amount) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ success: false, error: "Неверные параметры." })
            };
        }

        const paymentData = {
            TerminalKey: process.env.TERMINAL_KEY,
            OrderId: orderId,
            Amount: amount, 
            Description: "Оплата заказа",
            PayType: "QR"
        };

        const response = await fetch('https://securepay.tinkoff.ru/v2/Init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        return {
            statusCode: result.Success ? 200 : 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ 
                success: result.Success, 
                paymentUrl: result.PaymentURL || null, 
                error: result.Message || null 
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
