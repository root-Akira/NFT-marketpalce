import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Create from './pages/Create';
import MyNFTs from './pages/MyNFTs';
import MyListings from './pages/MyListings';
import NFTDetails from './pages/NFTDetails';
import UserProfile from './pages/UserProfile';
import { useEffect } from 'react';
import { useWeb3 } from './context/Web3Context';

function App() {
  const { connectWallet } = useWeb3();

  useEffect(() => {
    // Try to connect to wallet if previously connected
    const checkConnection = async () => {
      if (window.ethereum && localStorage.getItem('walletConnected') === 'true') {
        await connectWallet();
      }
    };
    
    checkConnection();
  }, [connectWallet]);

  return (
    <Layout>      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/my-nfts" element={<MyNFTs />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/nft/:id" element={<NFTDetails />} />
        <Route path="/profile/:address" element={<UserProfile />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Layout>
  );
}

export default App;