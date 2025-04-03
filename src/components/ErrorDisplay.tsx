import React from 'react';
import { ApiError } from '@/lib/api';

interface ErrorDisplayProps {
  error: Error | ApiError | null;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  if (!error) return null;

  // 默认错误信息
  let title = '发生错误';
  let message = '请稍后重试';
  let type: 'error' | 'warning' | 'info' = 'error';
  let suggestions: string[] = [];

  // 处理不同类型的错误
  if (error instanceof ApiError) {
    message = error.message;

    // 根据错误代码提供更具体的建议
    switch (error.code) {
      case 'LOCATION_NOT_SUPPORTED':
        title = '位置不支持';
        type = 'warning';
        suggestions = [
          '尝试附近的大城市或地区',
          '确保位置名称拼写正确',
          '提供更具体的地址（如添加城市名、省/州名）'
        ];
        break;
      case 'ADDRESS_NOT_FOUND':
        title = '未找到地址';
        type = 'warning';
        suggestions = [
          '检查地址拼写是否正确',
          '使用更常见或官方的地名',
          '尝试附近的知名地标或城市'
        ];
        break;
      case 'GEOCODING_ERROR':
        title = '地理编码错误';
        type = 'error';
        suggestions = ['可能是API密钥限制或无效', '请稍后再试'];
        break;
      case 'API_ERROR':
      default:
        title = 'API请求失败';
        suggestions = ['检查网络连接', '刷新页面', '如果问题持续存在，请稍后再试'];
        break;
    }
  }

  // 根据错误类型选择样式
  const styles = {
    error: {
      container: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
      title: 'text-red-700 dark:text-red-300',
      message: 'text-red-600 dark:text-red-400',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
      title: 'text-yellow-700 dark:text-yellow-300',
      message: 'text-yellow-600 dark:text-yellow-400',
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
      title: 'text-blue-700 dark:text-blue-300',
      message: 'text-blue-600 dark:text-blue-400',
    },
  }[type];

  return (
    <div className={`p-4 rounded-md border ${styles.container}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {type === 'error' && (
            <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'warning' && (
            <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
          <div className={`mt-2 text-sm ${styles.message}`}>
            <p>{message}</p>
          </div>
          {suggestions.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">建议:</h4>
              <ul className="mt-1 list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:ring-blue-500"
              >
                重试
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay; 