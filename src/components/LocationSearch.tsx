import React, { useState } from 'react';
import { getLocationByAddress } from '@/lib/api';
import { LocationData } from '@/types/weather';

interface LocationSearchProps {
  onLocationChange: (location: LocationData) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationChange }) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const location = await getLocationByAddress(address);
      if (location) {
        onLocationChange({ ...location, address });
      } else {
        setError('无法找到该地址，请尝试更具体的位置');
      }
    } catch (err) {
      setError('搜索位置时出错，请稍后再试');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="输入城市或地址..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition"
            disabled={isLoading}
          >
            {isLoading ? '搜索中...' : '搜索'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default LocationSearch; 