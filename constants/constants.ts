// export const scrapeScript = `
//   setTimeout(() => {
//     const result = { title: null, price: null };
    
//     try {
//       // Title extraction
//       const titleEl = document.getElementById('title');
//         result.title = titleEl;
      
//       // Price extraction
//       const priceEl = document.querySelector('.a-price-whole, .priceToPay');
//       if (priceEl) {
//         let priceText = priceEl.textContent || '';
//         const fraction = document.querySelector('.a-price-fraction');
//         if (fraction) priceText += '.' + fraction.textContent;
//         result.price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
//       }
      
//     } catch (error) {
//       result.error = error.message;
//     }
    
//     window.ReactNativeWebView.postMessage(JSON.stringify(result));
//   }, 3000);
//   true;
// `;

export const scrapeScript = `
  setTimeout(() => {
    const result = { title: null, price: null, description : null , image : null};
    
    try {
      // Title extraction
      const titleEl = document.getElementById('title');
      if (titleEl) {
        // Get the text inside the span, and trim whitespace
        result.title = titleEl.textContent.trim();
      }

      //2. Price extraction
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
    

      //3. Image extraction
      const imgEl = document.getElementById('landingImage');
      if (imgEl) {
        // The src might be in 'src' or 'data-old-hires'
        result.image = imgEl;
      }


    // 4. Extract product description
    const descriptionSelectors = [
      '#productDescription', // Main description
      '#feature-bullets', // Feature bullets
      '#descriptionAndDetails', // Combined section
      '.product-description', // Generic class
      '#aplus', // A+ content
      '#bookDescription_feature_div' // Books specific
    ];
    
    let description = null;
    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        // Try to get feature bullets if available
        const bullets = element.querySelectorAll('.a-list-item, .a-spacing-small');
        if (bullets.length > 0) {
          description = Array.from(bullets)
            .map(el => el.innerText.trim())
            .filter(t => t.length > 0)
            .join('\\n• ');
          if (description) break;
        }
        
        // Fallback to text content
        description = element.innerText || element.textContent;
        if (description) {
          description = description.replace(/\s+/g, ' ').trim();
          if (description.length > 0) break;
        }
      }
    }

    // Truncate long descriptions
    if (description && description.length > 500) {
      result.description = description.substring(0, 500) + '...';
    }
    
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
  }, 3000);
  true;
`;
