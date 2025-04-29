import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import StatusBarComponent from '../components/StatusBarComponent';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const CATEGORIES = ['All', 'Fashion', 'Electronics', 'Home', 'Sports', 'Books', 'Other'];

// Media renderer component
const MediaRenderer = ({ mediaUrl, type, isVisible }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const navigation = useNavigation();

  // Handle screen focus/blur
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (videoRef.current) {
        videoRef.current.pauseAsync();
        setIsPlaying(false);
      }
    });

    return unsubscribe;
  }, [navigation]);

  // Handle visibility changes
  useEffect(() => {
    if (videoRef.current) {
      if (isVisible && isPlaying) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isVisible, isPlaying]);

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (type === 'video') {
    return (
      <TouchableOpacity 
        style={styles.videoContainer} 
        onPress={togglePlayPause}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri: mediaUrl }}
          style={styles.reelImage}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={isVisible && isPlaying}
          isMuted={false}
        />
        {!isPlaying && (
          <View style={styles.playPauseOverlay}>
            <Ionicons name="play" size={50} color="rgba(255,255,255,0.8)" />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <Image
      source={{ uri: mediaUrl }}
      style={styles.reelImage}
      resizeMode="cover"
    />
  );
};

// Separate Product Carousel Component
const ProductCarousel = ({ item, isVisible }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  const description = item.description;
  const isLongDescription = description?.length > 100;
  const displayDescription = showFullDescription ? description : description?.slice(0, 100);

  // Combine images and videos into a single media array
  const mediaItems = [
    ...(item.images || []).map(url => ({ url, type: 'image' })),
    ...(item.videos || []).map(url => ({ url, type: 'video' }))
  ];

  return (
    <View style={styles.reelContainer}>
      {/* Media Carousel */}
      <FlatList
        data={mediaItems}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentMediaIndex(newIndex);
        }}
        renderItem={({ item: media, index }) => (
          <View style={styles.imageContainer}>
            <MediaRenderer 
              mediaUrl={media.url} 
              type={media.type} 
              isVisible={isVisible && currentMediaIndex === index}
            />
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
      />

      {/* Product Info Overlay */}
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productTitle}>{item.title}</Text>
          <Text style={styles.productPrice}>${item.price}</Text>
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
              <Text style={styles.sellerName}>@{item.profiles?.display_name}</Text>
              <Text style={styles.location}>{item.category}</Text>
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
          <Text style={styles.actionText}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionButtonCircle}>
            <Ionicons name="chatbubble-outline" size={26} color="white" />
          </View>
          <Text style={styles.actionText}>0</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionButtonCircle}>
            <Ionicons name="share-social-outline" size={28} color="white" />
          </View>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Dot indicators */}
      <View style={styles.dotContainer}>
        {mediaItems.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { opacity: currentMediaIndex === index ? 1 : 0.5 }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const navigation = useNavigation();

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index);
    }
  }).current;

  const getItemLayout = useCallback((data, index) => ({
    length: height,
    offset: height * index,
    index,
  }), []);

  const fetchListings = async (category = activeCategory) => {
    try {
      let query = supabase
        .from('listings')
        .select('*, videos')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (category !== 'All') {
        query = query.eq('category', category);
      }

      const { data: listings, error: listingsError } = await query;

      if (listingsError) throw listingsError;

      // Get unique user IDs from listings
      const userIds = [...new Set(listings?.map(listing => listing.user_id) || [])];

      // Fetch profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      // Create a map of user_id to display_name
      const profileMap = new Map(
        profiles?.map(profile => [profile.id, profile.display_name]) || []
      );

      // Combine the data
      const formattedData = listings?.map(listing => ({
        ...listing,
        videos: listing.videos || [],
        profiles: {
          display_name: profileMap.get(listing.user_id) || 'Anonymous User'
        }
      }));

      setListings(formattedData || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchListings(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    fetchListings();
  }, [activeCategory]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBarComponent />
        <ActivityIndicator size="large" color="#FF4785" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBarComponent />
      
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

      <FlatList
        data={listings}
        renderItem={({ item, index }) => (
          <ProductCarousel item={item} isVisible={index === visibleIndex} />
        )}
        keyExtractor={item => item.id.toString()}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        bounces={false}
        getItemLayout={getItemLayout}
        snapToAlignment="start"
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF4785']}
            tintColor="#FF4785"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  imageContainer: {
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
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});