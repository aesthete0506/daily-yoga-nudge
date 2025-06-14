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
      content_library: {
        Row: {
          asana_name: string
          benefits: string | null
          day: number
          experience_level: string
          id: string
          muscles_impacted: string | null
          pose_steps: string[] | null
          video_duration: number | null
          video_url: string
        }
        Insert: {
          asana_name: string
          benefits?: string | null
          day: number
          experience_level: string
          id?: string
          muscles_impacted?: string | null
          pose_steps?: string[] | null
          video_duration?: number | null
          video_url: string
        }
        Update: {
          asana_name?: string
          benefits?: string | null
          day?: number
          experience_level?: string
          id?: string
          muscles_impacted?: string | null
          pose_steps?: string[] | null
          video_duration?: number | null
          video_url?: string
        }
        Relationships: []
      }
      user_details: {
        Row: {
          created_at: string | null
          email: string
          experience_level: string
          practice_days: string[]
          reminder_time: string
          session_duration: number
        }
        Insert: {
          created_at?: string | null
          email: string
          experience_level: string
          practice_days: string[]
          reminder_time: string
          session_duration: number
        }
        Update: {
          created_at?: string | null
          email?: string
          experience_level?: string
          practice_days?: string[]
          reminder_time?: string
          session_duration?: number
        }
        Relationships: []
      }
      user_journey: {
        Row: {
          completed_days: number[] | null
          current_day: number | null
          email: string
          journey_start_date: string | null
          last_practice_date: string | null
          streak_count: number | null
          total_poses_practiced: number | null
          total_practice_time: number | null
        }
        Insert: {
          completed_days?: number[] | null
          current_day?: number | null
          email: string
          journey_start_date?: string | null
          last_practice_date?: string | null
          streak_count?: number | null
          total_poses_practiced?: number | null
          total_practice_time?: number | null
        }
        Update: {
          completed_days?: number[] | null
          current_day?: number | null
          email?: string
          journey_start_date?: string | null
          last_practice_date?: string | null
          streak_count?: number | null
          total_poses_practiced?: number | null
          total_practice_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_email_fkey"
            columns: ["email"]
            isOneToOne: true
            referencedRelation: "user_details"
            referencedColumns: ["email"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_day: {
        Args: {
          user_email: string
          day_number: number
          poses_count: number
          practice_minutes: number
        }
        Returns: undefined
      }
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
