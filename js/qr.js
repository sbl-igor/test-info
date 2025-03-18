// Получаем ID товара из URL на странице qr-code.html
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);  // Извлекаем параметры из URL
    return params.get('id');  // Возвращаем значение параметра 'id'
}

const productId = getProductIdFromUrl();
console.log("Product ID from URL:", productId);  // Просто для проверки


function redirectToSuccessPage(productId) {
window.location.href = `success.html?id=${productId}`;  // Перенаправляем с параметром id
}
// В случае успешного завершения, передаем ID товара
redirectToSuccessPage(productId);  // Здесь productId - это ID товара, который был куплен