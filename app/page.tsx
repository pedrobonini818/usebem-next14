'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'// Importa nosso "mensageiro"
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
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Save,
  Trash2
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
  limit: number
  lastDigits: string
}

// ... (as outras interfaces Benefit, AIInsight, Notification continuam iguais)
interface Benefit {
  id: number;
  title: string;
  description: string;
  category: string;
  expiry: string;
  used: boolean;
  cardId: number;
  value: string;
}
interface AIInsight {
  type: 'opportunity' | 'reminder' | 'recommendation';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
}
interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}


// DADOS FALSOS (MOCK) - Deixaremos alguns aqui por enquanto, mas o mockCards foi removido.
const mockBenefits: Benefit[] = [
    { id: 1, title: 'Cashback Duplo Supermercados', description: 'Ganhe 2% de cashback em compras de supermercado', category: 'Alimentação', expiry: '2025-12-31', used: false, cardId: 1, value: '2%' },
    { id: 2, title: 'Acesso Sala VIP Gratuito', description: '3 acessos mensais às salas VIP de aeroportos', category: 'Viagem', expiry: '2025-12-31', used: true, cardId: 2, value: '3x mês' },
];
const mockNotifications: Notification[] = [
    { id: 1, title: 'Benefício Expirando', message: 'Seu desconto iFood expira em 3 dias', time: '2h atrás', read: false, type: 'warning' },
];
const mockAIInsights: AIInsight[] = [
    { type: 'opportunity', title: 'Oportunidade de Economia', message: 'Use o cashback duplo do Nubank para compras de supermercado este mês. Potencial economia: R$ 89', priority: 'high', action: 'Ver Detalhes' },
];


// Components
const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
    const icons: Record<string, React.ReactNode> = { 'Alimentação': <Target className="w-4 h-4" />, 'Viagem': <Calendar className="w-4 h-4" />, 'Seguro': <Award className="w-4 h-4" />, 'Investimento': <TrendingUp className="w-4 h-4" />, 'Saúde': <Plus className="w-4 h-4" />, 'Entretenimento': <Star className="w-4 h-4" /> };
    return <>{icons[category] || <Gift className="w-4 h-4" />}</>;
}

const PriorityIcon: React.FC<{ priority: string }> = ({ priority }) => {
    if (priority === 'high') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (priority === 'medium') return <Clock className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
}

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// Main Component
export default function UseBem() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [cards, setCards] = useState<Card[]>([]); // <<-- ESTADO INICIAL VAZIO
    const [benefits, setBenefits] = useState<Benefit[]>(mockBenefits);
    const [aiInsights] = useState<AIInsight[]>(mockAIInsights);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showBenefitDetail, setShowBenefitDetail] = useState<Benefit | null>(null);
    const [benefitFilter, setBenefitFilter] = useState('all');
    const [benefitSearch, setBenefitSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [newCard, setNewCard] = useState({ name: '', type: 'Visa', lastDigits: '', limit: '' });

    // <<-- INÍCIO DO CÓDIGO NOVO PARA BUSCAR DADOS
    useEffect(() => {
        const getCards = async () => {
            const { data, error } = await supabase
                .from('Cartoes')
                .select('*');

            if (error) {
                console.error('Erro ao buscar cartões:', error);
            } else if (data) {
                // Transforma os dados do banco para o formato esperado pelo frontend
                const formattedData = data.map(card => ({
                    id: card.id,
                    name: card.nome,
                    type: card.bandeira,
                    color: `${card.cor_primaria} ${card.cor_secundaria}`,
                    // Campos abaixo são placeholders, pois ainda não estão no banco
                    benefits: ['Benefício vindo do DB'],
                    points: 1000,
                    cashback: 10.50,
                    nextBenefit: 'Próximo benefício do DB',
                    limit: 5000,
                    lastDigits: '0000'
                }));
                setCards(formattedData);
            }
        };

        getCards();
    }, []);
    // <<-- FIM DO CÓDIGO NOVO PARA BUSCAR DADOS

    const totalPoints = cards.reduce((sum, card) => sum + card.points, 0);
    const totalCashback = cards.reduce((sum, card) => sum + card.cashback, 0);
    const unusedBenefits = benefits.filter(b => !b.used).length;
    const unreadNotifications = notifications.filter(n => !n.read).length;

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    const formatNumber = (value: number): string => {
        return new Intl.NumberFormat('pt-BR').format(value);
    }
    const formatDate = (date: string): string => {
        const d = new Date(date);
        const dUTC = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        return new Intl.DateTimeFormat('pt-BR').format(dUTC);
    }

    const filteredBenefits = benefits.filter(benefit => {
        const matchesCategory = benefitFilter === 'all' || benefit.category === benefitFilter;
        const matchesSearch = benefit.title.toLowerCase().includes(benefitSearch.toLowerCase()) ||
            benefit.description.toLowerCase().includes(benefitSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['all', ...Array.from(new Set(benefits.map(b => b.category)))];

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewCard(prev => ({ ...prev, [name]: value }));
    }

    const handleAddCard = async () => {
        if (newCard.name && newCard.lastDigits) {
          // Futuramente, aqui salvaremos no Supabase. Por enquanto, só no estado local.
          const cardToAdd: Card = {
            id: Date.now(),
            name: newCard.name,
            type: newCard.type,
            color: 'from-gray-600 to-gray-800',
            lastDigits: newCard.lastDigits,
            limit: parseInt(newCard.limit),
            benefits: ['Benefício Padrão'],
            points: 0,
            cashback: 0,
            nextBenefit: 'Configurar'
          };
          setCards(prevCards => [...prevCards, cardToAdd]);
          setNewCard({ name: '', type: 'Visa', lastDigits: '', limit: '' });
          setShowAddCardModal(false);
        }
      }

    const handleUseBenefit = (benefitId: number) => {
        setBenefits(benefits.map(b => (b.id === benefitId ? { ...b, used: true } : b)));
        setShowBenefitDetail(null);
    }

    const handleMarkNotificationRead = (notificationId: number) => {
        setNotifications(notifications.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
    }

    // Funções de Renderização (Render Functions)
    const renderDashboard = () => (
        <div className="space-y-6 animate-fade-in">
            {/* ...código do dashboard como antes... */}
        </div>
    );
    const renderCards = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Meus Cartões</h1>
                <button
                    onClick={() => setShowAddCardModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
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
                            <p className="text-sm opacity-75 mt-1">**** **** **** {card.lastDigits}</p>
                        </div>
                        <div className="p-6">
                            {/* ... outros detalhes do card ... */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderBenefits = () => ( <div className="space-y-6 animate-fade-in">{/* ... */}</div> );
    const renderAnalytics = () => ( <div className="space-y-6 animate-fade-in">{/* ... */}</div> );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return renderDashboard();
            case 'cards': return renderCards();
            case 'benefits': return renderBenefits();
            case 'analytics': return renderAnalytics();
            default: return renderDashboard();
        }
    }

    const navigation = [
        { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
        { id: 'cards', name: 'Cartões', icon: CreditCard },
        { id: 'benefits', name: 'Benefícios', icon: Gift },
        { id: 'analytics', name: 'Analytics', icon: TrendingUp }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 p-6">
                <div className="flex items-center justify-center h-16 mb-8">
                    <h1 className="text-2xl font-bold text-blue-600">UseBem</h1>
                </div>
                <nav className="space-y-2">
                    {navigation.map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}>
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                        <Menu className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold capitalize hidden lg:block">{activeTab}</h2>
                    <div className="flex items-center gap-4">
                       {/* ... ícones de header ... */}
                    </div>
                </header>
                <main className="flex-1 p-6 lg:p-10">
                    {renderContent()}
                </main>
            </div>
            
            {/* Sidebar Móvel */}
            {/* ... código da sidebar móvel ... */}

            {/* Modals */}
            <Modal isOpen={showAddCardModal} onClose={() => setShowAddCardModal(false)} title="Adicionar Novo Cartão">
                <form onSubmit={(e) => { e.preventDefault(); handleAddCard(); }}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Cartão</label>
                            <input type="text" name="name" id="name" value={newCard.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Inter Black" required />
                        </div>
                        <div>
                            <label htmlFor="lastDigits" className="block text-sm font-medium text-gray-700">Últimos 4 dígitos</label>
                            <input type="text" name="lastDigits" id="lastDigits" maxLength={4} value={newCard.lastDigits} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="1234" required />
                        </div>
                        <div>
                            <label htmlFor="limit" className="block text-sm font-medium text-gray-700">Limite (R$)</label>
                            <input type="number" name="limit" id="limit" value={newCard.limit} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="5000" required />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Bandeira</label>
                            <select name="type" id="type" value={newCard.type} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option>Visa</option>
                                <option>Mastercard</option>
                                <option>Elo</option>
                                <option>American Express</option>
                            </select>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400" disabled={!newCard.name || !newCard.lastDigits || !newCard.limit}>
                                <Save className="w-4 h-4" />
                                Salvar Cartão
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
            {/* ... outros modals ... */}
        </div>
    )
}