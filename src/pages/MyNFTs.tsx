import React, { useState } from 'react';
import { useNFT } from '../context/NFTContext';
import { useWeb3 } from '../context/Web3Context';
import { Link } from 'react-router-dom';
import { Image, Loader, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyNFTs: React.FC = () => {
  const { myNfts, isLoading, listNFT } = useNFT();
  const { account, connectWallet } = useWeb3();
  
  const [listingNFT, setListingNFT] = useState<number | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  
  const handleListNFT = async (tokenId: number) => {
    if (!listingPrice || isNaN(Number(listingPrice)) || Number(listingPrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    const success = await listNFT(tokenId, listingPrice);
    if (success) {
      setListingNFT(null);
      setListingPrice('');
    }
  };

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="glass rounded-xl p-8 max-w-md w-full text-center">
          <Image className="w-16 h-16 text-primary-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            You need to connect your wallet to view your NFTs.
          </p>
          <button
            onClick={connectWallet}
            className="btn btn-primary w-full"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">My NFT Collection</h1>
        <Link to="/create" className="btn btn-primary flex items-center">
          <PlusCircle className="w-4 h-4 mr-2" /> Create NFT
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
      ) : myNfts.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center">
          <Image className="w-16 h-16 text-primary-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
          <p className="text-gray-400 mb-6">
            You don't own any NFTs yet. Create your first NFT or purchase one from the marketplace.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/create" className="btn btn-primary">
              Create NFT
            </Link>
            <Link to="/" className="btn btn-secondary">
              Browse Marketplace
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myNfts.map((nft) => (
            <div key={nft.tokenId} className="card">
              <div className="relative overflow-hidden">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=NFT+Image';
                  }}
                />
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">{nft.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 h-10 mb-2">{nft.description}</p>
                
                {listingNFT === nft.tokenId ? (
                  <div className="mt-4">
                    <div className="mb-2">
                      <input
                        type="number"
                        className="input mb-2"
                        placeholder="Price in ETH"
                        value={listingPrice}
                        onChange={(e) => setListingPrice(e.target.value)}
                        step="0.001"
                        min="0.001"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleListNFT(nft.tokenId)}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setListingNFT(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary w-full mt-4"
                    onClick={() => setListingNFT(nft.tokenId)}
                  >
                    List for Sale
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNFTs;