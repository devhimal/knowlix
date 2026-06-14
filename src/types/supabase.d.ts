export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      books: {
        Row: {
          author: string
          condition: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          exchange_for: string | null
          genre: string | null
          id: string
          isbn: string | null
          language: string | null
          pages: number | null
          pdf_url: string | null
          price: number | null
          publication_year: number | null
          title: string
          type: string | null
        }
        Insert: {
          author: string
          condition?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          exchange_for?: string | null
          genre?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          pages?: number | null
          pdf_url?: string | null
          price?: number | null
          publication_year?: number | null
          title: string
          type?: string | null
        }
        Update: {
          author?: string
          condition?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          exchange_for?: string | null
          genre?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          pages?: number | null
          pdf_url?: string | null
          price?: number | null
          publication_year?: number | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      mentors: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          profile_picture_url: string | null
          specialties: string[] | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          profile_picture_url?: string | null
          specialties?: string[] | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          profile_picture_url?: string | null
          specialties?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      resource_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          resource_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          resource_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_ratings_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          average_rating: number | null
          category_id: string
          created_at: string
          description: string | null
          downloads_count: number | null
          file_name: string
          file_path: string
          file_size_mb: number | null
          file_type: string
          id: string
          is_free: boolean
          price: number | null
          semester: string
          status: string
          sub_category_id: string
          subject: string
          title: string
          total_ratings: number | null
          updated_at: string
          uploader_email: string | null
          uploader_id: string
          uploader_name: string | null
        }
        Insert: {
          average_rating?: number | null
          category_id: string
          created_at?: string
          description?: string | null
          downloads_count?: number | null
          file_name: string
          file_path: string
          file_size_mb?: number | null
          file_type: string
          id?: string
          is_free?: boolean
          price?: number | null
          semester: string
          status?: string
          sub_category_id: string
          subject: string
          title: string
          total_ratings?: number | null
          updated_at?: string
          uploader_email?: string | null
          uploader_id: string
          uploader_name?: string | null
        }
        Update: {
          average_rating?: number | null
          category_id?: string
          created_at?: string
          description?: string | null
          downloads_count?: number | null
          file_name?: string
          file_path?: string
          file_size_mb?: number | null
          file_type?: string
          id?: string
          is_free?: boolean
          price?: number | null
          semester?: string
          status?: string
          sub_category_id?: string
          subject?: string
          title?: string
          total_ratings?: number | null
          updated_at?: string
          uploader_email?: string | null
          uploader_id?: string
          uploader_name?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          buyer_email: string
          buyer_id: string | null
          created_at: string | null
          id: string
          payment_method: string
          resource_id: string | null
          resource_name: string | null
          seller_email: string | null
          seller_id: string | null
          status: string
          subscription_plan: string | null
          transaction_id: string
          type: string
        }
        Insert: {
          amount: number
          buyer_email: string
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          payment_method: string
          resource_id?: string | null
          resource_name?: string | null
          seller_email?: string | null
          seller_id?: string | null
          status: string
          subscription_plan?: string | null
          transaction_id: string
          type: string
        }
        Update: {
          amount?: number
          buyer_email?: string
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string
          resource_id?: string | null
          resource_name?: string | null
          seller_email?: string | null
          seller_id?: string | null
          status?: string
          subscription_plan?: string | null
          transaction_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

