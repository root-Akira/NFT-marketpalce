import React from 'react';
import { Link } from 'react-router-dom';
import { MarketItem } from '../types';
import { User, TagIcon, Clock } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { getRelativeTime } from '../utils/timeUtils';

interface NFTCardProps {
  nft: MarketItem;
  actionButton?: React.ReactNode;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, actionButton }) => {
  const { account } = useWeb3();
  const isOwner = account && nft.seller.toLowerCase() === account.toLowerCase();

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
          {isOwner && (
            <div className="absolute top-2 right-2 bg-primary-400 text-white px-2 py-1 rounded-full text-xs">
              Your Listing
            </div>
          )}
        </Link>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <Link to={`/nft/${nft.tokenId}`}>
              <h3 className="text-lg font-semibold mb-1 hover:text-primary-400 transition-colors">{nft.name}</h3>
            </Link>
            <p className="text-gray-400 text-sm line-clamp-2 h-10 mb-2">{nft.description}</p>
          </div>
        </div>
          <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-sm text-gray-400">
            <User className="w-4 h-4 mr-1" />
            <span className="truncate max-w-[140px]">
              {nft.seller.substring(0, 6)}...{nft.seller.substring(nft.seller.length - 4)}
            </span>
          </div>
          <div className="flex items-center">
            <TagIcon className="w-4 h-4 mr-1 text-accent-400" />
            <span className="font-medium text-white">{nft.price} ETH</span>
          </div>
        </div>
          {/* Listing time */}
        <div className="mt-2 text-xs text-gray-400 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          <span>Listed {getRelativeTime(nft.listingTime)}</span>
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