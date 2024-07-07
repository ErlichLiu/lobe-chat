import React, { useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

interface UsageData {
  total_usage: number;
}

interface SubscriptionData {
  access_until: number;
  system_hard_limit_usd: number;
}

const Credits = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasAPIKey, setHasAPIKey] = useState<boolean>(false);
  const [credits, setCredits] = useState<string>('不可用');
  const [subscription, setSubscription] = useState<string>('无');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const usageAPI = 'https://openai.weavex.tech/v1/dashboard/billing/usage/';
  const subscriptionAPI = 'https://openai.weavex.tech/v1/dashboard/billing/subscription/';

  const handleQueryCredits = async (apiKey: string) => {
    setIsLoading(true);
    try {
      // 查询剩余额度
      const usageResponse = await fetch(usageAPI, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        method: 'GET',
      });
      const usageData: UsageData = await usageResponse.json();

      // 查询订阅信息
      const subscriptionResponse = await fetch(subscriptionAPI, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        method: 'GET',
      });
      const subscriptionData: SubscriptionData = await subscriptionResponse.json();
      if (!subscriptionData.access_until) {
        setSubscription('无');
      } else {
        const date = new Date(subscriptionData.access_until * 1000);
        const shanghaiTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));

        console.log(shanghaiTime);
        const formattedDate = `${shanghaiTime.getFullYear().toString().slice(-2)}/${(shanghaiTime.getMonth() + 1).toString().padStart(2, '0')}/${shanghaiTime.getDate().toString().padStart(2, '0')}`;

        setSubscription(formattedDate);
      }
      if (isNaN(subscriptionData.system_hard_limit_usd - usageData.total_usage / 100)) {
        setCredits('不可用');
        return;
      } else {
        const calculatedCredits = (
          subscriptionData.system_hard_limit_usd -
          usageData.total_usage / 100
        ).toFixed(2);
        setCredits(calculatedCredits.toString());
      }
    } catch (error) {
      setCredits('网络请求错误');
      setSubscription('网络请求错误');
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 仅在客户端渲染时执行
    const storedApiKey = localStorage.getItem('apiKey');
    if (!storedApiKey) {
      // 如果没有 API Key，显示输入提示
      setHasAPIKey(false);
    } else {
      // 如果有 API Key，查询剩余额度和订阅信息
      setApiKey(storedApiKey);
      setHasAPIKey(true);
      handleQueryCredits(storedApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem('apiKey', apiKey);
    setHasAPIKey(true);
    handleQueryCredits(apiKey);
  };

  return (
    <Flexbox align="center" gap={8} horizontal padding="10px">
      {hasAPIKey ? (
        <Flexbox align="center" gap={8} horizontal>
          {isLoading ? (
            <span>加载中...</span>
          ) : (
            <>
              剩余:{credits} ({subscription})
            </>
          )}
          <Flexbox align="center" gap="4px" onClick={() => handleQueryCredits(apiKey)}>
            <svg
              className="lucide lucide-refresh-ccw-dot"
              fill="transparent"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              width="14"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 2v6h6"></path>
              <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
              <path d="M21 22v-6h-6"></path>
              <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
              <circle cx="12" cy="12" r="1"></circle>
            </svg>
          </Flexbox>
        </Flexbox>
      ) : (
        <Flexbox align="center" gap={8} horizontal>
          <input
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="请输入你的 API KEY"
            type="text"
            value={apiKey}
          />
          <Flexbox align="center" onClick={handleSaveApiKey}>
            确认
          </Flexbox>
        </Flexbox>
      )}
    </Flexbox>
  );
};

export default Credits;
