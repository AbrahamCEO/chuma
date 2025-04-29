import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const IMGBB_API_KEY = '1edf02cd302f5cdc63cf31360a49c524';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  images: string[];
  onRemoveImage: (index: number) => void;
  style?: any;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded, images, onRemoveImage, style }) => {
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
        setPreviewUri(null);
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
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ width: '100%', marginBottom: 15 }}
        contentContainerStyle={{ gap: 10 }}
      >
        {images.map((image, index) => (
          <View key={index} style={{ position: 'relative' }}>
            <Image 
              source={{ uri: image }} 
              style={{ width: 100, height: 100, borderRadius: 8 }}
            />
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 12,
                padding: 4,
              }}
              onPress={() => onRemoveImage(index)}
            >
              <Ionicons name="close-circle" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {previewUri && (
          <Image 
            source={{ uri: previewUri }} 
            style={{ width: 100, height: 100, borderRadius: 8, opacity: 0.7 }}
          />
        )}
      </ScrollView>

      <TouchableOpacity 
        style={{
          backgroundColor: '#FF4785',
          padding: 15,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isUploading ? 0.7 : 1,
          width: '100%',
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
          {isUploading ? 'Uploading...' : 'Add Image'}
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
