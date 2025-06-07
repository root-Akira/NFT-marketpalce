import React, { useState, useEffect } from 'react';
import { useNFT } from '../context/NFTContext';
import { useUser } from '../context/UserContext';
import { useWeb3 } from '../context/Web3Context';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Eye, 
  Heart, 
  Activity,
  BarChart3,
  PieChart,
  Users,
  Calendar,
  Star,
  Award
} from 'lucide-react';

interface AnalyticsData {
  totalVolume: number;
  totalSales: number;
  averagePrice: number;
  totalViews: number;
  totalLikes: number;
  followerGrowth: number;
  portfolioValue: number;
  topCategories: Array<{ category: string; count: number; volume: number }>;
  recentActivity: Array<{ type: string; value: number; date: number }>;
  priceHistory: Array<{ date: number; price: number }>;
}

const AnalyticsDashboard: React.FC = () => {
  const { nfts } = useNFT();
  const { userProfile } = useUser();
  const { account } = useWeb3();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateAnalytics = () => {
      if (!account || !nfts.length) return;      // Filter user's NFTs with proper null checks
      const ownedNFTs = nfts.filter(nft => 
        (nft.owner?.toLowerCase() === account.toLowerCase()) || 
        (nft.seller?.toLowerCase() === account.toLowerCase())
      );

      const createdNFTs = nfts.filter(nft => 
        nft.creator?.toLowerCase() === account.toLowerCase()
      );

      // Calculate metrics
      const totalVolume = createdNFTs.reduce((sum, nft) => sum + parseFloat(nft.price), 0);
      const totalSales = createdNFTs.length;
      const averagePrice = totalSales > 0 ? totalVolume / totalSales : 0;
      const portfolioValue = ownedNFTs.reduce((sum, nft) => sum + parseFloat(nft.price), 0);      // Mock some analytics data (in a real app, this would come from your backend)
      const totalViews = Math.floor(Math.random() * 10000) + 1000;
      const totalLikes = 0; // Removed social features
      const followerGrowth = Math.floor(Math.random() * 50) + 5;

      // Category breakdown
      const categoryMap = new Map();
      createdNFTs.forEach(nft => {
        const categories = nft.categories || ['Other'];
        categories.forEach(category => {
          if (!categoryMap.has(category)) {
            categoryMap.set(category, { count: 0, volume: 0 });
          }
          const data = categoryMap.get(category);
          data.count += 1;
          data.volume += parseFloat(nft.price);
        });
      });

      const topCategories = Array.from(categoryMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5);

      // Mock recent activity and price history
      const recentActivity = [
        { type: 'sale', value: 2.5, date: Date.now() - 86400000 },
        { type: 'like', value: 1, date: Date.now() - 172800000 },
        { type: 'view', value: 25, date: Date.now() - 259200000 },
        { type: 'follow', value: 3, date: Date.now() - 345600000 },
      ];

      const priceHistory = Array.from({ length: 30 }, (_, i) => ({
        date: Date.now() - (29 - i) * 86400000,
        price: averagePrice * (0.8 + Math.random() * 0.4)
      }));

      setAnalytics({
        totalVolume,
        totalSales,
        averagePrice,
        totalViews,
        totalLikes,
        followerGrowth,
        portfolioValue,
        topCategories,
        recentActivity,
        priceHistory
      });
      setIsLoading(false);
    };

    calculateAnalytics();
  }, [account, nfts, userProfile]);

  if (isLoading || !analytics) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/20 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, change, icon, color = 'text-primary-400' }) => (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-white/10 ${color}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${
            change >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-gray-400">{title}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-primary-400" />
          Analytics Dashboard
        </h2>
        
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="input"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Volume"
          value={`${analytics.totalVolume.toFixed(2)} ETH`}
          change={12.5}
          icon={<DollarSign className="w-5 h-5" />}
          color="text-green-400"
        />
        
        <StatCard
          title="Total Sales"
          value={analytics.totalSales}
          change={8.3}
          icon={<Activity className="w-5 h-5" />}
          color="text-blue-400"
        />
        
        <StatCard
          title="Average Price"
          value={`${analytics.averagePrice.toFixed(3)} ETH`}
          change={-2.1}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-purple-400"
        />
        
        <StatCard
          title="Portfolio Value"
          value={`${analytics.portfolioValue.toFixed(2)} ETH`}
          change={15.7}
          icon={<Award className="w-5 h-5" />}
          color="text-accent-400"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Views"
          value={analytics.totalViews.toLocaleString()}
          change={22.4}
          icon={<Eye className="w-5 h-5" />}
        />
        
        <StatCard
          title="Total Likes"
          value={analytics.totalLikes}
          change={18.9}
          icon={<Heart className="w-5 h-5" />}
        />
        
        <StatCard
          title="Follower Growth"
          value={`+${analytics.followerGrowth}`}
          change={45.2}
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-primary-400" />
            Top Categories
          </h3>
          
          <div className="space-y-3">
            {analytics.topCategories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 bg-primary-${(index + 1) * 100}`}></div>
                  <span className="text-sm">{category.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{category.volume.toFixed(2)} ETH</div>
                  <div className="text-xs text-gray-400">{category.count} items</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-accent-400" />
            Recent Activity
          </h3>
          
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.type === 'sale' ? 'bg-green-400' :
                    activity.type === 'like' ? 'bg-red-400' :
                    activity.type === 'view' ? 'bg-blue-400' : 'bg-purple-400'
                  }`}></div>
                  <span className="text-sm capitalize">{activity.type}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {activity.type === 'sale' ? `${activity.value} ETH` : activity.value}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-accent-400" />
          Performance Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Top Performing Category</h4>
            <p className="text-sm text-gray-400">
              {analytics.topCategories[0]?.category || 'No data'} with{' '}
              {analytics.topCategories[0]?.volume.toFixed(2) || '0'} ETH in volume
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Growth Rate</h4>
            <p className="text-sm text-gray-400">
              Your portfolio has grown by {analytics.followerGrowth}% this month
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Engagement Rate</h4>
            <p className="text-sm text-gray-400">
              Average of {(analytics.totalLikes / Math.max(analytics.totalViews, 1) * 100).toFixed(1)}% like rate
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Market Position</h4>
            <p className="text-sm text-gray-400">
              Your average price is {analytics.averagePrice > 1 ? 'above' : 'below'} 1 ETH
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
