export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'elite'
          subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          ai_requests_count: number
          ai_requests_reset_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'elite'
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          ai_requests_count?: number
          ai_requests_reset_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'elite'
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          ai_requests_count?: number
          ai_requests_reset_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      columns: {
        Row: {
          id: string
          user_id: string
          workspace_id: string | null
          title: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workspace_id?: string | null
          title: string
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workspace_id?: string | null
          title?: string
          position?: number
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          workspace_id: string | null
          column_id: string
          title: string
          description: string | null
          notes: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workspace_id?: string | null
          column_id: string
          title: string
          description?: string | null
          notes?: string | null
          position: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workspace_id?: string | null
          column_id?: string
          title?: string
          description?: string | null
          notes?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          task_id: string
          start_time: string
          end_time: string | null
          duration: number
          target_duration: number
          focus_quality: number | null
          reflection: Json | null
          distractions: string[]
          ai_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          start_time: string
          end_time?: string | null
          duration: number
          target_duration: number
          focus_quality?: number | null
          reflection?: Json | null
          distractions?: string[]
          ai_summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          start_time?: string
          end_time?: string | null
          duration?: number
          target_duration?: number
          focus_quality?: number | null
          reflection?: Json | null
          distractions?: string[]
          ai_summary?: string | null
          created_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          total_focus_time: number
          total_distraction_time: number
          current_streak: number
          longest_streak: number
          last_session_date: string | null
          sessions_completed: number
          average_focus_quality: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_focus_time?: number
          total_distraction_time?: number
          current_streak?: number
          longest_streak?: number
          last_session_date?: string | null
          sessions_completed?: number
          average_focus_quality?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_focus_time?: number
          total_distraction_time?: number
          current_streak?: number
          longest_streak?: number
          last_session_date?: string | null
          sessions_completed?: number
          average_focus_quality?: number
          updated_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          challenge_type: string
          requirements: Json
          reward_badge: string
          reward_description: string
          tier_restriction: 'free' | 'pro' | 'elite' | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          challenge_type: string
          requirements: Json
          reward_badge: string
          reward_description: string
          tier_restriction?: 'free' | 'pro' | 'elite' | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          challenge_type?: string
          requirements?: Json
          reward_badge?: string
          reward_description?: string
          tier_restriction?: 'free' | 'pro' | 'elite' | null
          active?: boolean
          created_at?: string
        }
      }
      user_challenges: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          progress: number
          completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          progress?: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          progress?: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_name: string
          badge_description: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_name: string
          badge_description: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_name?: string
          badge_description?: string
          earned_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          workspace_type: 'personal' | 'team'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          workspace_type?: 'personal' | 'team'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          workspace_type?: 'personal' | 'team'
          created_at?: string
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
        }
      }
      flow_templates: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string
          category: string
          template_data: Json
          is_public: boolean
          is_premium: boolean
          price: number | null
          uses_count: number
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description: string
          category: string
          template_data: Json
          is_public?: boolean
          is_premium?: boolean
          price?: number | null
          uses_count?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string
          category?: string
          template_data?: Json
          is_public?: boolean
          is_premium?: boolean
          price?: number | null
          uses_count?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      accountability_pairs: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          status: 'pending' | 'active' | 'ended'
          created_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          status?: 'pending' | 'active' | 'ended'
          created_at?: string
          ended_at?: string | null
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          status?: 'pending' | 'active' | 'ended'
          created_at?: string
          ended_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'pro' | 'elite'
      subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing'
      workspace_type: 'personal' | 'team'
      workspace_role: 'owner' | 'admin' | 'member'
      pair_status: 'pending' | 'active' | 'ended'
    }
  }
}
