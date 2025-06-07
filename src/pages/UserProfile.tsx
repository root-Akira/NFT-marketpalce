import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNFT } from '../context/NFTContext';
import { useWeb3 } from '../context/Web3Context';
import NFTCard from '../components/NFTCard';
import { UserProfile as UserProfileType } from '../context/UserContext';
import { MarketItem } from '../types';
import { 
  User, 
  Calendar, 
  Copy,
  Check,
  Edit3,
  Camera,
  Twitter,
  Instagram,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const { account } = useWeb3();  const { 
    getUserProfile, 
    updateProfile
  } = useUser();
  const { nfts, myNfts } = useNFT();

  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);  const [editForm, setEditForm] = useState<Partial<UserProfileType>>({});
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'owned' | 'created'>('owned');
  const [userNFTs, setUserNFTs] = useState<MarketItem[]>([]);

  const profileAddress = address || account || '';
  const isOwnProfile = profileAddress.toLowerCase() === account?.toLowerCase();

  useEffect(() => {
    if (profileAddress) {
      loadProfile();
    }
  }, [profileAddress]);
  useEffect(() => {
    // Filter NFTs for this user from multiple sources
    
    // Get marketplace listings (nfts) where user is seller/owner
    const ownedMarketNFTs = nfts.filter(nft => 
      nft.owner.toLowerCase() === profileAddress.toLowerCase()
    );
    const createdMarketNFTs = nfts.filter(nft => 
      nft.creator?.toLowerCase() === profileAddress.toLowerCase()
    );
    
    // Get user's owned NFTs that aren't listed (myNfts) - only if viewing own profile
    let ownedUnlistedNFTs: MarketItem[] = [];
    if (profileAddress.toLowerCase() === account?.toLowerCase()) {
      // Convert NFTItem[] to MarketItem[] format for consistency
      ownedUnlistedNFTs = myNfts.map(nft => ({
        ...nft,
        itemId: 0, // These aren't marketplace items
        seller: nft.owner,
        price: '0',
        sold: false,
        creator: nft.owner // For unlisted NFTs, assume owner is creator unless we have better data
      }));
    }
    
    // Combine all NFTs and deduplicate by tokenId
    const allNFTs = [...ownedMarketNFTs, ...createdMarketNFTs, ...ownedUnlistedNFTs];
    const unique = allNFTs.filter((nft, index, arr) => 
      arr.findIndex(n => n.tokenId === nft.tokenId) === index
    );
    
    setUserNFTs(unique);
  }, [nfts, myNfts, profileAddress, account]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const userProfile = await getUserProfile(profileAddress);
      setProfile(userProfile);
      if (userProfile) {
        setEditForm(userProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(profileAddress);
      setCopiedAddress(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const success = await updateProfile(editForm);
      if (success) {
        setIsEditing(false);
        await loadProfile(); // Reload profile
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(profile || {});
  };
  const getFilteredNFTs = () => {
    switch (activeTab) {
      case 'owned':
        return userNFTs.filter(nft => 
          nft.owner.toLowerCase() === profileAddress.toLowerCase()
        );
      case 'created':
        return userNFTs.filter(nft => 
          nft.creator?.toLowerCase() === profileAddress.toLowerCase()
        );
      default:
        return userNFTs;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    );
  }

  const filteredNFTs = getFilteredNFTs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User size={48} />
                  )}
                </div>
                {isOwnProfile && isEditing && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 rounded-full p-2 text-white transition-colors">
                    <Camera size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.username || ''}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        placeholder="Username"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60"
                      />
                      <textarea
                        value={editForm.bio || ''}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Bio"
                        rows={3}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={editForm.twitter || ''}
                          onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                          placeholder="Twitter username"
                          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60"
                        />
                        <input
                          type="text"
                          value={editForm.instagram || ''}
                          onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                          placeholder="Instagram username"
                          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60"
                        />
                        <input
                          type="text"
                          value={editForm.website || ''}
                          onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                          placeholder="Website URL"
                          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {profile.username || `User ${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`}
                        {profile.verified && (
                          <span className="ml-2 text-blue-400">✓</span>
                        )}
                      </h1>
                      
                      {profile.bio && (
                        <p className="text-white/80 mb-4">{profile.bio}</p>
                      )}

                      {/* Address */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-white/60 text-sm">
                          {profileAddress.slice(0, 6)}...{profileAddress.slice(-4)}
                        </span>
                        <button
                          onClick={handleCopyAddress}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          {copiedAddress ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>

                      {/* Social Links */}
                      <div className="flex gap-4 mb-4">
                        {profile.twitter && (
                          <a
                            href={`https://twitter.com/${profile.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-blue-400 transition-colors"
                          >
                            <Twitter size={20} />
                          </a>
                        )}
                        {profile.instagram && (
                          <a
                            href={`https://instagram.com/${profile.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-pink-400 transition-colors"
                          >
                            <Instagram size={20} />
                          </a>
                        )}
                        {profile.website && (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-green-400 transition-colors"
                          >
                            <Globe size={20} />
                          </a>
                        )}
                      </div>

                      {/* Joined Date */}
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Calendar size={16} />
                        <span>Joined {formatDate(profile.joinedDate)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {isOwnProfile ? (
                    isEditing ? (
                      <>
                        <button
                          onClick={handleSaveProfile}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEditProfile}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Edit3 size={16} />
                        Edit Profile
                      </button>
                    )                  ) : (
                    <div className="text-center text-gray-400">
                      <p>This is another user's profile</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{userNFTs.length}</div>
              <div className="text-white/60 text-sm">Items</div>
            </div>            <div className="text-center">
              <div className="text-2xl font-bold text-white">{profile.totalItems || 0}</div>
              <div className="text-white/60 text-sm">Created</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20">          <div className="flex border-b border-white/20">            {[              { key: 'owned', label: 'Owned', count: userNFTs.filter(nft => nft.owner.toLowerCase() === profileAddress.toLowerCase()).length },
              { key: 'created', label: 'Created', count: userNFTs.filter(nft => nft.creator?.toLowerCase() === profileAddress.toLowerCase()).length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-6 py-4 text-center transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white border-b-2 border-blue-400'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label} {tab.count !== null && `(${tab.count})`}
              </button>
            ))}
          </div>          <div className="p-6">            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">                {filteredNFTs.length === 0 ? (
                  <div className="col-span-full text-center text-white/60 py-12">
                    <User size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No {activeTab} NFTs found</p>
                  </div>
                ) : (filteredNFTs.map((nft) => (
                    <NFTCard key={nft.tokenId} nft={nft} />
                  ))
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
