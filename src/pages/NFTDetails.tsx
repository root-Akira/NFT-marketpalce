import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNFT } from '../context/NFTContext';
import { useWeb3 } from '../context/Web3Context';
import { useUser } from '../context/UserContext';
import { User, Tag, Clock, ChevronLeft, Loader, Copy, Check } from 'lucide-react';
import { getRelativeTime } from '../utils/timeUtils';
import toast from 'react-hot-toast';

const NFTDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { nfts, isLoading, buyNFT } = useNFT();
  const { account, connectWallet } = useWeb3();
  const { getUserProfile } = useUser();
  const [nft, setNft] = useState<any>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);  // Function to copy address to clipboard
  const copyToClipboard = (address: string, type: string) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopiedAddress(address);
        toast.success(`${type} address copied to clipboard`);
        setTimeout(() => setCopiedAddress(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy address: ', err);
        toast.error('Failed to copy address');
      });
  };
  useEffect(() => {
    const fetchNFT = async () => {
      // Find the NFT with the matching tokenId
      const foundNft = nfts.find((n) => n.tokenId === Number(id));
      setNft(foundNft);
      
      // Load creator profile if NFT found
      if (foundNft && foundNft.creator) {
        const profile = await getUserProfile(foundNft.creator);
        setCreatorProfile(profile);
      }
    };

    if (nfts.length > 0 && id) {
      fetchNFT();
    }
  }, [nfts, id, getUserProfile]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">NFT Not Found</h3>
        <p className="text-gray-400 mb-6">
          The NFT you're looking for doesn't exist or is not available.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Marketplace
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-xl overflow-hidden">
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full object-contain max-h-[600px]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=NFT+Image';
            }}
          />
        </div>
          <div className="glass rounded-xl p-6">          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{nft.name}</h1>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="glass rounded-full px-3 py-1 flex items-center mr-4">
              <Tag className="w-4 h-4 mr-2 text-accent-400" />
              <span className="font-medium">{nft.price} ETH</span>
            </div>
            
            <div className="glass rounded-full px-3 py-1 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-gray-300">Listed {getRelativeTime(nft.listingTime)}</span>
            </div>
          </div>          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-300">{nft.description}</p>
          </div>

          {/* Categories Section */}
          {nft.categories && nft.categories.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {nft.categories.map((category: string, index: number) => (
                  <span
                    key={index}
                    className="bg-primary-500/20 text-primary-300 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}          {/* Creator Section */}
          {creatorProfile && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Creator</h2>
              <div className="glass rounded-lg p-4">
                <div className="flex items-center">
                  <Link 
                    to={`/profile/${nft.creator}`}
                    className="flex items-center space-x-3 hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
                  >
                    <img
                      src={creatorProfile.avatar || 'https://via.placeholder.com/40x40?text=?'}
                      alt={creatorProfile.username || 'Creator'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{creatorProfile.username || 'Unnamed Creator'}</p>
                      <p className="text-sm text-gray-400">
                        {nft.creator.substring(0, 6)}...{nft.creator.substring(nft.creator.length - 4)}
                      </p>
                    </div>
                  </Link>
                </div>
                
                {creatorProfile.bio && (
                  <p className="text-sm text-gray-300 mt-3 pl-2">{creatorProfile.bio}</p>
                )}
                
                <div className="flex items-center gap-4 mt-3 pl-2 text-sm text-gray-400">
                  <span>{creatorProfile.totalItems || 0} items created</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Creator</p>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-primary-400" />
                  <Link 
                    to={`/profile/${nft.creator}`}
                    className="truncate hover:text-primary-400 transition-colors"
                  >
                    {nft.creator ? `${nft.creator.substring(0, 6)}...${nft.creator.substring(nft.creator.length - 4)}` : 'Unknown'}
                  </Link>
                </div>
              </div>
              
              <div className="glass rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Current Owner</p>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-accent-400" />
                  <Link 
                    to={`/profile/${nft.owner || nft.seller}`}
                    className="truncate hover:text-accent-400 transition-colors"
                  >
                    {nft.owner ? `${nft.owner.substring(0, 6)}...${nft.owner.substring(nft.owner.length - 4)}` : 'Unknown'}
                  </Link>
                </div>
              </div>
              
              <div className="glass rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Token ID</p>
                <div className="flex items-center">
                  <span className="truncate">{nft.tokenId}</span>
                </div>
              </div>
              
              <div className="glass rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Listed By</p>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <Link 
                    to={`/profile/${nft.seller}`}
                    className="truncate hover:text-gray-300 transition-colors"
                  >
                    {nft.seller.substring(0, 6)}...{nft.seller.substring(nft.seller.length - 4)}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-dark-200 pt-6 mt-6">            {!account ? (
              <button
                onClick={connectWallet}
                className="btn btn-primary w-full py-3 text-lg"
              >
                Connect Wallet to Purchase
              </button>
            ) : account.toLowerCase() === nft.seller.toLowerCase() ? (
              <div className="glass rounded-lg p-4 text-center">
                <p className="text-gray-300 mb-2">This is your NFT listing</p>
              </div>
            ) : (
              <button
                onClick={() => buyNFT(nft)}
                className="btn btn-primary w-full py-3 text-lg"
              >
                Buy for {nft.price} ETH
              </button>
            )}
              <div className="mt-6 glass rounded-lg p-4">
              <h3 className="text-md font-semibold mb-3 flex items-center">
                <User className="w-4 h-4 mr-2 text-primary-400" />
                Ownership Information
              </h3>              <div className="space-y-3 text-sm">
                {nft.creator && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Original Creator:</span>
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/profile/${nft.creator}`}
                        className="font-medium hover:text-primary-400 transition-colors"
                      >
                        {nft.creator.substring(0, 6)}...{nft.creator.substring(nft.creator.length - 4)}
                      </Link>
                      <button 
                        onClick={() => copyToClipboard(nft.creator, 'Creator')}
                        className="hover:text-primary-400 transition-colors"
                      >
                        {copiedAddress === nft.creator ? 
                          <Check className="w-3 h-3 text-green-500" /> : 
                          <Copy className="w-3 h-3" />
                        }
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Owner:</span>
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/profile/${nft.owner || nft.seller}`}
                      className="font-medium hover:text-accent-400 transition-colors"
                    >
                      {nft.owner
                        ? `${nft.owner.substring(0, 6)}...${nft.owner.substring(nft.owner.length - 4)}`
                        : nft.seller.substring(0, 6) + '...' + nft.seller.substring(nft.seller.length - 4)}
                    </Link>
                    <button 
                      onClick={() => copyToClipboard(nft.owner || nft.seller, 'Owner')}
                      className="hover:text-accent-400 transition-colors"
                    >
                      {copiedAddress === (nft.owner || nft.seller) ? 
                        <Check className="w-3 h-3 text-green-500" /> : 
                        <Copy className="w-3 h-3" />
                      }
                    </button>
                  </div>
                </div>{nft.creator && nft.creator !== nft.owner && nft.creator !== nft.seller && (
                  <div className="text-xs text-gray-500 italic mt-2">
                    This NFT has changed ownership since its creation
                  </div>
                )}
              </div>
              
              {/* Ownership Timeline Visualization */}
              <div className="mt-4 pt-4 border-t border-dark-200">
                <h4 className="text-xs text-gray-400 mb-3">Ownership Timeline</h4>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute top-0 left-3 h-full w-0.5 bg-dark-200"></div>
                  
                  {/* Mint event */}
                  <div className="relative flex items-start mb-3 pl-8">
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary-400 flex items-center justify-center">
                      <span className="text-xs">1</span>
                    </div>                    <div>
                      <p className="text-xs font-medium">Minted</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Created by</span>
                        <Link 
                          to={`/profile/${nft.creator}`}
                          className="text-xs text-gray-400 hover:text-primary-400 transition-colors"
                        >
                          {nft.creator 
                            ? `${nft.creator.substring(0, 6)}...${nft.creator.substring(nft.creator.length - 4)}` 
                            : 'Unknown'}
                        </Link>
                        {nft.creator && (
                          <button 
                            onClick={() => copyToClipboard(nft.creator, 'Creator')}
                            className="hover:text-primary-400 transition-colors"
                          >
                            {copiedAddress === nft.creator ? 
                              <Check className="w-3 h-3 text-green-500" /> : 
                              <Copy className="w-3 h-3" />
                            }
                          </button>
                        )}
                      </div>
                    </div></div>
                  
                  {/* Transfer event (if ownership changed) */}
                  {nft.creator && nft.creator !== nft.seller && nft.creator !== nft.owner && (
                    <div className="relative flex items-start mb-3 pl-8">
                      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                        <span className="text-xs">2</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium">Ownership Transferred</p>
                        <p className="text-xs text-gray-500">Original owner transferred this NFT</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Current ownership */}
                  <div className="relative flex items-start pl-8">
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-accent-400 flex items-center justify-center">
                      <span className="text-xs">{nft.creator && nft.creator !== nft.seller && nft.creator !== nft.owner ? "3" : "2"}</span>
                    </div>                    <div>
                      <p className="text-xs font-medium">Current Owner</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Owned by</span>
                        <Link 
                          to={`/profile/${nft.owner || nft.seller}`}
                          className="text-xs text-gray-400 hover:text-primary-400 transition-colors"
                        >
                          {nft.owner 
                            ? `${nft.owner.substring(0, 6)}...${nft.owner.substring(nft.owner.length - 4)}` 
                            : nft.seller.substring(0, 6) + '...' + nft.seller.substring(nft.seller.length - 4)}
                        </Link>
                        <button 
                          onClick={() => copyToClipboard(nft.owner || nft.seller, 'Owner')}
                          className="hover:text-primary-400 transition-colors"
                        >
                          {copiedAddress === (nft.owner || nft.seller) ? 
                            <Check className="w-3 h-3 text-green-500" /> : 
                            <Copy className="w-3 h-3" />
                          }
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">Listed {getRelativeTime(nft.listingTime)}</p>
                    </div>
                  </div>
                </div>
              </div>        </div>
      </div>
      
      {/* Related NFTs Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">More from this Creator</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {nfts
            .filter(relatedNft => 
              relatedNft.creator === nft.creator && 
              relatedNft.tokenId !== nft.tokenId
            )
            .slice(0, 4)
            .map(relatedNft => (
              <Link
                key={relatedNft.tokenId}
                to={`/nft/${relatedNft.tokenId}`}
                className="glass rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={relatedNft.image}
                    alt={relatedNft.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=NFT';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                    {relatedNft.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-accent-400 font-medium">{relatedNft.price} ETH</span>
                    <span className="text-sm text-gray-400">#{relatedNft.tokenId}</span>
                  </div>
                </div>
              </Link>
            ))
          }
        </div>
        
        {nfts.filter(relatedNft => 
          relatedNft.creator === nft.creator && 
          relatedNft.tokenId !== nft.tokenId
        ).length === 0 && (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-gray-400">No other NFTs from this creator yet.</p>
          </div>
        )}
      </div>
    </div>
      </div>
    </div>
  );
};

export default NFTDetails;