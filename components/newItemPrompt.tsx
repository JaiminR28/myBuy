import { scrapeScript } from "@/constants/constants";
import { Feather } from "@expo/vector-icons";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  ActivityIndicator,
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

type TitleInputModalProps = {
  onSubmit: (title: string) => void;
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
      headerText = "Enter Title",
      inputPlaceholder = "Title",
      cancelText = "Cancel",
      submitText = "Submit",
      style = {},
    },
    ref
  ) {
    const [isVisible, setIsVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [searching, setSearching] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setTitle("");
        setIsVisible(true);
      },
      hideModal: () => setIsVisible(false),
    }));

    const handleSubmit = () => {
      onSubmit(title);
      setIsVisible(false);
    };

    const handleMessage = (event: any) => {
       const result = JSON.parse(event.nativeEvent.data);
    console.log({ price : result?.price, title : result?.title , result});
      setSearching(false);
    };

    const handleGetProductDetails = async () => {
      setSearching(true);
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
          <View className="flex-row items-center w-full mb-5">
            <TextInput
              className=" flex-1"
              style={[styles.input, style.input]}
              placeholder={inputPlaceholder}
              value={title}
              inputMode="search"
              onChangeText={setTitle}
              autoFocus={true}
              onSubmitEditing={handleSubmit}
            />
            <TouchableHighlight
              onPress={handleGetProductDetails}
              className=" border items-center justify-center p-2 rounded-r-sm border-[#ccc] border-l-0"
            >
              <Feather name="search" size={24} />
            </TouchableHighlight>
          </View>
          <View style={[styles.buttonContainer, style.buttonContainer]}>
            <TouchableOpacity
              className="  border border-red-500"
              style={[
                styles.button,
                style.button,
                style.cancelButton,
                styles.cancelButton,
              ]}
              onPress={() =>{ setSearching(false); setIsVisible(false)}}
            >
              <Text style={[styles.cancelButtonText]}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                style.button,
                style.submitButton,
                !title.trim() && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={!title.trim()}
            >
              <Text style={[styles.buttonText]}>{submitText}</Text>
            </TouchableOpacity>
          </View>
          {title.length > 0 && searching ? (
            <WebView
              renderError={() => (
                <View>
                  <Text>Error fetching product details</Text>
                </View>
              )}
              javaScriptEnabled={true}
              injectedJavaScript={scrapeScript}
              onMessage={handleMessage}
              style={{ height: 100, width: 100 }}
              source={{ uri: title }}
            />
          ) : null}
        </View>
        {searching ? <ActivityIndicator/> : null}
      </Modal>
    );
  }
);

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
