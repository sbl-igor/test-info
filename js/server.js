const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());


const TERMINAL_KEY = 't.NJYz9R135O5TIK9EypaAICG5JDkT-PYjq_GFmTlaJh7Yn2Gz6o1G6_qrdmH78fwUxN7UXhfdOU_-hd91pFZvlw';
const API_URL = 'https://securepay.tinkoff.ru/v2';

console.log(TERMINAL_KEY)

app.post('/check-payment', async (req, res) => {
    try {
        const { OrderId } = req.body; // передаем номер заказа

        const payload = {
            TerminalKey: TERMINAL_KEY,
            OrderId: OrderId
        };

        const response = await axios.post(`${API_URL}/GetState`, payload);

        console.log("Ответ от Тинькофф:", response.data);

        if (response.data.Status === "CONFIRMED") {
            res.json({ success: true, message: "Платёж подтверждён" });
        } else {
            res.json({ success: false, message: "Платёж не подтверждён", status: response.data.Status });
        }
    } catch (error) {
        console.error("Ошибка при проверке платежа:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
