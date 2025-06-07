// This utility function formats timestamps into human-readable relative time
export const getRelativeTime = (timestamp: number | undefined): string => {
  if (!timestamp) return 'Recently';
  
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 30) {
    return `${Math.floor(diffDay / 30)} months ago`;
  } else if (diffDay > 0) {
    return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
  } else if (diffHour > 0) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffMin > 0) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    return 'Just now';
  }
};
