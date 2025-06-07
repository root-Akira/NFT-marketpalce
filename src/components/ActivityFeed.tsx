import React from 'react';
import { 
  ShoppingCart, 
  Tag, 
  Send, 
  Palette, 
  Clock
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'mint' | 'list' | 'sale' | 'transfer';
  user: string;
  target?: string;
  nftId?: number;
  price?: string;
  timestamp: number;
  nftName?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  maxItems = 10
}) => {
  const displayedActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'mint':
        return <Palette className="w-4 h-4 text-green-400" />;
      case 'list':
        return <Tag className="w-4 h-4 text-blue-400" />;
      case 'sale':
        return <ShoppingCart className="w-4 h-4 text-purple-400" />;
      case 'transfer':
        return <Send className="w-4 h-4 text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityDescription = (activity: ActivityItem) => {
    const userShort = `${activity.user.slice(0, 6)}...${activity.user.slice(-4)}`;
    const targetShort = activity.target 
      ? `${activity.target.slice(0, 6)}...${activity.target.slice(-4)}`
      : '';

    switch (activity.type) {
      case 'mint':
        return (
          <span>
            <span className="font-medium text-white">{userShort}</span> minted {activity.nftName || `NFT #${activity.nftId}`}
          </span>
        );
      case 'list':
        return (
          <span>
            <span className="font-medium text-white">{userShort}</span> listed {activity.nftName || `NFT #${activity.nftId}`}
            {activity.price && <span className="text-yellow-400"> for {activity.price} ETH</span>}
          </span>
        );
      case 'sale':
        return (
          <span>
            <span className="font-medium text-white">{userShort}</span> purchased {activity.nftName || `NFT #${activity.nftId}`}
            {activity.price && <span className="text-green-400"> for {activity.price} ETH</span>}
          </span>
        );
      case 'transfer':
        return (
          <span>
            <span className="font-medium text-white">{userShort}</span> transferred {activity.nftName || `NFT #${activity.nftId}`}
            {targetShort && <span> to <span className="font-medium text-white">{targetShort}</span></span>}
          </span>
        );
      default:
        return <span>Unknown activity</span>;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (displayedActivities.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="text-center text-white/60 py-8">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
      <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {displayedActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/80">
                {getActivityDescription(activity)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
