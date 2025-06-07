import React from 'react';
import { Link } from 'react-router-dom';
import { MarketItem } from '../types';
import { User, TagIcon, Clock } from 'lucide-react';
import { getRelativeTime } from '../utils/timeUtils';

interface NFTCardProps {
  nft: MarketItem;
  actionButton?: React.ReactNode;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, actionButton }) => {
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
          <div className="absolute inset-0 bg-gradient-to-t from-dark-400 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
        </Link>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>            <Link to={`/nft/${nft.tokenId}`}>
              <h3 className="text-lg font-semibold mb-1 hover:text-primary-400 transition-colors">{nft.name}</h3>
            </Link>
            <p className="text-gray-400 text-sm line-clamp-2 h-10 mb-2">{nft.description}</p>
            
            {/* Categories */}
            {nft.categories && nft.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
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
          </div>
        </div>        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-sm text-gray-400">
            <User className="w-4 h-4 mr-1" />
            <Link 
              to={`/profile/${nft.seller}`}
              className="truncate max-w-[140px] hover:text-white transition-colors"
              title="Seller"
              onClick={(e) => e.stopPropagation()}
            >
              {nft.seller.substring(0, 6)}...{nft.seller.substring(nft.seller.length - 4)}
            </Link>
          </div>
          <div className="flex items-center">
            <TagIcon className="w-4 h-4 mr-1 text-accent-400" />
            <span className="font-medium text-white">{nft.price} ETH</span>
          </div>
        </div>
        
        {/* Ownership info */}
        <div className="mt-3 flex flex-wrap gap-2">
          {/* Creator info if available */}
          {nft.creator && (
            <Link 
              to={`/profile/${nft.creator}`}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-full px-2 py-1 text-xs text-gray-300 flex items-center hover:bg-white/20 transition-colors"
            >
              <User className="w-3 h-3 mr-1 text-primary-400" />
              <span title="Creator">Creator: {nft.creator.substring(0, 4)}...{nft.creator.substring(nft.creator.length - 4)}</span>
            </Link>
          )}
          
          {/* Current owner if different from seller */}
          {nft.owner && nft.owner !== nft.seller && (
            <Link 
              to={`/profile/${nft.owner}`}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-full px-2 py-1 text-xs text-gray-300 flex items-center hover:bg-white/20 transition-colors"
            >
              <User className="w-3 h-3 mr-1 text-accent-400" />
              <span title="Owner">Owner: {nft.owner.substring(0, 4)}...{nft.owner.substring(nft.owner.length - 4)}</span>
            </Link>
          )}
          
          {/* Listing time */}
          <div className="glass rounded-full px-2 py-1 text-xs text-gray-300 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>Listed {getRelativeTime(nft.listingTime)}</span>
          </div>
        </div>        {/* Social metrics */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <div className="text-xs text-gray-500">
            #{nft.tokenId}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          {actionButton}
        </div>
      </div>
    </div>
  );
};

export default NFTCard;