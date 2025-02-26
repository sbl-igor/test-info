AOS.init({
    once: true 
});

document.querySelector(".main-product").addEventListener("click", async () => {
    const response = await fetch("/.netlify/functions/create-payment", { method: "POST" });
    const data = await response.json();
    window.location.href = data.url; // Перенаправление на страницу оплаты
});
