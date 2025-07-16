import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import Modal, { ModalProps } from 'react-native-modal';

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

const NewWishlistPrompt = forwardRef<TitleInputModalRef, TitleInputModalProps>(
  function NewWishlistPrompt(
    { 
      onSubmit, 
      modalProps = {}, 
      headerText = "Enter Title", 
      inputPlaceholder = "Title",
      cancelText = "Cancel",
      submitText = "Submit",
      style = {}
    }, 
    ref
  ) {
    const [isVisible, setIsVisible] = useState(false);
    const [title, setTitle] = useState('');

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setTitle('');
        setIsVisible(true);
      },
      hideModal: () => setIsVisible(false)
    }));

    const handleSubmit = () => {
      onSubmit(title);
      setIsVisible(false);
    };

    return (
      <Modal
        isVisible={isVisible}
        onBackdropPress={() => setIsVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropTransitionOutTiming={0}
        {...modalProps}
      >
        <View style={[styles.modalContent, style.modalContent]}>
          <Text style={[styles.title, style.title]}>{headerText}</Text>
          <TextInput
            style={[styles.input, style.input]}
            placeholder={inputPlaceholder}
            value={title}
            onChangeText={setTitle}
            autoFocus={true}
            onSubmitEditing={handleSubmit}
          />
          <View style={[styles.buttonContainer, style.buttonContainer]}>
            <TouchableOpacity 
            className='  border border-red-500'
              style={[
                styles.button, 
                style.button,
                style.cancelButton,
                styles.cancelButton
              ]}
              onPress={() => setIsVisible(false)}
            >
              <Text style={[styles.cancelButtonText]}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.submitButton, 
                style.button,
                style.submitButton,
                !title.trim() && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!title.trim()}
            >
              <Text style={[styles.buttonText]}>{submitText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
);

// Set display name for the component
NewWishlistPrompt.displayName = 'NewWishlistPrompt';

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth : 1,
    borderColor : "#f03e3e",
  },
  cancelButtonText : {
    color : "#f03e3e",
    fontWeight : "500"
  },
  submitButton: {
    backgroundColor: '#4361EE',
    opacity: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NewWishlistPrompt;