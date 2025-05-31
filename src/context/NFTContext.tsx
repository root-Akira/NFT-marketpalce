import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './Web3Context';
import { NFT_CONTRACT_ADDRESS, MARKETPLACE_CONTRACT_ADDRESS } from '../config/contracts';
import NFT_ABI from '../contracts/NFT_ABI';
import MARKETPLACE_ABI from '../contracts/MARKETPLACE_ABI';
import { NFTItem, MarketItem } from '../types';
import { uploadToIPFS } from '../services/ipfsService';
import toast from 'react-hot-toast';

interface NFTContextType {
  nfts: MarketItem[];
  myNfts: NFTItem[];
  myListedNfts: MarketItem[];
  isLoading: boolean;
  createNFT: (name: string, description: string, price: string, file: File) => Promise<boolean>;
  fetchNFTs: () => Promise<void>;
  fetchMyNFTs: () => Promise<void>;
  fetchMyListedNFTs: () => Promise<void>;
  buyNFT: (nft: MarketItem) => Promise<boolean>;
  listNFT: (tokenId: number, price: string) => Promise<boolean>;
  cancelListing: (itemId: number) => Promise<boolean>;
}

const NFTContext = createContext<NFTContextType>({
  nfts: [],
  myNfts: [],
  myListedNfts: [],
  isLoading: false,
  createNFT: async () => false,
  fetchNFTs: async () => {},
  fetchMyNFTs: async () => {},
  fetchMyListedNFTs: async () => {},
  buyNFT: async () => false,
  listNFT: async () => false,
  cancelListing: async () => false,
});

export const useNFT = () => useContext(NFTContext);

interface NFTProviderProps {
  children: ReactNode;
}

export const NFTProvider: React.FC<NFTProviderProps> = ({ children }) => {
  const { account, provider, signer } = useWeb3();
  const [nfts, setNfts] = useState<MarketItem[]>([]);
  const [myNfts, setMyNfts] = useState<NFTItem[]>([]);
  const [myListedNfts, setMyListedNfts] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get contract instances
  const getNFTContract = () => {
    if (!provider) throw new Error('Provider not available');
    return new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
  };

  const getMarketplaceContract = () => {
    if (!provider) throw new Error('Provider not available');
    return new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, MARKETPLACE_ABI, provider);
  };

  const getSignedNFTContract = () => {
    if (!signer) throw new Error('Signer not available');
    return new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
  };

  const getSignedMarketplaceContract = () => {
    if (!signer) throw new Error('Signer not available');
    return new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, MARKETPLACE_ABI, signer);
  };

  // Create and list a new NFT
  const createNFT = async (name: string, description: string, price: string, file: File): Promise<boolean> => {
    if (!account || !signer) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting NFT creation process...');
      
      // Upload image to IPFS
      const imageUrl = await uploadToIPFS(file);
      console.log('Image uploaded to IPFS:', imageUrl);
      
      if (!imageUrl) {
        toast.error('Failed to upload image to IPFS');
        return false;
      }

      // Create metadata
      const data = {
        name,
        description,
        image: imageUrl,
        attributes: [] // OpenSea compatible attributes
      };

      // Upload metadata to IPFS
      const metadataUrl = await uploadToIPFS(
        new Blob([JSON.stringify(data)], { type: 'application/json' })
      );
      console.log('Metadata uploaded to IPFS:', metadataUrl);

      if (!metadataUrl) {
        toast.error('Failed to upload metadata to IPFS');
        return false;
      }

      // Mint NFT
      const nftContract = getSignedNFTContract();
      console.log('Creating token with metadata:', metadataUrl);
      
      const mintTx = await nftContract.createToken(metadataUrl);
      console.log('Mint transaction:', mintTx.hash);
      
      toast.loading('Minting NFT... Please wait.', { id: 'mint' });
      const mintReceipt = await mintTx.wait();
      toast.success('NFT minted successfully!', { id: 'mint' });
      
      // Get tokenId from event
      const transferEvent = mintReceipt.events?.find((e: any) => e.event === 'Transfer');
      const tokenId = transferEvent?.args?.tokenId.toNumber();
      console.log('Token ID:', tokenId);

      if (!tokenId) {
        toast.error('Failed to get token ID');
        return false;
      }

      // List NFT on marketplace if price is provided
      if (price) {
        try {
          const priceInWei = ethers.utils.parseUnits(price, 'ether');
          console.log('Listing price (wei):', priceInWei.toString());
          
          // Approve marketplace to transfer NFT
          console.log('Approving marketplace contract...');
          toast.loading('Approving marketplace... Please wait', { id: 'approve' });
          
          const approveTx = await nftContract.approve(MARKETPLACE_CONTRACT_ADDRESS, tokenId, {
            gasLimit: 100000 // Explicit gas limit
          });
          await approveTx.wait();
          toast.success('Marketplace approved!', { id: 'approve' });
          
          // List NFT
          console.log('Creating market item...');
          toast.loading('Listing NFT... Please wait', { id: 'list' });
          
          const marketplaceContract = getSignedMarketplaceContract();
          const listTx = await marketplaceContract.createMarketItem(
            NFT_CONTRACT_ADDRESS,
            tokenId,
            priceInWei,
            {
              gasLimit: 250000 // Explicit gas limit
            }
          );
          
          await listTx.wait();
          toast.success('NFT listed successfully!', { id: 'list' });
          console.log('Market item created successfully');
        } catch (listingError: any) {
          console.error('Error listing NFT:', listingError);
          toast.error('Failed to list NFT: ' + (listingError.message || 'Unknown error'));
          // NFT is minted but listing failed
          return true;
        }
      }

      return true;
    } catch (error: any) {
      console.error('Error creating NFT:', error);
      toast.error(error.message || 'Failed to create NFT');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all market items
  const fetchNFTs = async () => {
    try {
      setIsLoading(true);
      const marketplaceContract = getMarketplaceContract();
      const nftContract = getNFTContract();
      
      console.log('Fetching market items...');
      const data = await marketplaceContract.fetchMarketItems({ gasLimit: 500000 });
      console.log('Raw market items:', data);
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid data returned from fetchMarketItems');
        setNfts([]);
        return;
      }
      
      const processedItems = await Promise.all(
        data.map(async (item: any) => {
          try {
            const tokenId = item.tokenId.toNumber();
            console.log('Fetching metadata for token:', tokenId);
            
            let tokenUri;
            try {
              tokenUri = await nftContract.tokenURI(tokenId, { gasLimit: 100000 });
            } catch (error) {
              console.error('Error fetching token URI:', error);
              return null;
            }
            
            let meta;
            try {
              const response = await fetch(tokenUri);
              if (!response.ok) throw new Error('Failed to fetch metadata');
              meta = await response.json();
            } catch (error) {
              console.error('Error fetching metadata:', error);
              meta = {
                name: `NFT #${tokenId}`,
                description: 'Metadata unavailable',
                image: 'https://via.placeholder.com/400x400?text=NFT'
              };
            }
            
            const marketItem: MarketItem = {
              itemId: item.itemId.toNumber(),
              tokenId: tokenId,
              seller: item.seller,
              owner: item.owner,
              price: ethers.utils.formatEther(item.price),
              image: meta.image,
              name: meta.name,
              description: meta.description,
            };
            return marketItem;
          } catch (error) {
            console.error('Error processing market item:', error);
            return null;
          }
        })
      );
      
      // Filter out null items (failed to process)
      const validItems = processedItems.filter((item): item is MarketItem => item !== null);
      console.log('Processed market items:', validItems);
      setNfts(validItems);
      
    } catch (error: any) {
      console.error('Error fetching NFTs:', error);
      toast.error('Failed to load marketplace items');
      setNfts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch NFTs owned by the user
  const fetchMyNFTs = async () => {
    if (!account) {
      console.log('No wallet connected');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching NFTs for account:', account);
      
      const nftContract = getNFTContract();
      const marketplaceContract = getMarketplaceContract();
      
      // Get token count for the current user
      console.log('Getting balance...');
      const balance = await nftContract.balanceOf(account, { gasLimit: 100000 });
      const tokenCount = balance.toNumber();
      console.log('NFT balance:', tokenCount);
      
      const items: NFTItem[] = [];
      
      for (let i = 0; i < tokenCount; i++) {
        try {
          console.log(`Fetching token ${i + 1} of ${tokenCount}`);
          // Get token ID with gas limit
          const tokenId = await nftContract.tokenOfOwnerByIndex(account, i, { 
            gasLimit: 100000 
          });
          console.log('Token ID:', tokenId.toString());
          
          // Get token URI with gas limit
          const tokenUri = await nftContract.tokenURI(tokenId, { 
            gasLimit: 100000 
          });
          console.log('Token URI:', tokenUri);
          
          let meta;
          try {
            const response = await fetch(tokenUri);
            if (!response.ok) throw new Error('Failed to fetch metadata');
            meta = await response.json();
          } catch (error) {
            console.error('Error fetching metadata:', error);
            meta = {
              name: `NFT #${tokenId}`,
              description: 'Metadata unavailable',
              image: 'https://via.placeholder.com/400x400?text=NFT'
            };
          }
          
          // Check if token is listed in marketplace
          let isListed = false;
          try {
            const marketItem = await marketplaceContract.fetchMarketItemByTokenId(tokenId, {
              gasLimit: 100000
            });
            isListed = marketItem && marketItem.seller !== ethers.constants.AddressZero;
          } catch (error) {
            console.error('Error checking listing status:', error);
          }
          
          items.push({
            tokenId: tokenId.toNumber(),
            owner: account,
            image: meta.image,
            name: meta.name,
            description: meta.description,
            isListed
          });
        } catch (error) {
          console.error(`Error processing token at index ${i}:`, error);
          continue;
        }
      }
      
      console.log('Found NFTs:', items);
      setMyNfts(items);
      
      if (items.length > 0) {
        toast.success(`Found ${items.length} NFTs`);
      } else {
        toast('No NFTs found in your wallet');
      }
      
    } catch (error: any) {
      console.error('Error fetching my NFTs:', error);
      toast.error('Failed to load your NFTs: ' + (error.message || 'Unknown error'));
      setMyNfts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch NFTs listed by the user
  const fetchMyListedNFTs = async () => {
    if (!account) {
      console.log('No wallet connected');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching listed NFTs for account:', account);
      
      const marketplaceContract = getMarketplaceContract();
      const nftContract = getNFTContract();
      
      console.log('Fetching created items...');
      const data = await marketplaceContract.fetchItemsCreated({ gasLimit: 500000 });
      console.log('Raw listed items:', data);
      
      const items: MarketItem[] = await Promise.all(
        data.map(async (item: any) => {
          try {
            const tokenId = item.tokenId.toNumber();
            console.log('Processing token:', tokenId);
            
            let tokenUri;
            try {
              tokenUri = await nftContract.tokenURI(tokenId, { gasLimit: 100000 });
            } catch (error) {
              console.error('Error fetching token URI:', error);
              throw error;
            }
            
            let meta;
            try {
              const response = await fetch(tokenUri);
              if (!response.ok) throw new Error('Failed to fetch metadata');
              meta = await response.json();
            } catch (error) {
              console.error('Error fetching metadata:', error);
              meta = {
                name: `NFT #${tokenId}`,
                description: 'Metadata unavailable',
                image: 'https://via.placeholder.com/400x400?text=NFT'
              };
            }
            
            return {
              itemId: item.itemId.toNumber(),
              tokenId: tokenId,
              seller: item.seller,
              owner: item.owner,
              price: ethers.utils.formatEther(item.price),
              image: meta.image,
              name: meta.name,
              description: meta.description
            };
          } catch (error) {
            console.error('Error processing listed item:', error);
            return null;
          }
        })
      );
      
      // Filter out null items
      const validItems = items.filter((item): item is MarketItem => item !== null);
      console.log('Processed listed items:', validItems);
      setMyListedNfts(validItems);
      
      if (validItems.length > 0) {
        toast.success(`Found ${validItems.length} listed NFTs`);
      } else {
        toast('No listed NFTs found');
      }
      
    } catch (error: any) {
      console.error('Error fetching listed NFTs:', error);
      toast.error('Failed to load your listed NFTs: ' + (error.message || 'Unknown error'));
      setMyListedNfts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Buy an NFT
  const buyNFT = async (nft: MarketItem): Promise<boolean> => {
    if (!account || !signer) {
      toast.error('Please connect your wallet first');
      return false;
    }
    
    try {
      setIsLoading(true);
      const marketplaceContract = getSignedMarketplaceContract();
      
      const price = ethers.utils.parseUnits(nft.price, 'ether');
      const tx = await marketplaceContract.createMarketSale(
        NFT_CONTRACT_ADDRESS,
        nft.itemId,
        { value: price }
      );
      
      await tx.wait();
      toast.success('NFT purchased successfully!');
      
      // Refresh NFTs
      await fetchNFTs();
      await fetchMyNFTs();
      
      return true;
    } catch (error: any) {
      console.error('Error buying NFT:', error);
      toast.error(error.message || 'Failed to buy NFT');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // List an NFT for sale
  const listNFT = async (tokenId: number, price: string): Promise<boolean> => {
    if (!account || !signer) {
      toast.error('Please connect your wallet first');
      return false;
    }
    
    try {
      setIsLoading(true);
      const nftContract = getSignedNFTContract();
      const marketplaceContract = getSignedMarketplaceContract();
      
      // Approve marketplace to transfer NFT
      const approveTx = await nftContract.approve(MARKETPLACE_CONTRACT_ADDRESS, tokenId);
      await approveTx.wait();
      
      // List NFT
      const priceInWei = ethers.utils.parseUnits(price, 'ether');
      const tx = await marketplaceContract.createMarketItem(
        NFT_CONTRACT_ADDRESS,
        tokenId,
        priceInWei
      );
      
      await tx.wait();
      toast.success('NFT listed successfully!');
      
      // Refresh NFTs
      await fetchMyNFTs();
      await fetchMyListedNFTs();
      
      return true;
    } catch (error: any) {
      console.error('Error listing NFT:', error);
      toast.error(error.message || 'Failed to list NFT');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel a listing
  const cancelListing = async (itemId: number): Promise<boolean> => {
    if (!account || !signer) {
      toast.error('Please connect your wallet first');
      return false;
    }
    
    try {
      setIsLoading(true);
      const marketplaceContract = getSignedMarketplaceContract();
      
      const tx = await marketplaceContract.cancelMarketItem(NFT_CONTRACT_ADDRESS, itemId);
      await tx.wait();
      
      toast.success('Listing cancelled successfully!');
      
      // Refresh NFTs
      await fetchNFTs();
      await fetchMyListedNFTs();
      
      return true;
    } catch (error: any) {
      console.error('Error cancelling listing:', error);
      toast.error(error.message || 'Failed to cancel listing');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch NFTs when account changes
  useEffect(() => {
    if (account && provider) {
      fetchNFTs();
      fetchMyNFTs();
      fetchMyListedNFTs();
    } else {
      setNfts([]);
      setMyNfts([]);
      setMyListedNfts([]);
    }
  }, [account, provider]);

  const value = {
    nfts,
    myNfts,
    myListedNfts,
    isLoading,
    createNFT,
    fetchNFTs,
    fetchMyNFTs,
    fetchMyListedNFTs,
    buyNFT,
    listNFT,
    cancelListing,
  };

  return <NFTContext.Provider value={value}>{children}</NFTContext.Provider>;
};