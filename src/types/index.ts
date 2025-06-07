export type NFTCategory = 'Art' | 'Gaming' | 'Music' | 'Photography' | 'Collectibles' | 'Sports' | 'Utility' | 'Other';

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'boost_number' | 'boost_percentage' | 'number' | 'date';
}

export interface EnhancedNFTMetadata {
  name: string;
  description: string;
  image: string;
  categories?: NFTCategory[]; // Changed to array to support multiple categories
  collection?: string;
  attributes?: NFTAttribute[];
  external_url?: string;
  animation_url?: string;
  youtube_url?: string;
  rarity_score?: number;
}

export interface NFTItem {
  tokenId: number;
  owner: string;
  image: string;
  name: string;
  description: string;
  isListed?: boolean;
  categories?: NFTCategory[]; // Changed to array to support multiple categories
  collection?: string;
  attributes?: NFTAttribute[];
  views?: number;
  likes?: number;
  rarity_score?: number;
}

export interface MarketItem extends NFTItem {
  itemId: number;
  seller: string;
  price: string;
  sold: boolean;
  listingTime?: number; // Unix timestamp in milliseconds
  creator?: string; // Original creator/minter of the NFT
  priceHistory?: Array<{
    price: string;
    timestamp: number;
    action: 'listed' | 'sold' | 'price_changed';
  }>;
  bidHistory?: Array<{
    bidder: string;
    amount: string;
    timestamp: number;
  }>;
}

export interface AuctionData {
  nftId: number;
  seller: string;
  startingPrice: string;
  reservePrice?: string;
  currentBid: string;
  currentBidder: string;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  isActive: boolean;
  totalBids: number;
  bidHistory: Array<{
    bidder: string;
    amount: string;
    timestamp: number;
  }>;
}