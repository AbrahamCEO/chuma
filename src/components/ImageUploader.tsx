import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const IMGBB_API_KEY = '1edf02cd302f5cdc63cf31360a49c524';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  style?: any;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded, style }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPreviewUri(result.assets[0].uri);
        handleUpload(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Error picking image:', error);
    }
  };

  const handleUpload = async (imageAsset: any) => {
    setIsUploading(true);

    try {
      const base64Data = imageAsset.base64;
      const formData = new FormData();
      formData.append('key', IMGBB_API_KEY);
      formData.append('image', base64Data);
      
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const imageUrl = data.data.url;
        onImageUploaded(imageUrl);
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading to ImgBB:', error);
      Alert.alert('Error', 'Failed to upload image');
      setPreviewUri(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={[{
      alignItems: 'center',
      marginVertical: 10,
    }, style]}>
      {previewUri ? (
        <View style={{ marginBottom: 10 }}>
          <Image 
            source={{ uri: previewUri }} 
            style={{ width: 100, height: 100, borderRadius: 8 }}
          />
        </View>
      ) : null}
      
      <TouchableOpacity 
        style={{
          backgroundColor: '#FF4785',
          padding: 15,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isUploading ? 0.7 : 1,
        }} 
        onPress={pickImage}
        disabled={isUploading}
      >
        <Ionicons 
          name="image-outline" 
          size={24} 
          color="#fff" 
          style={{ marginRight: 8 }}
        />
        <Text style={{
          color: '#fff',
          fontSize: 16,
          fontWeight: '600',
        }}>
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Text>
        {isUploading && (
          <ActivityIndicator 
            size="small" 
            color="#fff" 
            style={{ marginLeft: 8 }}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ImageUploader;
