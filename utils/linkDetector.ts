/**
 * Utility functions for detecting and validating e-commerce product URLs
 */

export interface EcommerceSite {
  name: string;
  domains: string[];
  productUrlPattern: RegExp;
}

// Supported e-commerce sites with their domain patterns
const SUPPORTED_SITES: EcommerceSite[] = [
  {
    name: 'Amazon',
    domains: ['amazon.in', 'amazon.com'],
    productUrlPattern: /amazon\.(in|com)\/.*\/(dp|gp\/product)\/[A-Z0-9]+/i
  },
  {
    name: 'Flipkart',
    domains: ['flipkart.com'],
    productUrlPattern: /flipkart\.com\/.*\/p\/[a-z0-9]+/i
  },
  {
    name: 'Myntra',
    domains: ['myntra.com'],
    productUrlPattern: /myntra\.com\/.*\/[a-z0-9-]+\/[0-9]+/i
  },
  {
    name: 'Ajio',
    domains: ['ajio.com'],
    productUrlPattern: /ajio\.com\/.*\/[a-z0-9-]+\/p\/[0-9]+/i
  },
  {
    name: 'Nykaa',
    domains: ['nykaa.com'],
    productUrlPattern: /nykaa\.com\/.*\/p\/[a-z0-9-]+/i
  },
  {
    name: 'Meesho',
    domains: ['meesho.com'],
    productUrlPattern: /meesho\.com\/.*\/[a-z0-9-]+\/[0-9]+/i
  },
  {
    name: 'Snapdeal',
    domains: ['snapdeal.com'],
    productUrlPattern: /snapdeal\.com\/product\/[a-z0-9-]+\/[0-9]+/i
  }
];

/**
 * Validates if a URL is from a supported e-commerce site
 * @param url - The URL to validate
 * @returns Object with validation result and site info
 */
export function validateEcommerceUrl(url: string): {
  isValid: boolean;
  site?: EcommerceSite;
  normalizedUrl?: string;
} {
  try {
    const urlObj = new URL(url);
    
    // Check if domain matches any supported site
    for (const site of SUPPORTED_SITES) {
      if (site.domains.some(domain => urlObj.hostname.includes(domain))) {
        // Check if URL matches product pattern
        if (site.productUrlPattern.test(url)) {
          return {
            isValid: true,
            site,
            normalizedUrl: normalizeUrl(url)
          };
        }
      }
    }
    
    return { isValid: false };
  } catch (error) {
    return { isValid: false };
  }
}

/**
 * Normalizes a URL by removing tracking parameters and unnecessary query strings
 * @param url - The URL to normalize
 * @returns Normalized URL
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove common tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'ref', 'referrer', 'source', 'campaign', 'affiliate', 'partner',
      'gclid', 'fbclid', 'msclkid', 'twclid'
    ];
    
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch (error) {
    return url;
  }
}

/**
 * Gets a user-friendly site name for display
 * @param url - The URL to get site name for
 * @returns Site name or null if not supported
 */
export function getSiteName(url: string): string | null {
  const validation = validateEcommerceUrl(url);
  return validation.isValid ? validation.site?.name || null : null;
}

/**
 * Checks if a URL is likely a product page (basic validation)
 * @param url - The URL to check
 * @returns True if URL looks like a product page
 */
export function isProductUrl(url: string): boolean {
  const validation = validateEcommerceUrl(url);
  return validation.isValid;
}
