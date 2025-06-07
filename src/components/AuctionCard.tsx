import React from 'react';
import { Link } from 'react-router-dom';
import { AuctionData, MarketItem } from '../types';
import { Clock, Gavel, User, Tag } from 'lucide-react';

interface AuctionCardProps {
  auction: AuctionData;
  nft: MarketItem;
  onBid?: (auctionId: number, bidAmount: string) => Promise<void>;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction, nft, onBid }) => {
  const timeRemaining = auction.endTime - Date.now();
  const isExpired = timeRemaining <= 0;
  
  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return 'Expired';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleBidClick = () => {
    if (onBid) {
      // For demo purposes, just increment the current bid by 0.01 ETH
      const newBid = (parseFloat(auction.currentBid) + 0.01).toFixed(3);
      onBid(auction.nftId, newBid);
    }
  };

  return (
    <div className="card group">
      <div className="relative overflow-hidden">
        <Link to={`/nft/${nft.tokenId}`}>
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=NFT+Image';
            }}
          />
        </Link>
        
        {/* Auction Status Badge */}
        <div className="absolute top-3 left-3">
          <div className={`glass rounded-full px-3 py-1 text-xs font-medium flex items-center ${
            isExpired ? 'bg-red-500/20 text-red-300' : 'bg-accent-500/20 text-accent-300'
          }`}>
            <Gavel className="w-3 h-3 mr-1" />
            {isExpired ? 'Ended' : 'Live Auction'}
          </div>
        </div>

        {/* Time Remaining Badge */}
        <div className="absolute top-3 right-3">
          <div className={`glass rounded-full px-3 py-1 text-xs font-medium flex items-center ${
            timeRemaining < 3600000 ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
          }`}>
            <Clock className="w-3 h-3 mr-1" />
            {formatTimeRemaining(timeRemaining)}
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-dark-400 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Link to={`/nft/${nft.tokenId}`}>
              <h3 className="text-lg font-semibold mb-1 hover:text-primary-400 transition-colors">{nft.name}</h3>
            </Link>
            <p className="text-gray-400 text-sm line-clamp-2 h-10">{nft.description}</p>
          </div>
        </div>

        {/* Categories */}
        {nft.categories && nft.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {nft.categories.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full text-xs"
              >
                {category}
              </span>
            ))}
            {nft.categories.length > 2 && (
              <span className="text-gray-400 text-xs">+{nft.categories.length - 2} more</span>
            )}
          </div>
        )}

        {/* Bid Information */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Starting Price:</span>
            <span className="text-sm font-medium">{auction.startingPrice} ETH</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-1 text-accent-400" />
              <span className="text-sm text-gray-400">Current Bid:</span>
            </div>
            <span className="font-bold text-white">{auction.currentBid} ETH</span>
          </div>

          {auction.reservePrice && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Reserve:</span>
              <span className="text-sm text-yellow-400">{auction.reservePrice} ETH</span>
            </div>
          )}
        </div>

        {/* Bid Count and Seller */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <span>{auction.totalBids} bid{auction.totalBids !== 1 ? 's' : ''}</span>
          <Link 
            to={`/profile/${auction.seller}`}
            className="flex items-center hover:text-white transition-colors"
            title="Seller"
            onClick={(e) => e.stopPropagation()}
          >
            <User className="w-4 h-4 mr-1" />
            {auction.seller.substring(0, 6)}...{auction.seller.substring(auction.seller.length - 4)}
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isExpired && auction.isActive && onBid && (
            <button
              onClick={handleBidClick}
              className="btn btn-primary w-full"
            >
              Place Bid (+0.01 ETH)
            </button>
          )}
          
          {isExpired && (
            <div className="text-center py-2 text-gray-400 text-sm">
              Auction Ended
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;