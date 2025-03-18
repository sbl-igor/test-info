const payments = new Map(); // Временное хранилище платежей

exports.handler = async (event) => {
    const { orderId } = JSON.parse(event.body);

    const status = payments.get(orderId) || "PENDING"; // Если нет данных — ожидаем

    return {
        statusCode: 200,
        body: JSON.stringify({
            success: status === "CONFIRMED",
            redirect: status === "CONFIRMED" ? "/success.html" : status === "REJECTED" ? "/fail.html" : null
        })
    };
};
