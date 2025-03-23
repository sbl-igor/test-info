export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Метод не разрешен" };
    }

    const data = JSON.parse(event.body);

    console.log("Уведомление о платеже:", data);

    if (data.Success) {
        console.log("Оплата успешна для заказа:", data.OrderId);
    } else {
        console.log("Оплата не прошла:", data.OrderId);
    }

    return { statusCode: 200, body: "OK" };
}
