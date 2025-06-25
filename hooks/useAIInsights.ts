typescript// hooks/useAIInsights.ts
import { useState, useCallback } from 'react';

interface AIInsights {
  opportunities: string;
  alerts: string;
  recommendations: string;
  tips: string;
  raw: string;
}

interface UseAIInsightsReturn {
  insights: AIInsights | null;
  loading: boolean;
  error: string | null;
  generateInsights: (userData: any) => Promise<void>;
  clearError: () => void;
}

export function useAIInsights(): UseAIInsightsReturn {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = useCallback(async (userData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar insights');
      }

      setInsights(data.insights);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao gerar insights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    insights,
    loading,
    error,
    generateInsights,
    clearError,
  };
}