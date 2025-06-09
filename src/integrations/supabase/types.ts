export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      pose_completions: {
        Row: {
          completed_at: string | null
          day_number: number
          id: string
          pose_name: string
          user_email: string
        }
        Insert: {
          completed_at?: string | null
          day_number: number
          id?: string
          pose_name: string
          user_email: string
        }
        Update: {
          completed_at?: string | null
          day_number?: number
          id?: string
          pose_name?: string
          user_email?: string
        }
        Relationships: []
      }
      schedule: {
        Row: {
          category: string | null
          completion_status: string | null
          day_number: number
          id: string
          is_unlocked: boolean | null
          pose_names: string[] | null
        }
        Insert: {
          category?: string | null
          completion_status?: string | null
          day_number: number
          id?: string
          is_unlocked?: boolean | null
          pose_names?: string[] | null
        }
        Update: {
          category?: string | null
          completion_status?: string | null
          day_number?: number
          id?: string
          is_unlocked?: boolean | null
          pose_names?: string[] | null
        }
        Relationships: []
      }
      user_details: {
        Row: {
          created_at: string | null
          email: string
          experience_level: string | null
          practice_days: string[] | null
          reminder_time: string | null
          session_duration: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          experience_level?: string | null
          practice_days?: string[] | null
          reminder_time?: string | null
          session_duration?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          experience_level?: string | null
          practice_days?: string[] | null
          reminder_time?: string | null
          session_duration?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_days: number[] | null
          cooldown_preference: string | null
          current_day: number | null
          email: string
          journey_start_date: string | null
          profile_locked: boolean | null
          total_poses_practiced: number | null
          total_practice_time: number | null
        }
        Insert: {
          completed_days?: number[] | null
          cooldown_preference?: string | null
          current_day?: number | null
          email: string
          journey_start_date?: string | null
          profile_locked?: boolean | null
          total_poses_practiced?: number | null
          total_practice_time?: number | null
        }
        Update: {
          completed_days?: number[] | null
          cooldown_preference?: string | null
          current_day?: number | null
          email?: string
          journey_start_date?: string | null
          profile_locked?: boolean | null
          total_poses_practiced?: number | null
          total_practice_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_email_fkey"
            columns: ["email"]
            isOneToOne: true
            referencedRelation: "user_details"
            referencedColumns: ["email"]
          },
        ]
      }
      video_files: {
        Row: {
          category: string | null
          day_number: number | null
          id: string
          pose_benefits: string[] | null
          pose_description: string | null
          pose_image: string | null
          pose_name: string
          pose_steps: string[] | null
          pose_video: string | null
        }
        Insert: {
          category?: string | null
          day_number?: number | null
          id?: string
          pose_benefits?: string[] | null
          pose_description?: string | null
          pose_image?: string | null
          pose_name: string
          pose_steps?: string[] | null
          pose_video?: string | null
        }
        Update: {
          category?: string | null
          day_number?: number | null
          id?: string
          pose_benefits?: string[] | null
          pose_description?: string | null
          pose_image?: string | null
          pose_name?: string
          pose_steps?: string[] | null
          pose_video?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_or_update_user_details: {
        Args: {
          p_email: string
          p_experience_level: string
          p_session_duration: string
          p_practice_days: string[]
          p_reminder_time: string
        }
        Returns: undefined
      }
      create_user_if_not_exists: {
        Args: { user_email: string }
        Returns: undefined
      }
      unlock_next_day: {
        Args: {
          user_email: string
          completed_day: number
          user_category: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
