/**
 * Market Data Service
 * Connects to the enriched market_data_jg database to provide
 * comprehensive procedure intelligence to the CRM
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Market data database connection (separate from CRM database)
const MARKET_DATA_URL = process.env.REACT_APP_MARKET_DATA_SUPABASE_URL || '';
const MARKET_DATA_ANON_KEY = process.env.REACT_APP_MARKET_DATA_SUPABASE_ANON_KEY || '';

let marketDataClient: SupabaseClient | null = null;

if (MARKET_DATA_URL && MARKET_DATA_ANON_KEY) {
  marketDataClient = createClient(MARKET_DATA_URL, MARKET_DATA_ANON_KEY);
}

export interface EnrichedProcedure {
  id: string;
  procedure_name: string;
  category: string;
  category_id: number;
  average_cost_usd: number;
  patient_satisfaction_score: number;
  market_size_us: number;
  market_size_eu: number;
  yearly_growth_percentage: number;
  complexity: string;
  robotics_ai_used: boolean;
  company_name?: string;
  avg_reimbursement_usd?: number;
  avg_out_of_pocket_usd?: number;
  expanded_description?: {
    modes?: {
      market?: MarketModeData;
      sales?: SalesModeData;
      seo?: SEOModeData;
    };
  };
}

export interface MarketModeData {
  global_market_value?: string;
  growth_rate?: string;
  demographics?: {
    primary_age?: string;
    reasons?: string[];
  };
  market_leaders?: string[];
  innovation_trends?: string[];
  trend_alert?: string;
}

export interface SalesModeData {
  elevator_pitch?: string;
  talk_tracks?: string[];
  roi_calculator?: {
    procedure_revenue?: number;
    lifetime_maintenance?: number;
    total_practice_value?: number;
    referral_potential?: string;
  };
  objection_handlers?: {
    [key: string]: string;
  };
  bundle_opportunities?: any;
  social_proof?: string;
}

export interface SEOModeData {
  primary_keywords?: {
    [keyword: string]: number;
  };
  voice_search?: string[];
  content_opportunities?: {
    quick_wins?: string[];
    schema_markup?: string;
    gmb_categories?: string[];
  };
  competitive_edge?: string;
  local_domination?: string;
}

export interface ProcedureRecommendation {
  procedure: EnrichedProcedure;
  fit_score: number;
  reasoning: string[];
  opportunity_size: number;
  implementation_difficulty: 'low' | 'medium' | 'high';
}

class MarketDataService {
  /**
   * Get all enriched procedures
   */
  async getAllProcedures(): Promise<EnrichedProcedure[]> {
    if (!marketDataClient) {
      console.warn('Market data client not initialized');
      return [];
    }

    try {
      const [dentalData, aestheticData] = await Promise.all([
        marketDataClient
          .from('dental_procedures')
          .select('*')
          .order('patient_satisfaction_score', { ascending: false }),
        marketDataClient
          .from('aesthetic_procedures')
          .select('*')
          .order('patient_satisfaction_score', { ascending: false })
      ]);

      if (dentalData.error) throw dentalData.error;
      if (aestheticData.error) throw aestheticData.error;

      // Parse expanded descriptions
      const parseProcedures = (procedures: any[], type: string) => {
        return procedures.map(proc => ({
          ...proc,
          industry: type,
          expanded_description: this.parseExpandedDescription(proc.expanded_description)
        }));
      };

      const dental = parseProcedures(dentalData.data || [], 'dental');
      const aesthetic = parseProcedures(aestheticData.data || [], 'aesthetic');

      return [...dental, ...aesthetic];
    } catch (error) {
      console.error('Error fetching market data:', error);
      return [];
    }
  }

  /**
   * Get procedures by category
   */
  async getProceduresByCategory(categoryId: number): Promise<EnrichedProcedure[]> {
    if (!marketDataClient) return [];

    try {
      const [dentalData, aestheticData] = await Promise.all([
        marketDataClient
          .from('dental_procedures')
          .select('*')
          .eq('category_id', categoryId),
        marketDataClient
          .from('aesthetic_procedures')
          .select('*')
          .eq('category_id', categoryId)
      ]);

      const procedures = [
        ...(dentalData.data || []).map(p => ({ ...p, industry: 'dental' })),
        ...(aestheticData.data || []).map(p => ({ ...p, industry: 'aesthetic' }))
      ];

      return procedures.map(proc => ({
        ...proc,
        expanded_description: this.parseExpandedDescription(proc.expanded_description)
      }));
    } catch (error) {
      console.error('Error fetching procedures by category:', error);
      return [];
    }
  }

  /**
   * Get procedure recommendations for a practice
   */
  async getRecommendations(practiceProfile: {
    type: string;
    size: string;
    procedures: string[];
    annual_revenue?: number;
  }): Promise<ProcedureRecommendation[]> {
    const allProcedures = await this.getAllProcedures();
    
    // Filter procedures not currently offered
    const currentProcedureNames = practiceProfile.procedures.map(p => p.toLowerCase());
    const potentialProcedures = allProcedures.filter(
      proc => proc.procedure_name && !currentProcedureNames.includes(proc.procedure_name.toLowerCase())
    );

    // Score each procedure
    const recommendations = potentialProcedures.map(proc => {
      const scores = {
        marketGrowth: this.scoreMarketGrowth(proc),
        satisfaction: this.scoreSatisfaction(proc),
        revenue: this.scoreRevenue(proc),
        complexity: this.scoreComplexity(proc, practiceProfile.size),
        marketSize: this.scoreMarketSize(proc)
      };

      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

      const reasoning = this.generateReasoning(proc, scores);
      const opportunitySize = this.calculateOpportunitySize(proc, practiceProfile);
      const difficulty = this.assessDifficulty(proc);

      return {
        procedure: proc,
        fit_score: Math.round(totalScore),
        reasoning,
        opportunity_size: opportunitySize,
        implementation_difficulty: difficulty
      };
    });

    // Sort by fit score and return top recommendations
    return recommendations
      .sort((a, b) => b.fit_score - a.fit_score)
      .slice(0, 10);
  }

  /**
   * Get mode-specific data for a procedure
   */
  getModeData(procedure: EnrichedProcedure, mode: 'market' | 'sales' | 'seo') {
    return procedure.expanded_description?.modes?.[mode] || null;
  }

  /**
   * Search procedures by keyword
   */
  async searchProcedures(keyword: string): Promise<EnrichedProcedure[]> {
    const allProcedures = await this.getAllProcedures();
    const searchTerm = keyword.toLowerCase();
    
    return allProcedures.filter(proc => 
      proc.procedure_name.toLowerCase().includes(searchTerm) ||
      proc.category?.toLowerCase().includes(searchTerm) ||
      proc.company_name?.toLowerCase().includes(searchTerm)
    );
  }

  // Private helper methods
  private parseExpandedDescription(description: any): any {
    if (!description) return null;
    if (typeof description === 'object') return description;
    
    try {
      return JSON.parse(description);
    } catch {
      return null;
    }
  }

  private scoreMarketGrowth(proc: EnrichedProcedure): number {
    const growth = proc.yearly_growth_percentage || 0;
    if (growth > 15) return 100;
    if (growth > 10) return 85;
    if (growth > 7) return 70;
    if (growth > 5) return 55;
    return 40;
  }

  private scoreSatisfaction(proc: EnrichedProcedure): number {
    return proc.patient_satisfaction_score || 0;
  }

  private scoreRevenue(proc: EnrichedProcedure): number {
    const revenue = proc.average_cost_usd || 0;
    if (revenue > 5000) return 100;
    if (revenue > 3000) return 85;
    if (revenue > 2000) return 70;
    if (revenue > 1000) return 55;
    return 40;
  }

  private scoreComplexity(proc: EnrichedProcedure, practiceSize: string): number {
    const complexity = proc.complexity?.toLowerCase() || 'medium';
    const sizeScore = practiceSize === 'large' ? 1 : practiceSize === 'medium' ? 0.7 : 0.4;
    
    if (complexity === 'low') return 90;
    if (complexity === 'medium') return 70 * sizeScore;
    return 50 * sizeScore;
  }

  private scoreMarketSize(proc: EnrichedProcedure): number {
    const marketSize = proc.market_size_us || 0;
    if (marketSize > 5000) return 100;
    if (marketSize > 1000) return 80;
    if (marketSize > 500) return 60;
    return 40;
  }

  private generateReasoning(proc: EnrichedProcedure, scores: any): string[] {
    const reasons = [];
    
    if (scores.marketGrowth > 70) {
      reasons.push(`High growth market (${proc.yearly_growth_percentage}% annually)`);
    }
    
    if (scores.satisfaction > 90) {
      reasons.push(`Exceptional patient satisfaction (${proc.patient_satisfaction_score}%)`);
    }
    
    if (scores.revenue > 70) {
      reasons.push(`Strong revenue potential ($${proc.average_cost_usd} per procedure)`);
    }
    
    if (proc.robotics_ai_used) {
      reasons.push('Cutting-edge technology differentiator');
    }
    
    if (proc.market_size_us > 1000) {
      reasons.push(`Large addressable market ($${(proc.market_size_us / 1000).toFixed(1)}B)`);
    }
    
    return reasons;
  }

  private calculateOpportunitySize(proc: EnrichedProcedure, practice: any): number {
    // Estimate based on practice size and procedure value
    const monthlyVolume = practice.size === 'large' ? 20 : practice.size === 'medium' ? 10 : 5;
    const annualRevenue = monthlyVolume * 12 * (proc.average_cost_usd || 0);
    return Math.round(annualRevenue);
  }

  private assessDifficulty(proc: EnrichedProcedure): 'low' | 'medium' | 'high' {
    if (proc.complexity === 'Low' && !proc.robotics_ai_used) return 'low';
    if (proc.complexity === 'High' || proc.robotics_ai_used) return 'high';
    return 'medium';
  }
}

export const marketDataService = new MarketDataService();
export default marketDataService;