import React, { useState } from 'react';
import { getLocationByAddress, ApiError } from '@/lib/api';
import { LocationData } from '@/types/weather';

interface LocationSearchProps {
  onLocationChange: (location: LocationData) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationChange }) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocationError, setIsLocationError] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsLoading(true);
    setError(null);
    setIsLocationError(false);

    try {
      const location = await getLocationByAddress(address);
      if (location) {
        onLocationChange({ ...location, address });
      } else {
        setError('无法找到该地址，请尝试更具体的位置');
      }
    } catch (err) {
      console.error(err);
      
      if (err instanceof ApiError && err.isLocationNotSupported) {
        setError(err.message);
        setIsLocationError(true);
      } else {
        setError('搜索位置时出错，请稍后再试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="输入城市或地址..."
            className="w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2"
            style={{ 
              border: '1px solid var(--search-border)',
              background: 'var(--card-background)', 
              color: 'var(--foreground)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="rounded-md text-white py-1 px-4 transition top-1/2 right-2 -translate-y-1/2 absolute hover:opacity-90"
            style={{ background: 'var(--header-bg-from)' }}
            disabled={isLoading}
          >
            {isLoading ? '搜索中...' : '搜索'}
          </button>
        </div>
        {error && (
          <div className={`${isLocationError ? 'p-3 rounded-md' : ''}`} style={{
            background: isLocationError ? 'rgba(253, 224, 71, 0.1)' : 'transparent',
            border: isLocationError ? '1px solid rgba(253, 224, 71, 0.3)' : 'none'
          }}>
            <p className="text-sm" style={{ 
              color: isLocationError ? '#b45309' : '#ef4444' 
            }}>
              {error}
            </p>
            {isLocationError && (
              <p className="mt-1 text-sm" style={{ color: 'var(--tab-inactive)' }}>
                建议：尝试搜索更大的城市或地区，某些偏远位置可能不被Google天气API支持。
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default LocationSearch; 