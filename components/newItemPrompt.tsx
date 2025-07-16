import { scrapeScript } from "@/constants/constants";
import { Feather } from "@expo/vector-icons";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableHighlight,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Modal, { ModalProps } from "react-native-modal";
import WebView from "react-native-webview";

export type TitleInputModalRef = {
  showModal: () => void;
  hideModal: () => void;
};

type ProductData = {
  title: string;
  price: number | null;
};

type TitleInputModalProps = {
  onSubmit: (data: ProductData) => void; // Updated to accept both title and price
  modalProps?: Partial<ModalProps>;
  headerText?: string;
  inputPlaceholder?: string;
  cancelText?: string;
  submitText?: string;
  style?: {
    modalContent?: StyleProp<ViewStyle>;
    title?: StyleProp<TextStyle>;
    input?: StyleProp<TextStyle>;
    buttonContainer?: StyleProp<ViewStyle>;
    button?: StyleProp<ViewStyle>;
    cancelButton?: StyleProp<ViewStyle>;
    submitButton?: StyleProp<ViewStyle>;
    buttonText?: StyleProp<TextStyle>;
  };
};

const NewItemPrompt = forwardRef<TitleInputModalRef, TitleInputModalProps>(
  function NewItemPrompt(
    {
      onSubmit,
      modalProps = {},
      headerText = "Enter Product URL",
      inputPlaceholder = "Paste product URL here",
      cancelText = "Cancel",
      submitText = "Submit",
      style = {},
    },
    ref
  ) {
    const [isVisible, setIsVisible] = useState(false);
    const [url, setUrl] = useState(""); // Renamed from title to url for clarity
    const [searching, setSearching] = useState<boolean>(false);
    const [fetchFailed, setFetchFailed] = useState<boolean>(false);
    const [manualTitle, setManualTitle] = useState<string>("");
    const [manualPrice, setManualPrice] = useState<string>("");
    const [productData, setProductData] = useState<ProductData | null>(null);
    const [webViewVisible, setWebViewVisible] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setUrl("");
        setManualTitle("");
        setManualPrice("");
        setProductData(null);
        setFetchFailed(false);
        setIsVisible(true);
      },
      hideModal: () => setIsVisible(false),
    }));

    const handleSubmit = () => {
      if (!productData && !(manualTitle && manualPrice)) return;
      
      if (fetchFailed) {
        // Use manually entered data
        onSubmit({
          title: manualTitle,
          price: parseFloat(manualPrice),
        });
      } else if (productData) {
        // Use fetched data
        onSubmit(productData);
      }
      
      setIsVisible(false);
    };

    const handleMessage = (event: any) => {
      try {
        const result = JSON.parse(event.nativeEvent.data);
        console.log({ price: result?.price, title: result?.title, result });

        if (result?.title) {
          // Successfully fetched product details
          setProductData({
            title: result.title,
            price: result.price
          });
          setFetchFailed(false);
        } else {
          // Failed to fetch details
          setFetchFailed(true);
        }
      } catch (error) {
        console.error("Error parsing result:", error);
        setFetchFailed(true);
      } finally {
        setSearching(false);
        setWebViewVisible(false);
      }
    };

    const handleGetProductDetails = async () => {
      if (!url.trim()) {
        Alert.alert("Error", "Please enter a URL");
        return;
      }
      
      setSearching(true);
      setFetchFailed(false);
      setProductData(null);
      setWebViewVisible(true);
    };

    // Check if we can enable the submit button
    const canSubmit = () => {
      if (fetchFailed) {
        // Require both manual fields to be filled
        return manualTitle.trim() !== "" && manualPrice.trim() !== "";
      }
      
      // Product data is available
      return productData !== null;
    };

    return (
      <Modal
        isVisible={isVisible}
        onBackdropPress={() => setIsVisible(false)}
        animationIn="fadeIn"
        avoidKeyboard
        animationOut="fadeOut"
        backdropTransitionOutTiming={0}
        {...modalProps}
      >
        <View style={[styles.modalContent, style.modalContent]}>
          <Text style={[styles.title, style.title]}>{headerText}</Text>
          
          <View className="flex-row items-center w-full mb-4">
            <TextInput
              className="flex-1"
              style={[styles.input, style.input]}
              placeholder={inputPlaceholder}
              value={url}
              inputMode="url"
              onChangeText={setUrl}
              autoFocus={true}
              editable={!searching}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableHighlight
              onPress={handleGetProductDetails}
              className="border items-center justify-center p-2 rounded-r-sm border-[#ccc] border-l-0"
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator size="small" color="#4361EE" />
              ) : (
                <Feather name="search" size={24} />
              )}
            </TouchableHighlight>
          </View>
          
          {/* Manual input fields shown when fetch fails */}
          {fetchFailed && (
            <View className="w-full mb-4">
              <Text className="text-red-500 mb-2">
                Could not fetch product details. Please enter manually:
              </Text>
              <TextInput
                className="border border-[#ccc] p-2 rounded-sm mb-2"
                placeholder="Product Title"
                value={manualTitle}
                onChangeText={setManualTitle}
                autoCapitalize="words"
              />
              <TextInput
                className="border border-[#ccc] p-2 rounded-sm"
                placeholder="Price"
                value={manualPrice}
                onChangeText={setManualPrice}
                inputMode="decimal"
                keyboardType="decimal-pad"
              />
            </View>
          )}
          
          {/* Show fetched data preview */}
          {productData && !fetchFailed && (
            <View className="w-full mb-4 p-3 bg-gray-50 rounded-sm">
              <Text className="font-bold">{productData.title}</Text>
              <Text className="text-green-600 mt-1">
                Price: {productData.price ? `₹${productData.price}` : "N/A"}
              </Text>
            </View>
          )}
          
          <View style={[styles.buttonContainer, style.buttonContainer]}>
            <TouchableOpacity
              className="border border-red-500"
              style={[
                styles.button,
                style.button,
                style.cancelButton,
                styles.cancelButton,
              ]}
              onPress={() => { 
                setSearching(false); 
                setWebViewVisible(false);
                setIsVisible(false);
              }}
            >
              <Text style={[styles.cancelButtonText]}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                style.button,
                style.submitButton,
                !canSubmit() && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit()}
            >
              <Text style={[styles.buttonText]}>{submitText}</Text>
            </TouchableOpacity>
          </View>
          
          {/* WebView for scraping - hidden but active */}
          {webViewVisible && (
            <WebView
              javaScriptEnabled={true}
              injectedJavaScript={scrapeScript}
              onMessage={handleMessage}
              style={{ width: 1, height: 1 }} // Make it invisible
              source={{ uri: url }}
              onError={(error) => {
                console.error("WebView error:", error);
                setFetchFailed(true);
                setSearching(false);
                setWebViewVisible(false);
              }}
              onHttpError={(error) => {
                console.error("HTTP error:", error);
                setFetchFailed(true);
                setSearching(false);
                setWebViewVisible(false);
              }}
            />
          )}
        </View>
        
        {/* Full-screen loading indicator */}
      </Modal>
    );
  }
);

// ... rest of the styles remain the same
// Set display name for the component
NewItemPrompt.displayName = "NewItemPrompt";

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    padding: 22,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#f03e3e",
  },
  cancelButtonText: {
    color: "#f03e3e",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#4361EE",
    opacity: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default NewItemPrompt;
