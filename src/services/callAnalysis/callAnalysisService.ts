/**
 * RepSpheres CRM - Call Analysis Service
 * 
 * This service manages call analysis operations, integrating with
 * the linguistics module and Supabase database.
 */

import { supabase } from '../supabase/supabase';
import { LinguisticsService } from '../linguistics/linguisticsService';
import AdvancedLinguisticsService from '../linguistics/advancedLinguisticsService';
import { CallAnalysis, CallAnalysisFilterOptions, LinguisticsAnalysis } from '../../types';
import mockDataService from '../mockData/mockDataService';

/**
 * Service for call analysis operations
 */
export const CallAnalysisService = {
  /**
   * Get all call analyses
   */
  async getAllCallAnalyses(): Promise<CallAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('call_analysis')
        .select('*')
        .order('call_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching call analyses:', error);
        // Return mock data if the table doesn't exist or there's an error
        console.log('Falling back to mock call analyses data');
        return mockDataService.generateMockCallAnalyses(10);
      }
      
      return data as CallAnalysis[];
    } catch (err) {
      console.error('Error fetching call analyses:', err);
      // Return mock data if there's an exception
      console.log('Falling back to mock call analyses data');
      return mockDataService.generateMockCallAnalyses(10);
    }
  },
  
  /**
   * Get call analyses with filters
   */
  async getCallAnalyses(filters: CallAnalysisFilterOptions): Promise<CallAnalysis[]> {
    let query = supabase
      .from('call_analysis')
      .select('*');
    
    // Apply filters
    if (filters.startDate) {
      query = query.gte('call_date', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('call_date', filters.endDate);
    }
    
    if (filters.contactId) {
      query = query.eq('contact_id', filters.contactId);
    }
    
    if (filters.practiceId) {
      query = query.eq('practice_id', filters.practiceId);
    }
    
    if (filters.minDuration !== undefined) {
      query = query.gte('duration', filters.minDuration);
    }
    
    if (filters.maxDuration !== undefined) {
      query = query.lte('duration', filters.maxDuration);
    }
    
    if (filters.minSentiment !== undefined) {
      query = query.gte('sentiment_score', filters.minSentiment);
    }
    
    if (filters.maxSentiment !== undefined) {
      query = query.lte('sentiment_score', filters.maxSentiment);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      // For array fields like tags, we need to check if any of the tags are in the array
      query = query.or(filters.tags.map(tag => `tags.cs.{${tag}}`).join(','));
    }
    
    if (filters.hasTranscript !== undefined) {
      if (filters.hasTranscript) {
        query = query.not('transcript', 'is', null);
      } else {
        query = query.is('transcript', null);
      }
    }
    
    const { data, error } = await query.order('call_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching filtered call analyses:', error);
      return [];
    }
    
    return data as CallAnalysis[];
  },
  
  /**
   * Get a call analysis by ID
   */
  async getCallAnalysisById(id: string): Promise<CallAnalysis | null> {
    const { data, error } = await supabase
      .from('call_analysis')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching call analysis ${id}:`, error);
      return null;
    }
    
    return data as CallAnalysis;
  },
  
  /**
   * Create a new call analysis
   */
  async createCallAnalysis(callAnalysis: Omit<CallAnalysis, 'id' | 'created_at' | 'updated_at'>): Promise<CallAnalysis | null> {
    const { data, error } = await supabase
      .from('call_analysis')
      .insert([callAnalysis])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating call analysis:', error);
      return null;
    }
    
    return data as CallAnalysis;
  },
  
  /**
   * Update a call analysis
   */
  async updateCallAnalysis(id: string, updates: Partial<CallAnalysis>): Promise<CallAnalysis | null> {
    const { data, error } = await supabase
      .from('call_analysis')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating call analysis ${id}:`, error);
      return null;
    }
    
    return data as CallAnalysis;
  },
  
  /**
   * Delete a call analysis
   */
  async deleteCallAnalysis(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('call_analysis')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting call analysis ${id}:`, error);
      return false;
    }
    
    return true;
  },
  
  /**
   * Submit a call for linguistics analysis
   */
  async submitCallForLinguisticsAnalysis(callId: string, recordingUrl: string, transcript?: string): Promise<string | null> {
    // Submit to linguistics service
    const result = await LinguisticsService.submitCallForAnalysis(callId, recordingUrl, transcript);
    
    if (!result) {
      return null;
    }
    
    // Update the call analysis with the linguistics analysis ID
    const { error } = await supabase
      .from('call_analysis')
      .update({ linguistics_analysis_id: result.analysisId })
      .eq('id', callId);
    
    if (error) {
      console.error(`Error updating call analysis ${callId} with linguistics analysis ID:`, error);
      return null;
    }
    
    return result.analysisId;
  },
  
  /**
   * Get linguistics analysis for a call
   */
  async getLinguisticsAnalysis(callId: string): Promise<LinguisticsAnalysis | null> {
    try {
      // First get the call analysis to find the linguistics analysis ID
      const { data: callAnalysis, error: callError } = await supabase
        .from('call_analysis')
        .select('linguistics_analysis_id')
        .eq('id', callId)
        .single();
      
      if (callError || !callAnalysis || !callAnalysis.linguistics_analysis_id) {
        console.error(`Error fetching linguistics analysis ID for call ${callId}:`, callError);
        return null;
      }
      
      // Then get the linguistics analysis directly from the linguistics_analysis table
      const { data, error } = await supabase
        .from('linguistics_analysis')
        .select('*')
        .eq('id', callAnalysis.linguistics_analysis_id)
        .single();
        
      if (error) {
        console.error(`Error fetching linguistics analysis for ID ${callAnalysis.linguistics_analysis_id}:`, error);
        return null;
      }
      
      return data as LinguisticsAnalysis;
    } catch (err) {
      console.error(`Error in getLinguisticsAnalysis for call ${callId}:`, err);
      return null;
    }
  },
  
  /**
   * Link a call analysis to a linguistics analysis
   */
  async linkCallToLinguisticsAnalysis(callId: string, linguisticsAnalysisId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('call_analysis')
        .update({ linguistics_analysis_id: linguisticsAnalysisId })
        .eq('id', callId);
      
      if (error) {
        console.error(`Error linking call ${callId} to linguistics analysis ${linguisticsAnalysisId}:`, error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error(`Error in linkCallToLinguisticsAnalysis:`, err);
      return false;
    }
  },
  
  /**
   * Get linguistics analysis status for a call
   */
  async getLinguisticsAnalysisStatus(callId: string): Promise<'pending' | 'processing' | 'completed' | 'failed' | 'not_found'> {
    // First get the call analysis to find the linguistics analysis ID
    const { data: callAnalysis, error: callError } = await supabase
      .from('call_analysis')
      .select('linguistics_analysis_id')
      .eq('id', callId)
      .single();
    
    if (callError || !callAnalysis || !callAnalysis.linguistics_analysis_id) {
      console.error(`Error fetching linguistics analysis ID for call ${callId}:`, callError);
      return 'not_found';
    }
    
    // Then get the linguistics analysis status from the linguistics service
    return await LinguisticsService.getAnalysisStatus(callAnalysis.linguistics_analysis_id);
  },
  
  /**
   * Get recent calls for a contact
   */
  async getRecentCallsForContact(contactId: string, limit: number = 5): Promise<CallAnalysis[]> {
    const { data, error } = await supabase
      .from('call_analysis')
      .select('*')
      .eq('contact_id', contactId)
      .order('call_date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error(`Error fetching recent calls for contact ${contactId}:`, error);
      return [];
    }
    
    return data as CallAnalysis[];
  },
  
  /**
   * Get recent calls for a practice
   */
  async getRecentCallsForPractice(practiceId: string, limit: number = 5): Promise<CallAnalysis[]> {
    const { data, error } = await supabase
      .from('call_analysis')
      .select('*')
      .eq('practice_id', practiceId)
      .order('call_date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error(`Error fetching recent calls for practice ${practiceId}:`, error);
      return [];
    }
    
    return data as CallAnalysis[];
  },
  
  /**
   * Get calls by tag
   */
  async getCallsByTag(tag: string): Promise<CallAnalysis[]> {
    const { data, error } = await supabase
      .from('call_analysis')
      .select('*')
      .contains('tags', [tag])
      .order('call_date', { ascending: false });
    
    if (error) {
      console.error(`Error fetching calls with tag ${tag}:`, error);
      return [];
    }
    
    return data as CallAnalysis[];
  },
  
  /**
   * Get calls with high sentiment score
   */
  async getCallsWithHighSentiment(threshold: number = 0.7, limit: number = 10): Promise<CallAnalysis[]> {
    const { data, error } = await supabase
      .from('call_analysis')
      .select('*')
      .gte('sentiment_score', threshold)
      .order('sentiment_score', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error(`Error fetching calls with high sentiment:`, error);
      return [];
    }
    
    return data as CallAnalysis[];
  },
  
  /**
   * Get calls with low sentiment score
   */
  async getCallsWithLowSentiment(threshold: number = -0.3, limit: number = 10): Promise<CallAnalysis[]> {
    const { data, error } = await supabase
      .from('call_analysis')
      .select('*')
      .lte('sentiment_score', threshold)
      .order('sentiment_score', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error(`Error fetching calls with low sentiment:`, error);
      return [];
    }
    
    return data as CallAnalysis[];
  },

  /**
   * Get advanced linguistics analysis for a call
   */
  async getAdvancedLinguisticsAnalysis(callId: string) {
    try {
      const analysis = await AdvancedLinguisticsService.getAnalysisByCallId(callId);
      return analysis;
    } catch (error) {
      console.error(`Error fetching advanced linguistics analysis for call ${callId}:`, error);
      return null;
    }
  },

  /**
   * Create advanced linguistics analysis for a call
   */
  async createAdvancedLinguisticsAnalysis(callId: string, transcript: string, audioUrl?: string) {
    try {
      const analysis = await AdvancedLinguisticsService.analyzeCallTranscript(callId, transcript, audioUrl);
      return analysis;
    } catch (error) {
      console.error(`Error creating advanced linguistics analysis for call ${callId}:`, error);
      return null;
    }
  }
};
