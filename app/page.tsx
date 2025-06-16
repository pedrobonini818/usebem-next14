'use client'

import React, { useState } from 'react'
import {
  CreditCard,
  Gift,
  TrendingUp,
  Bell,
  Plus,
  Star,
  Calendar,
  Target,
  Zap,
  Award,
  BarChart3,
  Wallet,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react'

interface Card {
  id: number
  name: string
  type: string
  color: string
  benefits: string[]
  points: number
  cashback: number
  nextBenefit: string
}

interface Benefit {
  id: number
  title: string
  description: string
  category: string
  expiry: string
  used: boolean
  cardId: number
  value: string
}

interface AIInsight {
  type: 'opportunity' | 'reminder' | 'recommendation'
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
}

const mockCards: Card[] = [
  {
    id: 1,
    name: 'Nubank Ultravioleta',
    type: 'Mastercard Black',
    color: 'from-purple-600 to-purple-800',
    benefits: ['Cashback 1%', 'Sem anuidade', 'Programa de pontos'],
    points: 12450,
    cashback: 234.50,
    nextBenefit: 'Cashback duplo até 31/12'
  },
  {
    id: 2,
    name: 'Itaú Personnalité',
    type: 'Visa Infinite',
    color: 'from-orange-500 to-red-600',
    benefits: ['Sala VIP', 'Concierge', 'Seguro viagem'],
    points: 8730,
    cashback: 0,
    nextBenefit: 'Acesso gratuito sala VIP'
  },
  {
    id: 3,
    name: 'XP Investimentos',
    type: 'Visa Platinum',
    color: 'from-blue-600 to-blue-800',
    benefits: ['Cashback investimentos', 'Sem anuidade', 'Descontos'],
    points: 5240,
    cashback: 156.80,
    nextBenefit: 'Cashback 2% em investimentos'
  }
]

const mockAIInsights: AIInsight[] = [
  {
    type: 'opportunity',
    title: 'Oportunidade de Economia',
    message: 'Use o cashback duplo do Nubank para compras de supermercado este mês. Potencial economia: R$ 89',
    priority: 'high'
  },
  {
    type: 'reminder',
    title: 'Benefício Expirando',
    message: 'Seu desconto iFood expira em 14 dias. Use antes de perder!',
    priority: 'medium'
  },
  {
    type: 'recommendation',
    title: 'Recomendação Inteligente',
    message: 'Baseado no seu perfil, o cartão XP é ideal para suas próximas compras de investimento',
    priority: 'low'
  }
]

const PriorityIcon: React.FC<{ priority: string }> = ({ priority }) => {
  if (priority === 'high') return <AlertCircle className="w-4 h-4 text-red-500" />
  if (priority === 'medium') return <Clock className="w-4 h-4 text-yellow-500" />
  return <CheckCircle className="w-4 h-4 text-green-500" />
}

export default function UseBem() {
  const [cards] = useState<Card[]>(mockCards)
  const [aiInsights] = useState<AIInsight[]>(mockAIInsights)

  const totalPoints = cards.reduce((sum, card) => sum + card.points, 0)
  const totalCashback = cards.reduce((sum, card) => sum + card.cashback, 0)

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)

  const formatNumber = (value: number): string =>
    new Intl.NumberFormat('pt-BR').format(value)

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Pontos Totais</p>
              <p className="text-2xl font-bold">{formatNumber(totalPoints)}</p>
            </div>
            <Star className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Cashback Acumulado</p>
              <p className="text-2xl font-bold">{formatCurrency(totalCashback)}</p>
            </div>
            <Wallet className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Cartões Ativos</p>
              <p className="text-2xl font-bold">{cards.length}</p>
            </div>
            <CreditCard className="w-10 h-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Insights da IA */}
      <div className="bg-white rounded-2xl shadow border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Insights da IA</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {aiInsights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <PriorityIcon priority={insight.priority} />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{insight.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
