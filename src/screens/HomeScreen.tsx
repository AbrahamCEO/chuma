import StatusBarComponent from '../components/StatusBarComponent';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useCallback } from 'react';

// Mock data for products with multiple images per product
const PRODUCTS = [
  {
    id: '1',
    title: 'Vintage Leather Jacket',
    price: '$120',
    seller: 'John Doe',
    description: 'Genuine leather jacket in excellent condition',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&q=80'
    ],
    likes: 234,
    comments: 45,
    location: 'New York, NY',
  },
  {
    id: '2',
    title: 'Nike Air Max 2024',
    price: '$180',
    seller: 'Jane Smith',
    description: 'Brand new, never worn. Original box included',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80'
    ],
    likes: 456,
    comments: 67,
    location: 'Los Angeles, CA',
  },
  {
    id: '3',
    title: 'iPhone 15 Pro Max',
    price: '$999',
    seller: 'Tech Store',
    description: 'Sealed in box, 256GB, Titanium',
    images: [
      'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1697493621337-89c8c6809f01?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1697553503153-7f7b15c8f5ea?auto=format&fit=crop&q=80'
    ],
    likes: 789,
    comments: 90,
    location: 'San Francisco, CA',
  },
];

const CATEGORIES = ['All', 'Fashion', 'Electronics', 'Home', 'Sports', 'Beauty', 'Cars', 'Books'];

// Separate Product Carousel Component
const ProductCarousel = ({ item }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  const description = item.description;
  const isLongDescription = description.length > 100;
  const displayDescription = showFullDescription ? description : description.slice(0, 100);

  return (
    <View style={styles.reelContainer}>
      {/* Image Carousel */}
      <FlatList
        data={item.images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentImageIndex(newIndex);
        }}
        renderItem={({ item: imageUrl }) => (
          <Image
            source={{ uri: imageUrl }}
            style={styles.reelImage}
            resizeMode="cover"
          />
        )}
        keyExtractor={(_, index) => index.toString()}
      />

      {/* Product Info Overlay */}
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productTitle}>{item.title}</Text>
          <Text style={styles.productPrice}>{item.price}</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description} numberOfLines={showFullDescription ? undefined : 2}>
            {displayDescription}
          </Text>
          {isLongDescription && (
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.moreButton}>
                {showFullDescription ? 'Show less' : 'More...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.sellerInfo}>
          <View style={styles.sellerProfile}>
            <View style={styles.sellerAvatar}>
              <Ionicons name="person" size={20} color="#666" />
            </View>
            <View>
              <Text style={styles.sellerName}>@{item.seller}</Text>
              <Text style={styles.location}>{item.location}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.messageButton}>
            <Ionicons name="chatbubble" size={20} color="white" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionButtonCircle}>
            <Ionicons name="heart-outline" size={28} color="white" />
          </View>
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionButtonCircle}>
            <Ionicons name="chatbubble-outline" size={26} color="white" />
          </View>
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionButtonCircle}>
            <Ionicons name="share-social-outline" size={28} color="white" />
          </View>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Dot indicators at bottom */}
      <View style={styles.dotContainer}>
        {item.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { opacity: currentImageIndex === index ? 1 : 0.5 }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  const getItemLayout = useCallback((data, index) => ({
    length: height,
    offset: height * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      <StatusBarComponent/>
      
      {/* Categories at top */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveCategory(item)}
              style={[
                styles.categoryButton,
                activeCategory === item && styles.activeCategoryButton,
              ]}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === item && styles.activeCategoryText,
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
        />
      </View>

      {/* Products Reel */}
      <FlatList
        data={PRODUCTS}
        renderItem={({ item }) => <ProductCarousel item={item} />}
        keyExtractor={item => item.id}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        bounces={false}
        getItemLayout={getItemLayout}
        snapToAlignment="start"
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  categoriesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    top: 30,
    zIndex: 1,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeCategoryButton: {
    backgroundColor: '#FF4785',
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#fff',
  },
  reelContainer: {
    width,
    height,
    backgroundColor: '#000',
  },
  reelImage: {
    width,
    height: '100%',
    backgroundColor: '#222',
  },
  dotContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 75,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 6,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  productInfo: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 90,
  },
  productHeader: {
    marginBottom: 8,
  },
  productTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  productPrice: {
    color: '#FF4785',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  descriptionContainer: {
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 8,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  moreButton: {
    color: '#FF4785',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 10,
  },
  sellerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF4785',
  },
  sellerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  location: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4785',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});