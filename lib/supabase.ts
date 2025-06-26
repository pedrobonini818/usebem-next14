// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types baseados no schema
export interface Institution {
  id: string
  name: string
  brand_name: string | null
  logo_url: string | null
  website_url: string | null
  type: 'bank' | 'card_brand' | 'retailer' | 'fuel_station' | 'service'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProgramType {
  id: string
  name: string
  description: string | null
  icon_name: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export interface BenefitProgram {
  id: string
  institution_id: string
  program_type_id: string | null
  name: string
  description: string | null
  terms_url: string | null
  is_active: boolean
  requires_registration: boolean
  registration_url: string | null
  created_at: string
  updated_at: string
  institution?: Institution
  program_type?: ProgramType
}

export interface OfferCategory {
  id: string
  name: string
  parent_id: string | null
  icon_name: string | null
  created_at: string
}

export interface Merchant {
  id: string
  name: string
  brand_name: string | null
  logo_url: string | null
  website_url: string | null
  category_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  category?: OfferCategory
}

export interface Offer {
  id: string
  program_id: string
  merchant_id: string | null
  category_id: string | null
  title: string
  description: string | null
  offer_type: 'cashback' | 'points' | 'discount' | 'bonus'
  cashback_percentage: number | null
  points_multiplier: number | null
  discount_percentage: number | null
  discount_fixed_amount: number | null
  minimum_purchase: number | null
  maximum_benefit: number | null
  valid_from: string | null
  valid_until: string | null
  terms_and_conditions: string | null
  max_uses_per_user: number | null
  is_unlimited: boolean
  is_active: boolean
  priority_score: number
  created_at: string
  updated_at: string
  program?: BenefitProgram
  merchant?: Merchant
  category?: OfferCategory
}

export interface UserProgram {
  id: string
  user_id: string
  program_id: string
  user_card_number: string | null
  user_nickname: string | null
  is_primary: boolean
  is_active: boolean
  added_at: string
  last_used_at: string | null
  program?: BenefitProgram
}

export interface UsageHistory {
  id: string
  user_id: string
  offer_id: string | null
  program_id: string
  merchant_id: string | null
  purchase_amount: number | null
  benefit_earned: number | null
  benefit_type: string | null
  used_at: string
  notes: string | null
}

// Funções utilitárias para queries
export const supabaseQueries = {
  // Buscar programas disponíveis
  async getAllPrograms() {
    const { data, error } = await supabase
      .from('benefit_programs')
      .select('*, institution:institutions(*), program_type:program_types(*)')
      .eq('is_active', true)
      .order('name')
    
    return { data, error }
  },

  // Buscar programas do usuário
  async getUserPrograms(userId: string) {
    const { data, error } = await supabase
      .from('user_programs')
      .select('*, program:benefit_programs(*, institution:institutions(*), program_type:program_types(*))')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('added_at', { ascending: false })
    
    return { data, error }
  },

  // Adicionar programa para o usuário
  async addUserProgram(userId: string, programId: string, nickname?: string, cardNumber?: string) {
    const { data, error } = await supabase
      .from('user_programs')
      .insert({
        user_id: userId,
        program_id: programId,
        user_nickname: nickname,
        user_card_number: cardNumber
      })
      .select()
    
    return { data, error }
  },

  // Buscar ofertas do usuário com base nos seus programas
  async getUserOffers(userId: string, searchTerm?: string) {
    // Usar a função SQL criada no schema
    const { data, error } = await supabase
      .rpc('get_user_offers', {
        p_user_id: userId,
        p_search_term: searchTerm || null
      })
    
    return { data, error }
  },

  // Buscar ofertas por categoria
  async getOffersByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from('offers')
      .select('*, program:benefit_programs(*, institution:institutions(*)), merchant:merchants(*), category:offer_categories(*)')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .or('valid_until.is.null,valid_until.gt.now()')
      .order('priority_score', { ascending: false })
    
    return { data, error }
  },

  // Buscar ofertas em destaque
  async getFeaturedOffers() {
    const { data, error } = await supabase
      .from('v_featured_offers')
      .select('*')
      .limit(10)
    
    return { data, error }
  },

  // Registrar uso de uma oferta
  async recordUsage(userId: string, offerId: string, programId: string, purchaseAmount?: number, benefitEarned?: number, benefitType?: string) {
    const { data, error } = await supabase
      .from('usage_history')
      .insert({
        user_id: userId,
        offer_id: offerId,
        program_id: programId,
        purchase_amount: purchaseAmount,
        benefit_earned: benefitEarned,
        benefit_type: benefitType
      })
      .select()
    
    return { data, error }
  },

  // Buscar categorias principais
  async getMainCategories() {
    const { data, error } = await supabase
      .from('offer_categories')
      .select('*')
      .is('parent_id', null)
      .order('name')
    
    return { data, error }
  },

  // Buscar subcategorias
  async getSubCategories(parentId: string) {
    const { data, error } = await supabase
      .from('offer_categories')
      .select('*')
      .eq('parent_id', parentId)
      .order('name')
    
    return { data, error }
  },

  // Estatísticas do usuário
  async getUserStats(userId: string) {
    // Pontos totais (simulado - você pode ajustar conforme a lógica real)
    const { data: usageData, error: usageError } = await supabase
      .from('usage_history')
      .select('benefit_earned, benefit_type')
      .eq('user_id', userId)

    // Programas ativos
    const { data: programsData, error: programsError } = await supabase
      .from('user_programs')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)

    // Ofertas disponíveis
    const { data: offersData, error: offersError } = await supabase
      .rpc('get_user_offers', { p_user_id: userId })

    if (usageError || programsError || offersError) {
      return { 
        data: null, 
        error: usageError || programsError || offersError 
      }
    }

    // Calcular totais
    const totalCashback = usageData
      ?.filter(item => item.benefit_type === 'cashback')
      .reduce((sum, item) => sum + (item.benefit_earned || 0), 0) || 0

    const totalPoints = usageData
      ?.filter(item => item.benefit_type === 'points')
      .reduce((sum, item) => sum + (item.benefit_earned || 0), 0) || 0

    return {
      data: {
        totalPoints: Math.round(totalPoints),
        totalCashback: totalCashback,
        activePrograms: programsData?.length || 0,
        availableOffers: offersData?.length || 0
      },
      error: null
    }
  },

  // Registrar busca para analytics
  async logSearch(userId: string | null, searchQuery: string, resultsCount: number) {
    const { data, error } = await supabase
      .from('search_logs')
      .insert({
        user_id: userId,
        search_query: searchQuery,
        results_count: resultsCount
      })
    
    return { data, error }
  }
}

// Hook personalizado para autenticação
export const useAuth = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    loading,
    signIn: (email: string, password: string) => 
      supabase.auth.signInWithPassword({ email, password }),
    signUp: (email: string, password: string) => 
      supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut()
  }
}