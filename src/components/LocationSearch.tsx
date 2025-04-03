import React, { useState, useRef, useEffect } from 'react';
import { getLocationByAddress, ApiError } from '@/lib/api';
import { LocationData } from '@/types/weather';

interface LocationSearchProps {
  onLocationChange: (location: LocationData) => void;
  recentSearches?: string[];
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationChange, recentSearches = [] }) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocationError, setIsLocationError] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const recentSearchesRef = useRef<HTMLDivElement>(null);
  const recentButtonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

  const handleSelectRecentSearch = (term: string) => {
    setAddress(term);
    if (formRef.current) {
      const event = new Event('submit', { cancelable: true });
      formRef.current.dispatchEvent(event);
    }
    setShowRecentSearches(false);
  };

  // 添加点击外部关闭最近搜索下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        recentSearchesRef.current && 
        recentButtonRef.current &&
        !recentSearchesRef.current.contains(event.target as Node) &&
        !recentButtonRef.current.contains(event.target as Node)
      ) {
        setShowRecentSearches(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 当按钮被点击时切换下拉菜单
  const toggleRecentSearches = (e: React.MouseEvent) => {
    e.preventDefault(); // 防止表单提交
    e.stopPropagation(); // 防止事件冒泡
    setShowRecentSearches(!showRecentSearches);
  };

  // 按ESC键关闭下拉菜单
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showRecentSearches) {
        setShowRecentSearches(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showRecentSearches]);

  return (
    <div className="w-full">
      <form ref={formRef} onSubmit={handleSearch} className="flex flex-col gap-2">
        <div className="relative flex">
          <div className="flex-grow relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="输入城市或地址..."
              className={`w-full py-3 px-4 rounded-l-full focus:outline-none focus:ring-2 focus:ring-google-blue ${isLoading ? 'opacity-70' : ''}`}
              style={{ 
                border: '1px solid var(--search-border)',
                borderRight: 'none',
                background: 'var(--card-background)', 
                color: 'var(--foreground)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent"
                     style={{ borderColor: 'var(--tab-inactive)', borderTopColor: 'transparent' }}></div>
              </div>
            )}
          </div>

          {recentSearches.length > 0 && (
            <button
              type="button"
              ref={recentButtonRef}
              onClick={toggleRecentSearches}
              className={`py-3 px-3 border-y border-l ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={{ 
                borderColor: 'var(--search-border)', 
                background: 'var(--card-background)',
                color: showRecentSearches ? 'var(--tab-active)' : 'var(--foreground)'
              }}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          <button
            type="submit"
            className={`rounded-r-full text-white py-2 px-5 transition hover:bg-opacity-90 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            style={{ background: 'var(--header-bg-from)' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent mr-2"
                     style={{ borderColor: 'white', borderTopColor: 'transparent' }}></div>
                <span>搜索中</span>
              </div>
            ) : '搜索'}
          </button>
          
          {showRecentSearches && recentSearches.length > 0 && !isLoading && (
            <div 
              ref={recentSearchesRef}
              className="absolute top-full mt-1 right-0 w-48 rounded-md border shadow-lg z-10"
              style={{ 
                background: 'var(--card-background)', 
                border: '1px solid var(--search-border)',
                animation: 'fadeIn 0.2s ease-in-out'
              }}
            >
              <div className="py-1">
                <div className="px-3 py-2 text-xs font-medium" style={{ color: 'var(--tab-inactive)' }}>
                  最近搜索
                </div>
                {recentSearches.map((term, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 cursor-pointer hover:bg-opacity-10 transition-colors duration-150"
                    style={{ 
                      background: 'transparent', 
                      color: 'var(--foreground)',
                      borderLeft: '2px solid transparent'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderLeftColor = 'var(--header-bg-from)';
                      e.currentTarget.style.background = 'var(--hover-bg)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderLeftColor = 'transparent';
                      e.currentTarget.style.background = 'transparent';
                    }}
                    onClick={() => handleSelectRecentSearch(term)}
                  >
                    {term}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {error && (
          <div className={`${isLocationError ? 'p-3 rounded-md' : ''}`} style={{
            background: isLocationError ? 'rgba(251, 188, 5, 0.1)' : 'transparent',
            border: isLocationError ? '1px solid rgba(251, 188, 5, 0.3)' : 'none'
          }}>
            <p className="text-sm" style={{ 
              color: isLocationError ? '#EA4335' : '#EA4335' 
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LocationSearch; 