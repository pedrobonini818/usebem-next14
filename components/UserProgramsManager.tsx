// components/UserProgramsManager.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CreditCard, 
  Star, 
  Search, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Check, 
  AlertCircle, 
  Building, 
  Gift, 
  Eye,
  EyeOff,
  Target,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { supabaseQueries } from '@/lib/supabase';

const MOCK_USER_ID = 'user-123';

interface BenefitProgram {
  id: string;
  name: string;
  description: string | null;
  institution: {
    id: string;
    name: string;
    brand_name: string;
    logo_url: string | null;
    type: string;
  };
  program_type: {
    id: string;
    name: string;
    description: string | null;
    icon_name: string | null;
    color: string | null;
  } | null;
  requires_registration: boolean;
  registration_url: string | null;
  is_active: boolean;
}

interface UserProgram {
  id: string;
  program_id: string;
  user_card_number: string | null;
  user_nickname: string | null;
  is_primary: boolean;
  is_active: boolean;
  added_at: string;
  program: BenefitProgram;
}

interface AddProgramForm {
  program_id: string;
  nickname: string;
  card_number: string;
  show_card_number: boolean;
}

const UserProgramsManager = () => {
  const [userPrograms, setUserPrograms] = useState<UserProgram[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<BenefitProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editingProgram, setEditingProgram] = useState<UserProgram | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [addForm, setAddForm] = useState<AddProgramForm>({
    program_id: '',
    nickname: '',
    card_number: '',
    show_card_number: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: userProgs, error: userError } = await supabaseQueries.getUserPrograms(MOCK_USER_ID);
      const { data: availableProgs, error: availableError } = await supabaseQueries.getAllPrograms();

      if (userError && userError.message.includes('user_programs')) {
        console.log('📝 Tabela user_programs não existe ainda, simulando dados...');
        if (availableProgs && availableProgs.length > 0) {
          const mockUserPrograms = availableProgs.slice(0, 2).map((prog, index) => ({
            id: `mock-${index}`,
            program_id: prog.id,
            user_card_number: index === 0 ? null : '1234',
            user_nickname: index === 0 ? 'Meu Nubank' : 'Cartão Principal',
            is_primary: index === 0,
            is_active: true,
            added_at: new Date().toISOString(),
            program: prog
          }));
          setUserPrograms(mockUserPrograms);
        }
      } else if (userProgs) {
        setUserPrograms(userProgs);
      }

      if (availableError) {
        throw new Error(availableError.message);
      }

      setAvailablePrograms(availableProgs || []);
      console.log('✅ Dados carregados:', { userPrograms: userProgs?.length || 0, availablePrograms: availableProgs?.length || 0 });

    } catch (err: any) {
      console.error('❌ Erro ao carregar dados:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAvailablePrograms = () => {
    const userProgramIds = userPrograms.map(up => up.program_id);
    return availablePrograms.filter(prog => !userProgramIds.includes(prog.id));
  };

  const getFilteredUserPrograms = () => {
    return userPrograms.filter(program => {
      const matchesSearch = program.program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           program.program.institution.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (program.user_nickname && program.user_nickname.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'active' && program.is_active) ||
                           (filterType === 'primary' && program.is_primary) ||
                           (filterType === program.program.institution.type);
      
      return matchesSearch && matchesFilter;
    });
  };

  const handleAddProgram = async () => {
    if (!addForm.program_id || !addForm.nickname) {
      setError('Preencha os campos obrigatórios');
      return;
    }

    try {
      const { data, error } = await supabaseQueries.addUserProgram(
        MOCK_USER_ID,
        addForm.program_id,
        addForm.nickname,
        addForm.card_number || undefined
      );

      if (error) {
        console.log('⚠️ Simulando adição local do programa...');
        const program = availablePrograms.find(p => p.id === addForm.program_id);
        if (program) {
          const newUserProgram: UserProgram = {
            id: `local-${Date.now()}`,
            program_id: addForm.program_id,
            user_card_number: addForm.card_number || null,
            user_nickname: addForm.nickname,
            is_primary: userPrograms.length === 0,
            is_active: true,
            added_at: new Date().toISOString(),
            program: program
          };
          setUserPrograms(prev => [...prev, newUserProgram]);
        }
      } else {
        await loadData();
      }

      setSuccess('Programa adicionado com sucesso!');
      setShowAddModal(false);
      setAddForm({ program_id: '', nickname: '', card_number: '', show_card_number: false });
      
      setTimeout(() => setSuccess(null), 3000);

    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemoveProgram = async (programId: string) => {
    if (!confirm('Tem certeza que deseja remover este programa?')) return;

    try {
      setUserPrograms(prev => prev.filter(p => p.id !== programId));
      setSuccess('Programa removido com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditProgram = async (program: UserProgram, newNickname: string) => {
    try {
      setUserPrograms(prev => prev.map(p => 
        p.id === program.id 
          ? { ...p, user_nickname: newNickname }
          : p
      ));
      setEditingProgram(null);
      setSuccess('Programa atualizado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSetPrimary = async (programId: string) => {
    try {
      setUserPrograms(prev => prev.map(p => ({
        ...p,
        is_primary: p.id === programId
      })));
      setSuccess('Programa principal definido!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getProgramTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'bank': 'bg-blue-100 text-blue-800',
      'card_brand': 'bg-purple-100 text-purple-800',
      'retailer': 'bg-green-100 text-green-800',
      'fuel_station': 'bg-orange-100 text-orange-800',
      'service': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatCardNumber = (cardNumber: string | null) => {
    if (!cardNumber) return null;
    return '**** **** **** ' + cardNumber.slice(-4);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Carregando seus programas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Programas</h1>
          <p className="text-gray-600 mt-2">
            Gerencie seus cartões e programas de benefícios para otimizar suas vantagens
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Programa</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Programas</p>
              <p className="text-2xl font-bold text-gray-900">{userPrograms.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Programas Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{userPrograms.filter(p => p.is_active).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Programa Principal</p>
              <p className="text-lg font-bold text-gray-900">
                {userPrograms.find(p => p.is_primary)?.user_nickname || 'Nenhum'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Gift className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Disponíveis</p>
              <p className="text-2xl font-bold text-gray-900">{getAvailablePrograms().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, instituição ou apelido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Todos os tipos</option>
            <option value="active">Apenas ativos</option>
            <option value="primary">Programa principal</option>
            <option value="bank">Bancos</option>
            <option value="card_brand">Bandeiras</option>
            <option value="retailer">Varejo</option>
            <option value="fuel_station">Postos</option>
          </select>
        </div>
      </div>

      {/* User Programs List */}
      <div className="space-y-4">
        {getFilteredUserPrograms().length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {userPrograms.length === 0 ? 'Nenhum programa adicionado' : 'Nenhum programa encontrado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {userPrograms.length === 0 
                ? 'Adicione seus cartões e programas de benefícios para começar a otimizar suas vantagens'
                : 'Tente ajustar os filtros de busca para encontrar o programa desejado'
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Adicionar Primeiro Programa
            </button>
          </div>
        ) : (
          getFilteredUserPrograms().map((userProgram) => (
            <div
              key={userProgram.id}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                userProgram.is_primary ? 'border-blue-200 bg-blue-50' : 'border-gray-100'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      userProgram.program.institution.logo_url ? 'bg-white' : 'bg-gray-100'
                    }`}>
                      {userProgram.program.institution.logo_url ? (
                        <img 
                          src={userProgram.program.institution.logo_url} 
                          alt={userProgram.program.institution.brand_name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <Building className="w-6 h-6 text-gray-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {editingProgram?.id === userProgram.id ? (
                          <input
                            type="text"
                            defaultValue={userProgram.user_nickname || ''}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleEditProgram(userProgram, (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="text-xl font-bold bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                        ) : (
                          <h3 className="text-xl font-bold text-gray-900">
                            {userProgram.user_nickname || userProgram.program.name}
                          </h3>
                        )}
                        
                        {userProgram.is_primary && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            Principal
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-2">
                        {userProgram.program.name} • {userProgram.program.institution.brand_name}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getProgramTypeColor(userProgram.program.institution.type)
                        }`}>
                          {userProgram.program.institution.type === 'bank' ? 'Banco' :
                           userProgram.program.institution.type === 'card_brand' ? 'Bandeira' :
                           userProgram.program.institution.type === 'retailer' ? 'Varejo' :
                           userProgram.program.institution.type === 'fuel_station' ? 'Posto' : 'Serviço'}
                        </span>
                        
                        {userProgram.user_card_number && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            {formatCardNumber(userProgram.user_card_number)}
                          </span>
                        )}
                        
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Adicionado em {new Date(userProgram.added_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!userProgram.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(userProgram.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Definir como principal"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => setEditingProgram(editingProgram?.id === userProgram.id ? null : userProgram)}
                      className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Editar apelido"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleRemoveProgram(userProgram.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover programa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {userProgram.program.description && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{userProgram.program.description}</p>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                    <Target className="w-4 h-4" />
                    Ver Ofertas
                  </button>
                  
                  {userProgram.program.registration_url && (
                    <a
                      href={userProgram.program.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Site Oficial
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Program Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Adicionar Programa de Benefícios</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione o Programa *
                </label>
                <select
                  value={addForm.program_id}
                  onChange={(e) => setAddForm(prev => ({ ...prev, program_id: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Escolha um programa...</option>
                  {getAvailablePrograms().map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name} - {program.institution.brand_name}
                    </option>
                  ))}
                </select>
                {getAvailablePrograms().length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    Você já adicionou todos os programas disponíveis!
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apelido do Programa *
                </label>
                <input
                  type="text"
                  value={addForm.nickname}
                  onChange={(e) => setAddForm(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="Ex: Meu Nubank, Cartão Principal, Inter Black..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use um nome que ajude você a identificar facilmente este programa
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Últimos 4 dígitos do cartão (opcional)
                </label>
                <div className="relative">
                  <input
                    type={addForm.show_card_number ? "text" : "password"}
                    value={addForm.card_number}
                    onChange={(e) => setAddForm(prev => ({ ...prev, card_number: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    placeholder="1234"
                    maxLength={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setAddForm(prev => ({ ...prev, show_card_number: !prev.show_card_number }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {addForm.show_card_number ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ajuda a identificar o cartão específico (informação criptografada e segura)
                </p>
              </div>

              {addForm.program_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  {(() => {
                    const selectedProgram = availablePrograms.find(p => p.id === addForm.program_id);
                    if (!selectedProgram) return null;
                    
                    return (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900">{selectedProgram.name}</h4>
                          <p className="text-sm text-blue-700">{selectedProgram.institution.brand_name}</p>
                          {selectedProgram.description && (
                            <p className="text-xs text-blue-600 mt-1">{selectedProgram.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddProgram}
                  disabled={!addForm.program_id || !addForm.nickname || getAvailablePrograms().length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Adicionar Programa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProgramsManager;