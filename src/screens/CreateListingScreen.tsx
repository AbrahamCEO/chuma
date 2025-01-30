import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ImageUploader from '../components/ImageUploader';
import VideoUploader from '../components/VideoUploader';
import StatusBarComponent from '../components/StatusBarComponent';

const categories = [
  'Electronics',
  'Fashion',
  'Home',
  'Sports',
  'Books',
  'Other'
];

export default function CreateListingScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUploaded = (url: string) => {
    setImages(prev => [...prev, url]);
  };

  const handleVideoUploaded = (url: string) => {
    setVideo(url);
  };

  const handleSubmit = async () => {
    if (!title || !description || !price || !category || images.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields and add at least one image');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('listings')
        .insert([
          {
            user_id: user?.id,
            title,
            description,
            price: parseFloat(price),
            category,
            images,
            video,
            status: 'active'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      Alert.alert('Success', 'Your listing has been created!');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBarComponent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Listing</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Title Input */}
        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />

        {/* Description Input */}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          placeholderTextColor="#666"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Price Input */}
        <TextInput
          style={styles.input}
          placeholder="Price"
          placeholderTextColor="#666"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        {/* Category Selection */}
        <Text style={styles.label}>Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[
                styles.categoryButtonText,
                category === cat && styles.categoryButtonTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Image Uploader */}
        <Text style={styles.label}>Images (Required)</Text>
        <ImageUploader onImageUploaded={handleImageUploaded} />
        
        {images.length > 0 && (
          <Text style={styles.uploadStatus}>
            {images.length} image{images.length > 1 ? 's' : ''} uploaded
          </Text>
        )}

        {/* Video Uploader */}
        <Text style={styles.label}>Video (Optional)</Text>
        <VideoUploader onVideoUploaded={handleVideoUploaded} />
        
        {video && (
          <Text style={styles.uploadStatus}>Video uploaded successfully</Text>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Creating...' : 'Create Listing'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryButtonActive: {
    backgroundColor: '#FF4785',
    borderColor: '#FF4785',
  },
  categoryButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  uploadStatus: {
    color: '#FF4785',
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#FF4785',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
