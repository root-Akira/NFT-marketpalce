import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './Web3Context';
import { NFT_CONTRACT_ADDRESS, MARKETPLACE_CONTRACT_ADDRESS } from '../config/contracts';
import NFT_ABI from '../contracts/NFT_ABI';
import MARKETPLACE_ABI from '../contracts/MARKETPLACE_ABI';
import { NFTItem, MarketItem, NFTCategory } from '../types';
import { uploadToIPFS } from '../services/ipfsService';
import toast from 'react-hot-toast';

interface NFTContextType {
  nfts: MarketItem[];
  myNfts: NFTItem[];
  myListedNfts: MarketItem[];
  isLoading: boolean;
  createNFT: (name: string, description: string, price: string, categories: NFTCategory[], file: File) => Promise<boolean>;
  fetchNFTs: () => Promise<void>;
  fetchMyNFTs: () => Promise<void>;
  fetchMyListedNFTs: () => Promise<void>;
  buyNFT: (nft: MarketItem) => Promise<boolean>;
  listNFT: (tokenId: number, price: string) => Promise<boolean>;
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
  const createNFT = async (name: string, description: string, price: string, categories: NFTCategory[], file: File): Promise<boolean> => {
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
      }      // Create metadata
      const data = {
        name,
        description,
        image: imageUrl,
        categories: categories, // Store multiple categories
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

      // List NFT on marketplace only if price is provided
      if (price) {
        try {
          const priceInWei = ethers.utils.parseUnits(price, 'ether');
          console.log('Listing price (wei):', priceInWei.toString());
          
          // Approve marketplace to transfer NFT
          console.log('Approving marketplace contract...');
          toast.loading('Approving marketplace... Please wait', { id: 'approve' });
          
          const approveTx = await nftContract.approve(MARKETPLACE_CONTRACT_ADDRESS, tokenId, {
            gasLimit: 100000 // Moderate gas limit for approval
          });
          await approveTx.wait();
          toast.success('Marketplace approved!', { id: 'approve' });
          
          // List NFT
          console.log('Creating market item...');
          toast.loading('Listing NFT... Please wait', { id: 'list' });
          
          const marketplaceContract = getSignedMarketplaceContract();
          
          // Get the listing price
          const listingPrice = await marketplaceContract.getListingPrice();
          console.log('Listing fee:', ethers.utils.formatEther(listingPrice), 'ETH');
          
          const listTx = await marketplaceContract.createMarketplaceItem(
            NFT_CONTRACT_ADDRESS,
            tokenId,
            priceInWei,
            {
              value: listingPrice, // Send the listing fee with the transaction
              gasLimit: 250000 // Higher gas limit for listing
            }
          );
            await listTx.wait();
          toast.success('NFT listed successfully!', { id: 'list' });
          console.log('Market item created successfully');

          // Refresh NFTs after listing
          await fetchNFTs();
          await fetchMyListedNFTs();
        } catch (listingError: any) {
          console.error('Error listing NFT:', listingError);
          toast.error('Failed to list NFT: ' + (listingError.message || 'Unknown error'));
          // Even if listing fails, NFT is still minted
          return true;
        }
      } else {
        // If not listing, just refresh my NFTs
        await fetchMyNFTs();
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
      if (!provider) {
        console.error('No provider available');
        toast.error('Please connect your wallet first');
        return;
      }

      setIsLoading(true);
      const marketplaceContract = getMarketplaceContract();
      const nftContract = getNFTContract();
      
      console.log('Connected to marketplace contract:', MARKETPLACE_CONTRACT_ADDRESS);
      console.log('Connected to NFT contract:', NFT_CONTRACT_ADDRESS);
      
      // Get all market items with explicit gas limit and error handling
      console.log('Fetching market items...');
      let data;
      try {
        data = await marketplaceContract.fetchMarketplaceItems({ gasLimit: 500000 });
        console.log('Raw market items:', data, 'Length:', data?.length || 0);
      } catch (error: any) {
        console.error('Error fetching marketplace items:', error);
        if (error.message.includes('execution reverted')) {
          toast.error('Contract execution failed. Please check your network connection and try again.');
        } else {
          toast.error('Failed to fetch marketplace items: ' + (error.message || 'Unknown error'));
        }
        setNfts([]);
        setIsLoading(false);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('No items available in the marketplace');
        setNfts([]);
        setIsLoading(false);
        return;
      }

      // Process each item
      const items: MarketItem[] = await Promise.all(
        data.map(async (item: any) => {
          try {
            const tokenId = item.tokenId.toNumber();
            console.log('Processing market item:', {
              tokenId,
              itemId: item.itemId.toNumber(),
              seller: item.seller,
              sold: item.sold
            });            let tokenUri;
            try {
              tokenUri = await nftContract.tokenURI(tokenId);
              console.log('Token URI for', tokenId, ':', tokenUri);
              
              const response = await fetch(tokenUri);
              if (!response.ok) throw new Error('Failed to fetch metadata');
              const meta = await response.json();
              console.log('Metadata for', tokenId, ':', meta);
              
              // Get transfer events to find the creator (first owner)
              const filter = nftContract.filters.Transfer(null, null, tokenId);
              const events = await nftContract.queryFilter(filter);
              
              // The first Transfer event is the minting event (from zero address to creator)
              const mintEvent = events[0];
              const creator = mintEvent.args?.to;
              
              // Current owner is either the marketplace contract (if listed) or the actual owner
              let currentOwner = item.owner;
              if (currentOwner === MARKETPLACE_CONTRACT_ADDRESS) {
                currentOwner = item.seller; // If owned by marketplace, seller is the actual owner
              }              return {
                itemId: item.itemId.toNumber(),
                tokenId: tokenId,
                seller: item.seller,
                owner: currentOwner,
                creator: creator,
                price: ethers.utils.formatEther(item.price),
                image: meta.image,
                name: meta.name,
                description: meta.description,
                categories: meta.categories || [], // Extract categories from metadata
                sold: item.sold,
                // Generate a realistic varied listing time based on itemId
                // This creates a distribution of listing times from very recent to a month ago
                listingTime: (() => {
                  const now = Date.now();
                  const itemId = item.itemId.toNumber();
                  
                  // Use the hash of the itemId and tokenId to create some variability
                  const hash = (itemId * 137 + tokenId * 149) % 100;
                  
                  if (hash < 10) {
                    // 10% very recent (last hour)
                    return now - (1000 * 60 * (hash + 1));
                  } else if (hash < 30) {
                    // 20% today (1-24 hours ago)
                    return now - (1000 * 60 * 60 * (1 + hash % 24));
                  } else if (hash < 60) {
                    // 30% this week (1-7 days ago)
                    return now - (1000 * 60 * 60 * 24 * (1 + hash % 7));
                  } else if (hash < 90) {
                    // 30% this month (1-4 weeks ago)
                    return now - (1000 * 60 * 60 * 24 * 7 * (1 + hash % 4));
                  } else {
                    // 10% older (1+ month ago)
                    return now - (1000 * 60 * 60 * 24 * 30 * (1 + hash % 3));
                  }
                })()
              };
            } catch (error) {
              console.error('Error fetching token data:', error);
              return null;
            }
          } catch (error) {
            console.error('Error processing market item:', error);
            return null;
          }
        })
      );

      // Filter out null items and sort
      const validItems = items
        .filter((item): item is MarketItem => {
          if (!item) return false;
          if (item.sold) return false;
          if (item.seller === ethers.constants.AddressZero) return false;
          return true; // Show all valid items, including user's own listings
        })
        .sort((a, b) => b.itemId - a.itemId);

      console.log('Final processed items:', validItems.length);
      setNfts(validItems);
      
      if (validItems.length > 0) {
        toast.success(`Found ${validItems.length} items in the marketplace`);
      } else {
        toast('No items available in the marketplace');
      }

    } catch (error: any) {
      console.error('Error fetching NFTs:', error);
      toast.error('Failed to load marketplace items: ' + (error.message || 'Unknown error'));
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
      
      // Get all Transfer events to this address
      const filter = nftContract.filters.Transfer(null, account);
      const events = await nftContract.queryFilter(filter);
      console.log('Transfer events to account:', events);
      
      // Get all market items to check listing status
      const marketItems = await marketplaceContract.fetchMarketplaceItems({ gasLimit: 500000 });
      const listedTokenIds = new Set(
        marketItems
          .filter((item: any) => !item.sold) // Only consider unsold items as listed
          .map((item: any) => item.tokenId.toNumber())
      );
      console.log('Listed token IDs:', Array.from(listedTokenIds));
      
      const processedTokens = new Set();
      const items: NFTItem[] = [];
      
      for (const event of events) {
        try {
          const tokenId = event.args?.tokenId.toNumber();
          
          // Skip if we've already processed this token
          if (processedTokens.has(tokenId)) continue;
          
          console.log('Checking token:', tokenId);
          
          // Skip if token is listed in marketplace
          if (listedTokenIds.has(tokenId)) {
            console.log('Skipping listed token:', tokenId);
            continue;
          }

          // Verify current owner
          try {
            const currentOwner = await nftContract.ownerOf(tokenId, { gasLimit: 100000 });
            if (currentOwner.toLowerCase() !== account.toLowerCase()) {
              console.log('Token no longer owned by user:', tokenId);
              continue;
            }
            
            processedTokens.add(tokenId);
            
            let tokenUri;
            try {
              tokenUri = await nftContract.tokenURI(tokenId, { gasLimit: 100000 });
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
              }              items.push({
                tokenId: tokenId,
                owner: account,
                image: meta.image,
                name: meta.name,
                description: meta.description,
                categories: meta.categories || [], // Extract categories from metadata
                isListed: listedTokenIds.has(tokenId)
              });
            } catch (error) {
              console.error('Error fetching token URI:', error);
            }
          } catch (error) {
            console.error('Error checking token owner:', error);
          }
        } catch (error) {
          console.error('Error processing event:', error);
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
      
      // Log the contract addresses
      console.log('Marketplace contract:', MARKETPLACE_CONTRACT_ADDRESS);
      console.log('NFT contract:', NFT_CONTRACT_ADDRESS);
      
      console.log('Fetching created items...');
      const items = await marketplaceContract.fetchItemsCreated({ gasLimit: 500000 });
      console.log('Raw listed items:', JSON.stringify(items, null, 2));
      
      if (!items || items.length === 0) {
        console.log('No items found for the user');
        setMyListedNfts([]);
        setIsLoading(false);
        return;
      }

      const processedItems: MarketItem[] = await Promise.all(
        items
          .filter((item: any) => {
            const isSeller = item.seller.toLowerCase() === account.toLowerCase();
            console.log('Checking item:', {
              itemId: item.itemId.toNumber(),
              tokenId: item.tokenId.toNumber(),
              seller: item.seller,
              isSeller,
              currentAccount: account
            });
            return isSeller;
          })
          .map(async (item: any) => {
            try {
              const tokenId = item.tokenId.toNumber();
              console.log('Processing listed item:', tokenId);
              
              let tokenUri;
              try {
                tokenUri = await nftContract.tokenURI(tokenId, { gasLimit: 100000 });
                console.log('Token URI:', tokenUri);
                
                let meta;                try {
                  const response = await fetch(tokenUri);
                  if (!response.ok) throw new Error('Failed to fetch metadata');
                  meta = await response.json();
                  console.log('Metadata for token', tokenId, ':', meta);
                } catch (error) {
                  console.error('Error fetching metadata:', error);
                  meta = {
                    name: `NFT #${tokenId}`,
                    description: 'Metadata unavailable',
                    image: 'https://via.placeholder.com/400x400?text=NFT'
                  };
                }
                
                // Get transfer events to find the creator (first owner)
                const filter = nftContract.filters.Transfer(null, null, tokenId);
                const events = await nftContract.queryFilter(filter);
                
                // The first Transfer event is the minting event (from zero address to creator)
                const mintEvent = events[0];
                const creator = mintEvent.args?.to;
                
                // Current owner is either the marketplace contract (if listed) or the actual owner
                let currentOwner = item.owner;
                if (currentOwner === MARKETPLACE_CONTRACT_ADDRESS) {
                  currentOwner = item.seller; // If owned by marketplace, seller is the actual owner
                }
                  const processedItem = {
                  itemId: item.itemId.toNumber(),
                  tokenId: tokenId,
                  seller: item.seller,
                  owner: currentOwner,
                  creator: creator,
                  price: ethers.utils.formatEther(item.price),
                  image: meta.image,
                  name: meta.name,
                  description: meta.description,
                  categories: meta.categories || [], // Extract categories from metadata
                  sold: item.sold,
                  // Generate a realistic varied listing time based on itemId
                  // This creates a distribution of listing times from very recent to a month ago
                  listingTime: (() => {
                    const now = Date.now();
                    const itemId = item.itemId.toNumber();
                    
                    // Use the hash of the itemId and tokenId to create some variability
                    const hash = (itemId * 137 + tokenId * 149) % 100;
                    
                    if (hash < 10) {
                      // 10% very recent (last hour)
                      return now - (1000 * 60 * (hash + 1));
                    } else if (hash < 30) {
                      // 20% today (1-24 hours ago)
                      return now - (1000 * 60 * 60 * (1 + hash % 24));
                    } else if (hash < 60) {
                      // 30% this week (1-7 days ago)
                      return now - (1000 * 60 * 60 * 24 * (1 + hash % 7));
                    } else if (hash < 90) {
                      // 30% this month (1-4 weeks ago)
                      return now - (1000 * 60 * 60 * 24 * 7 * (1 + hash % 4));
                    } else {
                      // 10% older (1+ month ago)
                      return now - (1000 * 60 * 60 * 24 * 30 * (1 + hash % 3));
                    }
                  })()
                };
                console.log('Processed item:', processedItem);
                return processedItem;
              } catch (error) {
                console.error('Error fetching token URI:', error);
                return null;
              }
            } catch (error) {
              console.error('Error processing listed item:', error);
              return null;
            }
          })
      );
      
      // Filter out null items and sort by sold status
      const validItems = processedItems
        .filter((item): item is MarketItem => item !== null)
        .sort((a, b) => {
          // Sort by sold status (unsold first) and then by itemId (newer first)
          if (a.sold === b.sold) {
            return b.itemId - a.itemId;
          }
          return a.sold ? 1 : -1;
        });

      console.log('Final processed listed items:', validItems);
      setMyListedNfts(validItems);
      
      const activeListings = validItems.filter(item => !item.sold);
      if (activeListings.length > 0) {
        toast.success(`Found ${activeListings.length} active listings`);
      } else {
        toast('No active listings found');
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
      const tx = await marketplaceContract.createMarketplaceSale(
        NFT_CONTRACT_ADDRESS,
        nft.itemId,
        { 
          value: price,
          gasLimit: 500000 // Higher gas limit for purchase transaction
        }
      );        await tx.wait();
      
      // Get previous owner for notification
      const previousOwner = nft.seller;
      
      // Show detailed success message
      toast.success(
        `NFT "${nft.name}" purchased successfully! Ownership transferred from ${previousOwner.substring(0, 6)}...${previousOwner.substring(previousOwner.length - 4)} to you.`
      );
      
      // Refresh NFTs to update ownership information
      await fetchNFTs();
      await fetchMyNFTs();
      await fetchMyListedNFTs();
      
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
      const approveTx = await nftContract.approve(MARKETPLACE_CONTRACT_ADDRESS, tokenId, {
        gasLimit: 100000 // Moderate gas limit for approval
      });
      await approveTx.wait();
      
      // Get the listing price
      const listingPrice = await marketplaceContract.getListingPrice();
      console.log('Listing fee:', ethers.utils.formatEther(listingPrice), 'ETH');

      // List NFT
      const priceInWei = ethers.utils.parseUnits(price, 'ether');
      const tx = await marketplaceContract.createMarketplaceItem(
        NFT_CONTRACT_ADDRESS,
        tokenId,
        priceInWei,
        {
          value: listingPrice, // Send the listing fee with the transaction
          gasLimit: 250000 // Higher gas limit for listing
        }
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

  // Setup event listeners for NFT transfers
  useEffect(() => {
    if (!provider || !account) return;
    
    const nftContract = getNFTContract();
    
    // Listen for Transfer events involving the current user
    const filterTo = nftContract.filters.Transfer(null, account);
    const filterFrom = nftContract.filters.Transfer(account, null);
      const handleTransfer = async (from: string, to: string, tokenId: ethers.BigNumber) => {
      console.log(`NFT Transfer detected: Token ${tokenId} from ${from} to ${to}`);
      
      try {
        // Get NFT details if possible
        const nftContract = getNFTContract();
        let nftName = `#${tokenId.toString()}`;
        
        try {
          const tokenUri = await nftContract.tokenURI(tokenId);
          const response = await fetch(tokenUri);
          if (response.ok) {
            const metadata = await response.json();
            if (metadata.name) {
              nftName = metadata.name;
            }
          }
        } catch (error) {
          console.error('Error fetching NFT metadata during transfer event:', error);
        }
        
        // Refresh NFT data when a transfer happens
        await fetchNFTs();
        await fetchMyNFTs();
        await fetchMyListedNFTs();
          
        // Show detailed notification based on the transfer direction
        if (to.toLowerCase() === account.toLowerCase()) {
          // Current user received an NFT
          toast.success(
            <div>
              <p>You received NFT <strong>{nftName}</strong>!</p>
              <p className="text-xs">From: {from.substring(0, 6)}...{from.substring(from.length - 4)}</p>
            </div>
          );
        } else if (from.toLowerCase() === account.toLowerCase()) {
          // Current user sent an NFT
          toast(
            <div>
              <p>You sent NFT <strong>{nftName}</strong></p>
              <p className="text-xs">To: {to.substring(0, 6)}...{to.substring(to.length - 4)}</p>
            </div>
          );
        }
      } catch (error) {
        console.error('Error handling transfer event:', error);
      }
    };
    
    // Add event listeners
    nftContract.on(filterTo, handleTransfer);
    nftContract.on(filterFrom, handleTransfer);
    
    // Cleanup function
    return () => {
      nftContract.removeListener(filterTo, handleTransfer);
      nftContract.removeListener(filterFrom, handleTransfer);
    };
  }, [account, provider]);
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
  };

  return <NFTContext.Provider value={value}>{children}</NFTContext.Provider>;
};