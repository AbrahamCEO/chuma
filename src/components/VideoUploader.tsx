import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { cloudinaryConfig } from '../config/cloudinary';

interface VideoUploaderProps {
  onVideoSelect: (videoUrl: string) => void;
}

export default function VideoUploader({ onVideoSelect }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const videoUri = result.assets[0].uri;
        setPreviewUri(videoUri);
        await uploadVideo(videoUri);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      alert('Error selecting video. Please try again.');
    }
  };

  const uploadVideo = async (uri: string) => {
    try {
      setUploading(true);

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'video/mp4',
        name: 'upload.mp4',
      } as any);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/video/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        onVideoSelect(data.secure_url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {previewUri && !uploading && (
        <Video
          source={{ uri: previewUri }}
          style={styles.preview}
          useNativeControls
          resizeMode="contain"
        />
      )}
      
      <TouchableOpacity
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={pickVideo}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {previewUri ? 'Change Video' : 'Upload Video'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  preview: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#FF4785',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
