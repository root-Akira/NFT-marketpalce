export interface NFTItem {
  tokenId: number;
  owner: string;
  image: string;
  name: string;
  description: string;
  isListed?: boolean;
}

export interface MarketItem extends NFTItem {
  itemId: number;
  seller: string;
  price: string;
  sold: boolean;
  listingTime?: number; // Unix timestamp in milliseconds
  creator?: string; // Original creator/minter of the NFT
}