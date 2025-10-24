import * as Linking from 'expo-linking';

class DeepLinkHandler {
  private static instance: DeepLinkHandler;
  private isInitialized = false;

  static getInstance(): DeepLinkHandler {
    if (!DeepLinkHandler.instance) {
      DeepLinkHandler.instance = new DeepLinkHandler();
    }
    return DeepLinkHandler.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    
    console.log('Initializing DeepLinkHandler');
    
    // Handle initial URL (app opened with a link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.handleDeepLink(url);
      }
    });

    // Handle URL changes while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      this.handleDeepLink(event.url);
    });

    this.isInitialized = true;
    
    return () => {
      subscription?.remove();
    };
  }

  private handleDeepLink(url: string) {
    console.log('DeepLinkHandler received:', url);
    
    // Extract URL from the deep link
    let extractedUrl = url;
    
    // Handle different deep link formats
    if (url.startsWith('mybuy://')) {
      // Custom scheme format: mybuy://share?url=https://...
      const urlParam = url.split('url=')[1];
      if (urlParam) {
        extractedUrl = decodeURIComponent(urlParam);
      }
    } else if (url.startsWith('https://') || url.startsWith('http://')) {
      // Direct URL sharing
      extractedUrl = url;
    }
    
    console.log('Extracted URL:', extractedUrl);
    
    // Call the global handler if it exists
    // @ts-ignore
    if (global.handleSharedUrl) {
      // @ts-ignore
      global.handleSharedUrl(extractedUrl);
    }
  }
}

export default DeepLinkHandler;
