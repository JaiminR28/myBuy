export const scrapeScript = `
  setTimeout(() => {
    const result = { title: null, price: null };
    
    try {
      // Title extraction
      const titleEl = document.getElementById('productTitle');
        result.title = titleEl;
      
      // Price extraction
      const priceEl = document.querySelector('.a-price-whole, .priceToPay');
      if (priceEl) {
        let priceText = priceEl.textContent || '';
        const fraction = document.querySelector('.a-price-fraction');
        if (fraction) priceText += '.' + fraction.textContent;
        result.price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      }
      
    } catch (error) {
      result.error = error.message;
    }
    
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
  }, 3000);
  true;
`;