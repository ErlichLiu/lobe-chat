'use client';

import { ActionIcon } from '@lobehub/ui';
import { Popover, Spin, message } from 'antd';
import { Coins } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';
import { getProviderAuthPayload } from '@/services/_auth';

interface QuotaInfo {
  expirationDate: string | null;
  quota: number;
}

const QuotaDisplay = memo(() => {
  const { t } = useTranslation('common');
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQuota = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authPayload = getProviderAuthPayload(ModelProvider.OpenAI);
      const { apiKey, endpoint } = authPayload;
      const baseUrl = endpoint || 'https://api.openai.com/v1';
      const headers = {
        Authorization: `Bearer ${apiKey}`,
      };

      const [usageResponse, subscriptionResponse] = await Promise.all([
        fetch(`${baseUrl}/dashboard/billing/usage`, { headers, method: 'GET' }),
        fetch(`${baseUrl}/dashboard/billing/subscription`, { headers, method: 'GET' }),
      ]);

      if (!usageResponse.ok || !subscriptionResponse.ok) {
        throw new Error('Failed to fetch LLM usage or subscription information');
      }

      const [usageData, subscriptionData] = await Promise.all([
        usageResponse.json(),
        subscriptionResponse.json(),
      ]);

      const totalUsage = usageData.total_usage || 0;
      const hardLimit = subscriptionData.hard_limit_usd || 0;

      const quota = (hardLimit - totalUsage / 100).toFixed(2);
      const expirationDate = subscriptionData.access_until
        ? new Date(subscriptionData.access_until * 1000).toISOString().split('T')[0]
        : 'never'; // Change null to 'never'

      setQuotaInfo({
        expirationDate,
        quota: parseFloat(quota),
      });
    } catch (error) {
      console.error('Failed to fetch quota:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      message.error(t('quota.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  return (
    <Popover
      content={
        loading ? (
          <Spin size="small" />
        ) : error ? (
          <div>{t('quota.error', { message: error })}</div>
        ) : quotaInfo ? (
          <div>
            <div>{t('quota.remaining', { count: quotaInfo.quota })}</div>
            <div>
              {quotaInfo.expirationDate === 'never'
                ? t('quota.neverExpires')
                : t('quota.expiration', { date: quotaInfo.expirationDate })}
            </div>
          </div>
        ) : (
          <div>{t('quota.unavailable')}</div>
        )
      }
      title={t('quota.title')}
      trigger="hover"
    >
      <ActionIcon icon={Coins} onClick={updateQuota} />
    </Popover>
  );
});

export default QuotaDisplay;
