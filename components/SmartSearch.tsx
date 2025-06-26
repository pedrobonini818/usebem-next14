// components/SmartSearch.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Search, CreditCard, Gift, Percent, Calendar, ExternalLink, Sparkles, Target, Zap, Clock, CheckCircle, AlertCircle, TrendingUp, Wallet } from 'lucide-react';
import { supabaseQueries } from '../lib/supabase';

// Simulando usuário logado - você pode integrar com auth real depois
const MOCK_USER_ID = 'user-123';

interface SmartSearchResult {
  offer_id: string;
  offer_title: string;
  offer_description: string;
  merchant_name: string | null;
  program_name: string;
  institution_name: string;
  cashback_percentage: number | null;
  points_multiplier: number | null;
  discount_percentage: number | null;
  valid_until: string | null;
  priority_score: number;
  offer_type: string;
}

interface SearchSuggestion {
  text: string;
  category: string;
  icon: React.ReactNode;
}

const SmartSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [offers, setOffers] = useState<SmartSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sugestões populares baseadas nos dados reais
  const suggestions: SearchSuggestion[] = [
    { text: 'Supermercado', category: 'Alimentação', icon: <Target className="w-4 h-4" /> },
    { text: 'Pão de Açúcar', category: 'Loja', icon: <ExternalLink className="w-4 h-4" /> },
    { text: 'Centauro', category: 'Esportes', icon: <ExternalLink className="w-4 h-4" /> },
    { text: 'McDonald\'s', category: 'Restaurante', icon: <ExternalLink className="w-4 h-4" /> },
    { text: 'Combustível', category: 'Posto', icon: <Zap className="w-4 h-4" /> },
    { text: 'Farmácia', category: 'Saúde', icon: <Target className="w-4 h-4" /> },
    { text: 'Restaurantes', category: 'Alimentação', icon: <Target className="w-4 h-4" /> },
    { text: 'Eletrônicos', category: 'Tecnologia', icon: <Target className="w-4 h-4" /> }
  ];

  // Função principal de busca
  const handleSearch = async (term: string) => {
    if (!term.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    setError(null);
    
    try {
      console.log('🔍 Buscando ofertas para:', term);

      // Como ainda não temos usuários reais, vamos simular a busca
      // buscando todas as ofertas e filtrando por relevância
      const { data: allOffers, error: offersError } = await supabaseQueries.getFeaturedOffers();
      
      if (offersError) {
        throw new Error(offersError.message);
      }

      // Filtrar ofertas relevantes baseado no termo de busca
      const filteredOffers = (allOffers || []).filter(offer => {
        const searchLower = term.toLowerCase();
        return (
          offer.offer_title?.toLowerCase().includes(searchLower) ||
          offer.merchant_name?.toLowerCase().includes(searchLower) ||
          offer.program_name?.toLowerCase().includes(searchLower) ||
          offer.institution_brand?.toLowerCase().includes(searchLower) ||
          offer.category_name?.toLowerCase().includes(searchLower)
        );
      });

      // Se não encontrou resultados específicos, mostrar ofertas gerais
      const finalOffers = filteredOffers.length > 0 ? filteredOffers : (allOffers || []).slice(0, 3);

      // Transformar para o formato esperado
      const transformedOffers: SmartSearchResult[] = finalOffers.map(offer => ({
        offer_id: offer.id,
        offer_title: offer.title,
        offer_description: offer.description,
        merchant_name: offer.merchant_name,
        program_name: offer.program_name,
        institution_name: offer.institution_brand,
        cashback_percentage: offer.cashback_percentage,
        points_multiplier: offer.points_multiplier,
        discount_percentage: offer.discount_percentage,
        valid_until: offer.valid_until,
        priority_score: offer.priority_score,
        offer_type: offer.offer_type
      }));

      console.log('✅ Ofertas encontradas:', transformedOffers.length);
      setOffers(transformedOffers);

      // Log da busca para analytics
      await supabaseQueries.logSearch(MOCK_USER_ID, term, transformedOffers.length);

    } catch (err: any) {
      console.error('❌ Erro na busca:', err);
      setError(err.message || 'Erro ao buscar ofertas');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatBenefit = (offer: SmartSearchResult) => {
    if (offer.cashback_percentage) {
      return {
        text: `${offer.cashback_percentage}% cashback`,
        icon: <Percent className="w-4 h-4" />,
        color: 'text-green-600 bg-green-50',
        value: offer.cashback_percentage
      };
    }
    if (offer.discount_percentage) {
      return {
        text: `${offer.discount_percentage}% desconto`,
        icon: <Gift className="w-4 h-4" />,
        color: 'text-blue-600 bg-blue-50',
        value: offer.discount_percentage
      };
    }
    if (offer.points_multiplier) {
      return {
        text: `${offer.points_multiplier}x pontos`,
        icon: <CreditCard className="w-4 h-4" />,
        color: 'text-purple-600 bg-purple-50',
        value: offer.points_multiplier
      };
    }
    return {
      text: 'Benefício especial',
      icon: <Gift className="w-4 h-4" />,
      color: 'text-gray-600 bg-gray-50',
      value: 0
    };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Expirado', color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Expira hoje', color: 'text-red-600' };
    if (diffDays === 1) return { text: 'Expira amanhã', color: 'text-orange-600' };
    if (diffDays <= 7) return { text: `Expira em ${diffDays} dias`, color: 'text-orange-600' };
    
    return { 
      text: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), 
      color: 'text-gray-600' 
    };
  };

  const getBestOfferBadge = (index: number, benefit: any) => {
    if (index === 0) {
      return (
        <div className="mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ⭐ Melhor opção para você
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            Busca Inteligente
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Digite o que você quer comprar e descubra <strong>qual dos seus programas oferece o melhor benefício</strong>
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-blue-800 text-sm">
            <strong>Como funciona:</strong> Cruzamos todos os seus cartões e programas de benefícios para encontrar a melhor vantagem no momento da compra.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-4xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            placeholder="Ex: Pão de Açúcar, tênis Nike, combustível, restaurante japonês..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            className="w-full pl-14 pr-32 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
          />
        </div>
        <button
          onClick={() => handleSearch(searchTerm)}
          disabled={!searchTerm.trim() || loading}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm font-medium"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Buscando...
            </div>
          ) : (
            'Buscar'
          )}
        </button>
      </div>

      {/* Quick Search Suggestions */}
      {!hasSearched && (
        <div className="space-y-4 max-w-4xl mx-auto">
          <p className="text-sm text-gray-500 font-medium">💡 Sugestões populares:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchTerm(suggestion.text);
                  handleSearch(suggestion.text);
                }}
                className="flex items-center gap-2 px-4 py-3 text-sm bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-all shadow-sm"
              >
                {suggestion.icon}
                <span className="font-medium">{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center py-16 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">Analisando suas vantagens...</p>
            <p className="text-gray-500">Cruzando dados de cartões e programas de benefícios</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">Erro na busca</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => handleSearch(searchTerm)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Results */}
      {hasSearched && !loading && !error && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {offers.length > 0 ? (
                <>
                  <span className="text-blue-600">{offers.length}</span> ofertas encontradas para "{searchTerm}"
                </>
              ) : (
                'Nenhuma oferta encontrada'
              )}
            </h2>
            {offers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>Ordenado por melhor benefício</span>
              </div>
            )}
          </div>

          {offers.length === 0 ? (
            <div className="text-center py-16 space-y-6">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-medium text-gray-900">
                  Nenhuma oferta específica encontrada
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Não encontramos ofertas específicas para "{searchTerm}". Tente buscar por uma categoria mais geral ou adicione mais programas de benefícios.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => handleSearch('restaurantes')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Ver ofertas em restaurantes
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                  Adicionar mais programas
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {offers.map((offer, index) => {
                const benefit = formatBenefit(offer);
                const expiry = formatDate(offer.valid_until);
                
                return (
                  <div
                    key={offer.offer_id}
                    className={`p-8 rounded-2xl border-2 transition-all hover:shadow-lg ${
                      index === 0 
                        ? 'border-green-200 bg-gradient-to-r from-green-50 to-blue-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {getBestOfferBadge(index, benefit)}
                    
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {offer.offer_title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {offer.offer_description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-700">
                                {offer.program_name}
                              </span>
                              <span className="text-gray-500">
                                ({offer.institution_name})
                              </span>
                            </div>
                            
                            {offer.merchant_name && (
                              <div className="flex items-center gap-2">
                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">
                                  {offer.merchant_name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className={`ml-6 px-4 py-3 rounded-xl flex items-center gap-2 ${benefit.color}`}>
                          {benefit.icon}
                          <span className="font-bold text-lg">
                            {benefit.text}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-6 text-sm">
                          {expiry && (
                            <div className={`flex items-center gap-1 ${expiry.color}`}>
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">{expiry.text}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 text-gray-500">
                            <Target className="w-4 h-4" />
                            <span>Prioridade: {offer.priority_score}</span>
                          </div>
                        </div>

                        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          Usar este benefício
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;