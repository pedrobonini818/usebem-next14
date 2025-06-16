// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UseBem - Gestão Inteligente de Benefícios',
  description: 'Gerencie seus cartões de crédito e benefícios de forma inteligente com IA',
  keywords: 'cartão de crédito, benefícios, cashback, pontos, gestão financeira',
  authors: [{ name: 'UseBem Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

// app/page.tsx
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

// Types
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

// Mock data
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
  },
  {
    id: 3,
    title: 'Desconto iFood',
    description: '15% de desconto em pedidos até R$ 50',
    category: 'Alimentação',
    expiry: '2024-06-30',
    used: false,
    cardId: 1,
    value: '15%'
  },
  {
    id: 4,
    title: 'Seguro Viagem Internacional',
    description: 'Cobertura automática para viagens internacionais',
    category: 'Seguro',
    expiry: '2024-12-31',
    used: false,
    cardId: 2,
    value: 'Ilimitado'
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

// Components
const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
  const icons: Record<string, React.ReactNode> = {
    'Alimentação': <Target className="w-4 h-4" />,
    'Viagem': <Calendar className="w-4 h-4" />,
    'Seguro': <Award className="w-4 h-4" />,
    'Investimento': <TrendingUp className="w-4 h-4" />
  }
  return <>{icons[category] || <Gift className="w-4 h-4" />}</>
}

const PriorityIcon: React.FC<{ priority: string }> = ({ priority }) => {
  if (priority === 'high') return <AlertCircle className="w-4 h-4 text-red-500" />
  if (priority === 'medium') return <Clock className="w-4 h-4 text-yellow-500" />
  return <CheckCircle className="w-4 h-4 text-green-500" />
}

// Main Component
export default function UseBem() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [cards] = useState<Card[]>(mockCards)
  const [benefits] = useState<Benefit[]>(mockBenefits)
  const [aiInsights] = useState<AIInsight[]>(mockAIInsights)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const totalPoints = cards.reduce((sum, card) => sum + card.points, 0)
  const totalCashback = cards.reduce((sum, card) => sum + card.cashback, 0)
  const unusedBenefits = benefits.filter(b => !b.used).length

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Pontos Totais</p>
              <p className="text-2xl font-bold">{formatNumber(totalPoints)}</p>
            </div>
            <Star className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Cashback Acumulado</p>
              <p className="text-2xl font-bold">{formatCurrency(totalCashback)}</p>
            </div>
            <Wallet className="w-10 h-10 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Benefícios Disponíveis</p>
              <p className="text-2xl font-bold">{unusedBenefits}</p>
            </div>
            <Gift className="w-10 h-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 card-hover">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Insights da IA</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {aiInsights.map((insight, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
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

      {/* Cards Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 card-hover">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold">Meus Cartões</h2>
        </div>
        <div className="p-6 space-y-4">
          {cards.map(card => (
            <div key={card.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all cursor-pointer">
              <div className={`w-16 h-10 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center`}>
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{card.name}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{card.type}</span>
                </div>
                <p className="text-sm text-gray-600">{card.nextBenefit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatNumber(card.points)} pts</p>
                {card.cashback > 0 && (
                  <p className="text-xs text-green-600">{formatCurrency(card.cashback)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCards = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meus Cartões</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Adicionar Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cards.map(card => (
          <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover">
            <div className={`bg-gradient-to-r ${card.color} p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{card.name}</h3>
                <CreditCard className="w-8 h-8" />
              </div>
              <p className="text-sm opacity-90">{card.type}</p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-xs opacity-75">Pontos</p>
                  <p className="text-lg font-bold">{formatNumber(card.points)}</p>
                </div>
                <div>
                  <p className="text-xs opacity-75">Cashback</p>
                  <p className="text-lg font-bold">{formatCurrency(card.cashback)}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h4 className="font-medium mb-3">Benefícios Principais</h4>
              <div className="space-y-2">
                {card.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Próximo benefício:</strong> {card.nextBenefit}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderBenefits = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Benefícios</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Search className="w-4 h-4" />
            Buscar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benefits.map(benefit => (
          <div