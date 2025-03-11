exports.handler = async (event) => {
    try {
      const paymentData = JSON.parse(event.body);
  
      if (paymentData.event === "payment.succeeded") {
        console.log("✅ Платёж успешен:", paymentData.object.id);
        // Можно обновлять статус в БД или отправлять письмо клиенту
      } else {
        console.log("❌ Платёж не прошёл:", paymentData.object.id);
      }
  
      return { statusCode: 200, body: "Webhook received" };
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
  };
  