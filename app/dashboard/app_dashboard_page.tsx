'use client'

import React from 'react'
import AIInsightsComponent from '@/components/AIInsights'

export default function Dashboard() {
  const userData = {
    cards: [
      { name: 'Nubank', points: 12500, cashback: 187.50, category: 'geral' },
      { name: 'XP', points: 8920, cashback: 134.80, category: 'investimentos' }
    ],
    totalPoints: 26420,
    totalCashback: 391.30,
    monthlySpending: 2850,
    categories: [
      { name: 'Alimentação', amount: 850, percentage: 30 },
      { name: 'Combustível', amount: 420, percentage: 15 }
    ],
    recentTransactions: [
      { description: 'Posto Shell', amount: 156.80, date: '2025-06-15', category: 'combustível' }
    ]
  };

  return (
    <div className="p-6">
      <AIInsightsComponent userData={userData} />
    </div>
  );
}