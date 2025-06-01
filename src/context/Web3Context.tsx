import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { EXPECTED_CHAIN_ID } from '../config/contracts';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3ContextType {
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  balance: string;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  chainId: null,
  balance: '0',
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const switchNetwork = async () => {
    try {
      // Request network switch to Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}`,
                chainName: 'Sepolia',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      return false;
    }
  };

  const updateAccount = useCallback(async (newProvider: ethers.providers.Web3Provider, newAccount: string) => {
    try {
      console.log('Updating account...', newAccount);
      const newSigner = newProvider.getSigner();
      const network = await newProvider.getNetwork();
      console.log('Connected network:', {
        name: network.name,
        chainId: network.chainId,
        ensAddress: network.ensAddress,
      });
      
      // Check if connected to the correct network
      if (network.chainId !== EXPECTED_CHAIN_ID) {
        console.log(`Wrong network. Expected ${EXPECTED_CHAIN_ID} (Sepolia), got ${network.chainId}`);
        toast.loading('Switching to Sepolia network...', { id: 'network-switch' });
        
        const switched = await switchNetwork();
        if (!switched) {
          toast.error('Please manually switch to Sepolia network', { id: 'network-switch' });
          return false;
        }
        
        toast.success('Successfully connected to Sepolia!', { id: 'network-switch' });
        // Refresh the provider after network switch
        const updatedNetwork = await newProvider.getNetwork();
        if (updatedNetwork.chainId !== EXPECTED_CHAIN_ID) {
          return false;
        }
      }

      // Get and log balance
      const balance = await newProvider.getBalance(newAccount);
      console.log('Account balance:', ethers.utils.formatEther(balance), 'ETH');
      
      setAccount(newAccount);
      setProvider(newProvider);
      setSigner(newSigner);
      setChainId(network.chainId);
      setBalance(ethers.utils.formatEther(balance));
      return true;
    } catch (error) {
      console.error('Error updating account:', error);
      return false;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      if (typeof window.ethereum === 'undefined' || !window.ethereum.isMetaMask) {
        toast.error('Please install MetaMask to use this application');
        return;
      }

      // Check if already connected
      if (provider && account) {
        const network = await provider.getNetwork();
        if (network.chainId !== EXPECTED_CHAIN_ID) {
          const switched = await switchNetwork();
          if (!switched) {
            toast.error('Please switch to Sepolia network');
            return;
          }
        }
        return;
      }

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      
      try {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        const account = accounts[0];
        if (!account) {
          throw new Error('No account found');
        }

        const success = await updateAccount(web3Provider, account);
        if (!success) {
          return;
        }
        
        // Set up listeners
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length === 0) {
            disconnectWallet();
          } else {
            setAccount(newAccounts[0]);
            if (web3Provider) {
              updateAccount(web3Provider, newAccounts[0]);
            }
          }
        });
        
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });

        window.ethereum.on('disconnect', () => {
          disconnectWallet();
        });
        
        localStorage.setItem('walletConnected', 'true');
        toast.success('Wallet connected successfully!');
      } catch (error) {
        console.error('User rejected the connection request');
        toast.error('Connection request was rejected');
        throw new Error('User rejected the connection request');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, updateAccount, provider, account]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance('0');
    localStorage.removeItem('walletConnected');
    toast.success('Wallet disconnected');
  }, []);

  const value = {
    account,
    provider,
    signer,
    chainId,
    balance,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};