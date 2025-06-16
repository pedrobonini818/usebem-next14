
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
  Sparkles,
  Menu,
  X
} from 'lucide-react'

// Tipagens
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

// Dados simulados
const mockCards: Card[] = [
  {
    id: 1,
    name: 'Nubank Ultravioleta',
    type: 'Mastercard Black',
    color: 'from-purple-600 to-purple-800',
    benefits: ['Cashback 1%', 'Sem anuidade', 'Programa de pontos'],
    points: 12450,
    cashback: 234.5,
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
    cashback: 156.8,
    nextBenefit: 'Cashback 2% em investimentos'
  }
]

const mockBenefits: Benefit[] = [
  {
    id: 1,
    title: 'Cashback Duplo Supermercados',
    description: 'Ganhe 2% de cashback em compras de supermercado',
    category: 'Alimentação',
    expiry: '2024-12-31',
    used: false,
    cardId: 1,
    value: '2%'
  },
  {
    id: 2,
    title: 'Acesso Sala VIP Gratuito',
    description: '3 acessos mensais às salas VIP de aeroportos',
    category: 'Viagem',
    expiry: '2024-12-31',
    used: true,
    cardId: 2,
    value: '3x mês'
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
  const [benefits] = useState<Benefit[]>(mockBenefits)
  const [aiInsights] = useState<AIInsight[]>(mockAIInsights)

  const totalPoints = cards.reduce((sum, card) => sum + card.points, 0)
  const totalCashback = cards.reduce((sum, card) => sum + card.cashback, 0)
  const unusedBenefits = benefits.filter(b => !b.used).length

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const formatNumber = (value: number): string =>
    new Intl.NumberFormat('pt-BR').format(value)

  return (
    <main className="space-y-8 p-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6">
          <p className="text-sm">Pontos Totais</p>
          <p className="text-2xl font-bold">{formatNumber(totalPoints)}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6">
          <p className="text-sm">Cashback Acumulado</p>
          <p className="text-2xl font-bold">{formatCurrency(totalCashback)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6">
          <p className="text-sm">Benefícios Disponíveis</p>
          <p className="text-2xl font-bold">{unusedBenefits}</p>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold">Insights da IA</h2>
        </div>
        {aiInsights.map((insight, index) => (
          <div key={index} className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl">
            <PriorityIcon priority={insight.priority} />
            <div>
              <p className="font-medium">{insight.title}</p>
              <p className="text-sm text-gray-600">{insight.message}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
