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
          role: 'restaurant_owner' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'restaurant_owner' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'restaurant_owner' | 'admin'
          created_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          owner_id: string
          name: string
          logo: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          logo?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          logo?: string | null
          description?: string | null
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          ingredients: string[] | null
          category: string
          calories: number | null
          tags: string[] | null
          available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          ingredients?: string[] | null
          category: string
          calories?: number | null
          tags?: string[] | null
          available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          ingredients?: string[] | null
          category?: string
          calories?: number | null
          tags?: string[] | null
          available?: boolean
          created_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          restaurant_id: string
          total_scans: number
          item_views: Json
          language_selected: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          total_scans?: number
          item_views?: Json
          language_selected?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          total_scans?: number
          item_views?: Json
          language_selected?: Json
          created_at?: string
          updated_at?: string
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
      [_ in never]: never
    }
  }
}
