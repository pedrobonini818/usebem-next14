tsx// components/AIInsightsComponent.tsx
'use client';

import React, { useEffect } from 'react';
import { Brain, TrendingUp, AlertCircle, Lightbulb, Target, RefreshCw } from 'lucide-react';
import { useAIInsights } from '@/hooks/useAIInsights';

interface AIInsightsComponentProps {
  userData: {
    cards: Array<{
      name: string;
      points: number;
      cashback: number;
      category: string;
    }>;
    totalPoints: number;
    totalCashback: number;
    monthlySpending: number;
    categories: Array<{
      name: string;
      amount: number;
      percentage: number;
    }>;
    recentTransactions: Array<{
      description: string;
      amount: number;
      date: string;
      category: string;
    }>;
  };
}

export default function AIInsightsComponent({ userData }: AIInsightsComponentProps) {
  const { insights, loading, error, generateInsights, clearError } = useAIInsights();

  useEffect(() => {
    if (userData) {
      generateInsights(userData);
    }
  }, [userData, generateInsights]);

  const handleRefresh = () => {
    generateInsights(userData);
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold text-red-700">Erro nos Insights da IA</h2>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
        <p className="text-red-600">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Insights da IA</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : insights ? (
        <div className="space-y-6">
          {/* Oportunidade de Economia */}
          {insights.opportunities && (
            <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">Oportunidade de Economia</h3>
                  <p className="text-green-700 text-sm leading-relaxed">{insights.opportunities}</p>
                </div>
              </div>
            </div>
          )}

          {/* Alerta */}
          {insights.alerts && (
            <div className="border-l-4 border-amber-500 pl-4 bg-amber-50 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Benefício Expirando</h3>
                  <p className="text-amber-700 text-sm leading-relaxed">{insights.alerts}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recomendação */}
          {insights.recommendations && (
            <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Recomendação Inteligente</h3>
                  <p className="text-blue-700 text-sm leading-relaxed">{insights.recommendations}</p>
                </div>
              </div>
            </div>
          )}

          {/* Dica de Otimização */}
          {insights.tips && (
            <div className="border-l-4 border-purple-500 pl-4 bg-purple-50 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-purple-800 mb-1">Dica de Otimização</h3>
                  <p className="text-purple-700 text-sm leading-relaxed">{insights.tips}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Carregue os dados para gerar insights personalizados</p>
        </div>
      )}
    </div>
  );
}
