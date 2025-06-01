import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useNFT } from '../context/NFTContext';
import { Upload, Image, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const Create: React.FC = () => {
  const { account, connectWallet } = useWeb3();
  const { createNFT, isLoading } = useNFT();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [wantToList, setWantToList] = useState(true); // New state for listing checkbox
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!name || !description || !file) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (wantToList && !price) {
      toast.error('Please enter a price for listing');
      return;
    }
    
    try {
      // Pass price only if user wants to list
      const success = await createNFT(name, description, wantToList ? price : '', file);
      
      if (success) {
        toast.success('NFT created successfully!');
        navigate('/my-nfts');
      }
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error('Failed to create NFT');
    }
  };

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="glass rounded-xl p-8 max-w-md w-full text-center">
          <Image className="w-16 h-16 text-primary-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            You need to connect your wallet to create and mint NFTs.
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
    <div className="max-w-4xl mx-auto">
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-dark-200">
          <h1 className="text-2xl font-bold">Create New NFT</h1>
          <p className="text-gray-400 mt-2">
            Create and mint your unique NFT to the marketplace
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="order-2 md:order-1">
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  className="input"
                  placeholder="Item name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="input resize-none"
                  placeholder="Provide a detailed description of your item"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    checked={wantToList}
                    onChange={(e) => setWantToList(e.target.checked)}
                    className="checkbox"
                  />
                  <span>List this NFT for sale</span>
                </label>
              </div>
              
              {wantToList && (
                <div className="mb-6">
                  <label htmlFor="price" className="block text-sm font-medium mb-2">
                    Price (ETH) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    step="0.001"
                    min="0"
                    className="input"
                    placeholder="Item price in ETH"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
            
            <div className="order-1 md:order-2">
              <label className="block text-sm font-medium mb-2">
                Image, Video, Audio, or 3D Model *
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center ${
                  preview ? 'border-primary-500' : 'border-dark-200 hover:border-primary-400'
                } transition-colors cursor-pointer`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-64 object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 bg-dark-400 bg-opacity-70 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white font-medium">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              className="btn btn-primary w-full py-3 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Creating NFT...
                </>
              ) : (
                'Create NFT'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Create;