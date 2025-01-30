import StatusBarComponent from '../components/StatusBarComponent';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 2 - 24;

// Default profile picture URL (similar to Instagram's default)
const DEFAULT_PROFILE_PIC = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

export default function ProfileScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    display_name: '',
    profile_pic: DEFAULT_PROFILE_PIC,
    bio: '',
    location: '',
    followers: 0,
    following: 0,
  });
  const [listings, setListings] = useState([]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserListings();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Fetch user profile data from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // If profile exists, update state
      if (profile) {
        setUserProfile({
          display_name: profile.display_name || user?.user_metadata?.display_name || 'User',
          profile_pic: profile.profile_pic || DEFAULT_PROFILE_PIC,
          bio: profile.bio || '',
          location: profile.location || '',
          followers: profile.followers_count || 0,
          following: profile.following_count || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderListingItem = ({ item }) => (
    <TouchableOpacity style={styles.listingItem}>
      <Image 
        source={{ uri: item.image_url || DEFAULT_PROFILE_PIC }} 
        style={styles.listingImage}
      />
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.listingPrice}>${item.price}</Text>
        <View style={styles.listingStats}>
          <Ionicons name="heart" size={16} color="#FF4785" />
          <Text style={styles.listingLikes}>{item.likes_count || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyListings = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>You have no listed items yet</Text>
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add-circle" size={24} color="#FF4785" />
        <Text style={styles.addButtonText}>List an Item</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF4785" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBarComponent/>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Image source={{ uri: userProfile.profile_pic }} style={styles.profilePic} />
          <Text style={styles.name}>{userProfile.display_name}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {userProfile.bio && <Text style={styles.bio}>{userProfile.bio}</Text>}
          
          {userProfile.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.location}>{userProfile.location}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Listings Section */}
        <View style={styles.listingsSection}>
          <Text style={styles.sectionTitle}>Listed Items</Text>
          {listings.length > 0 ? (
            <FlatList
              data={listings}
              renderItem={renderListingItem}
              keyExtractor={item => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.listingsGrid}
            />
          ) : (
            <EmptyListings />
          )}
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FF4785',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
  bio: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: '#FF4785',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listingsSection: {
    marginTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  listingsGrid: {
    paddingBottom: 20,
  },
  listingItem: {
    width: ITEM_WIDTH,
    marginHorizontal: 4,
    marginBottom: 16,
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: ITEM_WIDTH,
    backgroundColor: '#222',
  },
  listingInfo: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4785',
    marginTop: 4,
  },
  listingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  listingLikes: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  addButtonText: {
    color: '#FF4785',
    fontSize: 16,
    fontWeight: '600',
  }
});
