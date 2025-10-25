import * as Linking from 'expo-linking';

class DeepLinkHandler {
  private static instance: DeepLinkHandler;
  private isInitialized = false;
  private static sharedUrls: string[] = [];

  static getInstance(): DeepLinkHandler {
    if (!DeepLinkHandler.instance) {
      DeepLinkHandler.instance = new DeepLinkHandler();
    }
    return DeepLinkHandler.instance;
  }

  static getSharedUrls(): string[] {
    return [...DeepLinkHandler.sharedUrls];
  }

  static clearSharedUrls(): void {
    DeepLinkHandler.sharedUrls = [];
  }

  static addSharedUrl(url: string): void {
    DeepLinkHandler.sharedUrls.unshift(url); // Add to beginning
    // Keep only last 10 URLs to prevent memory issues
    if (DeepLinkHandler.sharedUrls.length > 10) {
      DeepLinkHandler.sharedUrls = DeepLinkHandler.sharedUrls.slice(0, 10);
    }
  }

  initialize() {
    if (this.isInitialized) return;
    
    console.log('Initializing DeepLinkHandler');
    
    // Handle initial URL (app opened with a link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 Initial URL received:', url);
        this.handleDeepLink(url);
      }
    });

    // Handle URL changes while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('🔗 URL event received:', event.url);
      this.handleDeepLink(event.url);
    });

    this.isInitialized = true;
    
    return () => {
      subscription?.remove();
    };
  }

  // Method to handle shared content from SEND intent
  handleSharedContent(content: string) {
    console.log('📤 Shared content received:', content);
    
    // Check if the content looks like a URL
    if (this.isValidUrl(content)) {
      console.log('✅ Content appears to be a valid URL');
      this.handleDeepLink(content);
    } else {
      console.log('❌ Content does not appear to be a valid URL');
    }
  }

  private isValidUrl(string: string): boolean {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private handleDeepLink(url: string) {
    console.log('🔗 DeepLinkHandler received URL:', url);
    console.log('📱 URL type:', url.startsWith('mybuy://') ? 'Custom Scheme' : url.startsWith('https://') || url.startsWith('http://') ? 'Direct URL' : 'Unknown');
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    // Extract URL from the deep link
    let extractedUrl = url;
    
    // Handle different deep link formats
    if (url.startsWith('mybuy://')) {
      console.log('🎯 Processing custom scheme URL');
      // Custom scheme format: mybuy://share?url=https://...
      const urlParam = url.split('url=')[1];
      if (urlParam) {
        extractedUrl = decodeURIComponent(urlParam);
        console.log('🔓 Decoded URL parameter:', extractedUrl);
      } else {
        console.warn('⚠️ No URL parameter found in custom scheme');
      }
    } else if (url.startsWith('https://') || url.startsWith('http://')) {
      console.log('🌐 Processing direct URL');
      // Direct URL sharing
      extractedUrl = url;
    } else {
      console.warn('❌ Unsupported URL format:', url);
    }
    
    console.log('✅ Final extracted URL:', extractedUrl);
    console.log('🔍 URL length:', extractedUrl.length);
    
    // Store the URL for debugging purposes
    DeepLinkHandler.addSharedUrl(extractedUrl);
    console.log('💾 Stored URL in sharedUrls array. Total URLs:', DeepLinkHandler.sharedUrls.length);
    
    // Call the global handler if it exists
    // @ts-ignore
    if (global.handleSharedUrl) {
      console.log('📞 Calling global handleSharedUrl function');
      // @ts-ignore
      global.handleSharedUrl(extractedUrl);
    } else {
      console.error('❌ Global handleSharedUrl function not found');
    }
  }
}

export default DeepLinkHandler;

