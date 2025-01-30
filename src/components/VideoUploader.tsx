import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Replace with your Cloudinary credentials
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/video/upload';
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET';

interface VideoUploaderProps {
  onVideoUploaded: (url: string) => void;
  style?: any;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoUploaded, style }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 30, // 30 seconds max
      });

      if (!result.canceled && result.assets[0]) {
        handleUpload(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
      console.error('Error picking video:', error);
    }
  };

  const handleUpload = async (videoAsset: any) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: videoAsset.uri,
        type: 'video/mp4',
        name: 'upload.mp4',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', CLOUDINARY_URL);

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onVideoUploaded(response.secure_url);
          setIsUploading(false);
        } else {
          throw new Error('Upload failed');
        }
      };

      xhr.onerror = () => {
        throw new Error('Upload failed');
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      Alert.alert('Error', 'Failed to upload video');
      setIsUploading(false);
    }
  };

  return (
    <View style={[{
      alignItems: 'center',
      marginVertical: 10,
    }, style]}>
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
        onPress={pickVideo}
        disabled={isUploading}
      >
        <Ionicons 
          name="videocam-outline" 
          size={24} 
          color="#fff" 
          style={{ marginRight: 8 }}
        />
        <Text style={{
          color: '#fff',
          fontSize: 16,
          fontWeight: '600',
        }}>
          {isUploading 
            ? `Uploading ${uploadProgress}%` 
            : 'Upload Video'}
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

export default VideoUploader;
