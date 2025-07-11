import { useState } from "react";
import { Button, SafeAreaView, Text, TextInput, View } from "react-native";
import WebView from "react-native-webview";


  // JavaScript to extract price from Amazon page
  const scrapeScript = `
    setTimeout(() => {
      // Try different price selectors
      const selectors = [
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '.a-price-whole',
        '.a-offscreen',
        '[data-asin-price]'
      ];
      
      let price = null;
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          let priceText = element.innerText || element.textContent;
          
          // Handle price parts (whole + fraction)
          if (selector === '.a-price-whole') {
            const fraction = document.querySelector('.a-price-fraction');
            if (fraction) priceText += '.' + fraction.innerText;
          }
          
          price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
          if (!isNaN(price)) break;
        }
      }
      
      // Send result back to React Native
      window.ReactNativeWebView.postMessage(price ? price.toString() : '');
    }, 3000);
    true;
  `;


export default function HomeScreen() {
  const [url, setUrl] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState<string>("");

  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleGetProductDetails = () => {
    setSubmittedUrl(url);
  };

   const handleMessage = (event : any) => {
    const price = parseFloat(event.nativeEvent.data);
    console.log({price, event});
    if (!isNaN(price)) {
      // onPriceFetched(price);
      // setPriceFound(true);
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView className=" flex-1">
      {/* HEADER */}
      <View className=" p-5">
      <View className="">
        <Text className=" font-bold text-4xl">My Wishlist</Text>
      </View>
      <Text>Paste the Url here</Text>
      <TextInput style={{borderWidth : 1, fontSize : 12, padding : 8}} onChangeText={setUrl} />
      <Button onPress={handleGetProductDetails} title="Submit" />
      <Button onPress={handleGetProductDetails} title="Reload" />

      {submittedUrl.length > 0 ? (
        <WebView
        renderError={() => <View><Text>Error</Text></View>}
          javaScriptEnabled={true}
          injectedJavaScript={scrapeScript}
          onMessage={handleMessage}
          style={{ height: 100, width: 100 }}
          source={{ uri: submittedUrl }}
        />
      ) : null}
      </View>
    </SafeAreaView>
  );
}
