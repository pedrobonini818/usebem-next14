'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import TestConnection from '@/components/TestConnection'
import SmartSearch from '@/components/SmartSearch'
import UserProgramsManager from '@/components/UserProgramsManager'
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

// DADOS FALSOS (MOCK)
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
    const [cards, setCards] = useState<Card[]>([]);
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

    // Buscar dados do Supabase
    useEffect(() => {
        const getCards = async () => {
            console.log('🔍 Buscando cartões...');
            
            const { data, error } = await supabase
                .from('Cartoes')
                .select('*');

            if (error) {
                console.error('❌ Erro ao buscar cartões da tabela Cartoes:', error);
                
                console.log('🔄 Tentando buscar programas da nova estrutura...');
                
                const { data: programs, error: programsError } = await supabase
                    .from('benefit_programs')
                    .select('*, institution:institutions(*)')
                    .limit(5);

                if (programsError) {
                    console.error('❌ Erro ao buscar programas:', programsError);
                } else {
                    console.log('✅ Programas encontrados:', programs);
                    
                    const mockCardsFromPrograms = programs?.slice(0, 3).map((program, index) => ({
                        id: index + 1,
                        name: program.name,
                        type: program.institution?.brand_name || 'Visa',
                        color: ['from-blue-600 to-blue-800', 'from-purple-600 to-purple-800', 'from-green-600 to-green-800'][index],
                        benefits: ['Benefício do ' + program.name],
                        points: Math.floor(Math.random() * 5000),
                        cashback: Math.floor(Math.random() * 100),
                        nextBenefit: 'Próximo benefício',
                        limit: 5000,
                        lastDigits: (1000 + index).toString()
                    })) || [];
                    
                    setCards(mockCardsFromPrograms);
                }
                
            } else if (data) {
                console.log('✅ Dados da tabela Cartoes:', data);
                
                const formattedData = data.map(card => ({
                    id: card.id,
                    name: card.nome,
                    type: card.bandeira,
                    color: `${card.cor_primaria} ${card.cor_secundaria}`,
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

    // Funções de Renderização
    const renderDashboard = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Teste de Conexão */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">🧪 Teste de Conexão Supabase</h3>
                <TestConnection />
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Pontos Totais</p>
                            <p className="text-2xl font-bold">{formatNumber(totalPoints)}</p>
                        </div>
                        <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Cashback Acumulado</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalCashback)}</p>
                        </div>
                        <Wallet className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Benefícios Disponíveis</p>
                            <p className="text-2xl font-bold">{unusedBenefits}</p>
                        </div>
                        <Gift className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Cartões Ativos</p>
                            <p className="text-2xl font-bold">{cards.length}</p>
                        </div>
                        <CreditCard className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Insights da IA
                </h2>
                <div className="space-y-3">
                    {aiInsights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <PriorityIcon priority={insight.priority} />
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{insight.title}</h3>
                                <p className="text-gray-600 text-sm mt-1">{insight.message}</p>
                                {insight.action && (
                                    <button 
                                        onClick={() => setActiveTab('search')}
                                        className="text-blue-600 text-sm font-medium mt-2 hover:underline"
                                    >
                                        {insight.action}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
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
                    <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className={`bg-gradient-to-r ${card.color} p-6 text-white`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold">{card.name}</h3>
                                <CreditCard className="w-8 h-8" />
                            </div>
                            <p className="text-sm opacity-90">{card.type}</p>
                            <p className="text-sm opacity-75 mt-1">**** **** **** {card.lastDigits}</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-gray-600 text-sm">Pontos</p>
                                    <p className="font-semibold">{formatNumber(card.points)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Cashback</p>
                                    <p className="font-semibold">{formatCurrency(card.cashback)}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-600 text-sm">Próximo Benefício</p>
                                <p className="text-sm">{card.nextBenefit}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderBenefits = () => ( 
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold">Benefícios</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <Gift className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Seção de Benefícios em Construção
                </h3>
                <p className="text-gray-600 mb-4">
                    Em breve você poderá gerenciar todos os seus benefícios aqui
                </p>
                <button 
                    onClick={() => setActiveTab('search')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                    Buscar Ofertas Agora
                </button>
            </div>
        </div>
    );
    
    const renderAnalytics = () => ( 
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <BarChart3 className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Analytics em Desenvolvimento
                </h3>
                <p className="text-gray-600">
                    Em breve você terá insights detalhados sobre seus gastos e economia
                </p>
            </div>
        </div>
    );

    // NAVEGAÇÃO ATUALIZADA COM BUSCA E PROGRAMAS
    const navigation = [
        { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
        { id: 'search', name: 'Busca', icon: Search },
        { id: 'programs', name: 'Programas', icon: Award },
        { id: 'cards', name: 'Cartões', icon: CreditCard },
        { id: 'benefits', name: 'Benefícios', icon: Gift },
        { id: 'analytics', name: 'Analytics', icon: TrendingUp }
    ];

    // FUNÇÃO RENDERIZADORA PRINCIPAL COM TODAS AS FUNCIONALIDADES
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return renderDashboard();
            case 'search': return <SmartSearch />;
            case 'programs': return <UserProgramsManager />;
            case 'cards': return renderCards();
            case 'benefits': return renderBenefits();
            case 'analytics': return renderAnalytics();
            default: return renderDashboard();
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 p-6">
                <div className="flex items-center justify-center h-16 mb-8">
                    <h1 className="text-2xl font-bold text-blue-600">UseBem</h1>
                </div>
                <nav className="space-y-2">
                    {navigation.map(item => (
                        <button 
                            key={item.id} 
                            onClick={() => setActiveTab(item.id)} 
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                activeTab === item.id 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'hover:bg-gray-100'
                            }`}
                        >
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
                        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                            <Bell className="w-5 h-5" />
                            {unreadNotifications > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {unreadNotifications}
                                </span>
                            )}
                        </button>
                    </div>
                </header>
                <main className="flex-1 p-6 lg:p-10">
                    {renderContent()}
                </main>
            </div>

            {/* Modal */}
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
        </div>
    )
}