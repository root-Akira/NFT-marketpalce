import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNFT } from '../context/NFTContext';
import { useWeb3 } from '../context/Web3Context';
import { User, Tag, Clock, ChevronLeft, Loader, ExternalLink } from 'lucide-react';

const NFTDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { nfts, isLoading, buyNFT } = useNFT();
  const { account, connectWallet } = useWeb3();
  const [nft, setNft] = useState<any>(null);

  useEffect(() => {
    const fetchNFT = async () => {
      // Find the NFT with the matching tokenId
      const foundNft = nfts.find((n) => n.tokenId === Number(id));
      setNft(foundNft);
    };

    if (nfts.length > 0 && id) {
      fetchNFT();
    }
  }, [nfts, id]);

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
        
        <div className="glass rounded-xl p-6">
          <h1 className="text-3xl font-bold mb-4">{nft.name}</h1>
          
          <div className="flex items-center mb-6">
            <div className="glass rounded-full px-3 py-1 flex items-center mr-4">
              <Tag className="w-4 h-4 mr-2 text-accent-400" />
              <span className="font-medium">{nft.price} ETH</span>
            </div>
            
            <div className="glass rounded-full px-3 py-1 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-gray-300">Listed recently</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-300">{nft.description}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Creator</p>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-primary-400" />
                  <span className="truncate">
                    {nft.seller.substring(0, 6)}...{nft.seller.substring(nft.seller.length - 4)}
                  </span>
                </div>
              </div>
              
              <div className="glass rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Token ID</p>
                <div className="flex items-center">
                  <span className="truncate">{nft.tokenId}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-dark-200 pt-6 mt-6">
            {!account ? (
              <button
                onClick={connectWallet}
                className="btn btn-primary w-full py-3 text-lg"
              >
                Connect Wallet to Purchase
              </button>
            ) : account.toLowerCase() === nft.seller.toLowerCase() ? (
              <div className="glass rounded-lg p-4 text-center">
                <p className="text-gray-300 mb-2">This is your NFT listing</p>
                <Link to="/my-listings" className="btn btn-secondary">
                  Manage Your Listings
                </Link>
              </div>
            ) : (
              <button
                onClick={() => buyNFT(nft)}
                className="btn btn-primary w-full py-3 text-lg"
              >
                Buy for {nft.price} ETH
              </button>
            )}
            
            <div className="mt-4 flex items-center justify-center">
              <a
                href={`https://etherscan.io/token/${nft.contract}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 flex items-center"
              >
                View on Etherscan <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetails;