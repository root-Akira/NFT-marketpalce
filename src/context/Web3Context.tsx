import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { EXPECTED_CHAIN_ID, NETWORK_NAME } from '../config/contracts';

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

  const updateAccount = useCallback(async (newProvider: ethers.providers.Web3Provider, newAccount: string) => {
    try {
      const newSigner = newProvider.getSigner();
      const network = await newProvider.getNetwork();
      
      // Check if connected to the correct network
      if (network.chainId !== EXPECTED_CHAIN_ID) {
        toast.error(`Please connect to ${NETWORK_NAME} network to use this application`);
        disconnectWallet();
        return false;
      }

      const accountBalance = await newProvider.getBalance(newAccount);
      
      setSigner(newSigner);
      setChainId(network.chainId);
      setBalance(ethers.utils.formatEther(accountBalance));
      return true;
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account information');
      return false;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      // Enhanced check for MetaMask installation and readiness
      if (typeof window.ethereum === 'undefined' || !window.ethereum.isMetaMask) {
        toast.error('Please install MetaMask to use this application', {
          duration: 5000,
        });
        return;
      }

      // Check if already connected
      if (provider && account) {
        toast.success('Wallet already connected!');
        return;
      }

      // Wait for ethereum object to be fully initialized
      await new Promise(resolve => setTimeout(resolve, 100));

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

        setAccount(account);
        setProvider(web3Provider);
        
        const success = await updateAccount(web3Provider, account);
        if (!success) {
          return;
        }
        
        // Set up listeners
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length === 0) {
            disconnectWallet();
            toast.error('Wallet disconnected');
          } else {
            setAccount(newAccounts[0]);
            if (web3Provider) {
              updateAccount(web3Provider, newAccounts[0]);
              toast.success('Account changed successfully');
            }
          }
        });
        
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });

        window.ethereum.on('disconnect', () => {
          disconnectWallet();
          toast.error('Wallet disconnected');
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