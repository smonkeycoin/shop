export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          last_login_at?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          logo_path: string | null
          manufacturer_name: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_path?: string | null
          manufacturer_name?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_path?: string | null
          manufacturer_name?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      bundle_items: {
        Row: {
          bundle_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          variant_id: string | null
        }
        Insert: {
          bundle_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          variant_id?: string | null
        }
        Update: {
          bundle_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "storefront_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "storefront_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          active: boolean
          compare_at_price: number | null
          created_at: string
          currency: string
          description: string | null
          featured: boolean
          id: string
          image_path: string | null
          name: string
          published: boolean
          retail_price: number
          short_description: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_path?: string | null
          name: string
          published?: boolean
          retail_price?: number
          short_description?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_path?: string | null
          name?: string
          published?: boolean
          retail_price?: number
          short_description?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "storefront_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          quantity_on_hand: number
          quantity_reserved: number
          reorder_point: number
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          id?: string
          product_id: string
          quantity_on_hand?: number
          quantity_reserved?: number
          reorder_point?: number
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          quantity_on_hand?: number
          quantity_reserved?: number
          reorder_point?: number
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "storefront_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          new_quantity: number | null
          order_id: string | null
          previous_quantity: number | null
          product_id: string
          quantity: number
          reason: string | null
          type: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          new_quantity?: number | null
          order_id?: string | null
          previous_quantity?: number | null
          product_id: string
          quantity: number
          reason?: string | null
          type: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          new_quantity?: number | null
          order_id?: string | null
          previous_quantity?: number | null
          product_id?: string
          quantity?: number
          reason?: string | null
          type?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "storefront_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          height: number | null
          id: string
          is_primary: boolean
          product_id: string
          production_approved: boolean
          sort_order: number
          source_type: string | null
          source_url: string | null
          storage_path: string
          variant_id: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_primary?: boolean
          product_id: string
          production_approved?: boolean
          sort_order?: number
          source_type?: string | null
          source_url?: string | null
          storage_path: string
          variant_id?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_primary?: boolean
          product_id?: string
          production_approved?: boolean
          sort_order?: number
          source_type?: string | null
          source_url?: string | null
          storage_path?: string
          variant_id?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "storefront_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_suppliers: {
        Row: {
          created_at: string
          id: string
          last_cost_update_at: string | null
          lead_time_days: number | null
          minimum_order_quantity: number | null
          preferred: boolean
          product_id: string
          supplier_cost: number | null
          supplier_id: string
          supplier_sku: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_cost_update_at?: string | null
          lead_time_days?: number | null
          minimum_order_quantity?: number | null
          preferred?: boolean
          product_id: string
          supplier_cost?: number | null
          supplier_id: string
          supplier_sku?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_cost_update_at?: string | null
          lead_time_days?: number | null
          minimum_order_quantity?: number | null
          preferred?: boolean
          product_id?: string
          supplier_cost?: number | null
          supplier_id?: string
          supplier_sku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_suppliers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suppliers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json
          available: boolean
          cost: number | null
          created_at: string
          id: string
          name: string
          product_id: string
          reorder_point: number | null
          retail_price: number | null
          sku: string
          sort_order: number
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          attributes?: Json
          available?: boolean
          cost?: number | null
          created_at?: string
          id?: string
          name: string
          product_id: string
          reorder_point?: number | null
          retail_price?: number | null
          sku: string
          sort_order?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          attributes?: Json
          available?: boolean
          cost?: number | null
          created_at?: string
          id?: string
          name?: string
          product_id?: string
          reorder_point?: number | null
          retail_price?: number | null
          sku?: string
          sort_order?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          age_group: Json | null
          brand_id: string | null
          category_id: string | null
          compare_at_price: number | null
          cost: number | null
          created_at: string
          currency: string
          description: string | null
          featured: boolean
          height_cm: number | null
          id: string
          is_best_seller: boolean
          is_new: boolean
          length_cm: number | null
          market_reference_price: number | null
          market_reference_source: string | null
          market_reference_updated_at: string | null
          name: string
          published: boolean
          retail_price: number
          seo_description: string | null
          seo_title: string | null
          shipping_class: string | null
          short_description: string | null
          short_name: string | null
          sku: string
          slug: string
          stock_status: string
          subcategory_id: string | null
          tags: Json | null
          updated_at: string
          usage_notes: string | null
          weight_grams: number | null
          width_cm: number | null
        }
        Insert: {
          active?: boolean
          age_group?: Json | null
          brand_id?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          featured?: boolean
          height_cm?: number | null
          id?: string
          is_best_seller?: boolean
          is_new?: boolean
          length_cm?: number | null
          market_reference_price?: number | null
          market_reference_source?: string | null
          market_reference_updated_at?: string | null
          name: string
          published?: boolean
          retail_price?: number
          seo_description?: string | null
          seo_title?: string | null
          shipping_class?: string | null
          short_description?: string | null
          short_name?: string | null
          sku: string
          slug: string
          stock_status?: string
          subcategory_id?: string | null
          tags?: Json | null
          updated_at?: string
          usage_notes?: string | null
          weight_grams?: number | null
          width_cm?: number | null
        }
        Update: {
          active?: boolean
          age_group?: Json | null
          brand_id?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          featured?: boolean
          height_cm?: number | null
          id?: string
          is_best_seller?: boolean
          is_new?: boolean
          length_cm?: number | null
          market_reference_price?: number | null
          market_reference_source?: string | null
          market_reference_updated_at?: string | null
          name?: string
          published?: boolean
          retail_price?: number
          seo_description?: string | null
          seo_title?: string | null
          shipping_class?: string | null
          short_description?: string | null
          short_name?: string | null
          sku?: string
          slug?: string
          stock_status?: string
          subcategory_id?: string | null
          tags?: Json | null
          updated_at?: string
          usage_notes?: string | null
          weight_grams?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "storefront_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "storefront_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "storefront_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_settings: {
        Row: {
          id: string
          is_public: boolean
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          is_public?: boolean
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          is_public?: boolean
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      supplier_cost_history: {
        Row: {
          cost: number
          id: string
          product_supplier_id: string
          recorded_at: string
          recorded_by: string | null
        }
        Insert: {
          cost: number
          id?: string
          product_supplier_id: string
          recorded_at?: string
          recorded_by?: string | null
        }
        Update: {
          cost?: number
          id?: string
          product_supplier_id?: string
          recorded_at?: string
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_cost_history_product_supplier_id_fkey"
            columns: ["product_supplier_id"]
            isOneToOne: false
            referencedRelation: "product_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          active: boolean
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          active?: boolean
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          active?: boolean
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      storefront_brands: {
        Row: {
          description: string | null
          id: string | null
          is_active: boolean | null
          is_featured: boolean | null
          logo_path: string | null
          manufacturer_name: string | null
          name: string | null
          slug: string | null
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_path?: string | null
          manufacturer_name?: string | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_path?: string | null
          manufacturer_name?: string | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      storefront_bundle_items: {
        Row: {
          bundle_id: string | null
          id: string | null
          product_id: string | null
          quantity: number | null
          variant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "storefront_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "storefront_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      storefront_bundles: {
        Row: {
          compare_at_price: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          featured: boolean | null
          id: string | null
          image_path: string | null
          name: string | null
          retail_price: number | null
          short_description: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          compare_at_price?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string | null
          image_path?: string | null
          name?: string | null
          retail_price?: number | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          compare_at_price?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string | null
          image_path?: string | null
          name?: string | null
          retail_price?: number | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      storefront_categories: {
        Row: {
          description: string | null
          id: string | null
          image_path: string | null
          is_active: boolean | null
          name: string | null
          parent_id: string | null
          slug: string | null
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          id?: string | null
          image_path?: string | null
          is_active?: boolean | null
          name?: string | null
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          id?: string | null
          image_path?: string | null
          is_active?: boolean | null
          name?: string | null
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "storefront_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      storefront_product_images: {
        Row: {
          alt_text: string | null
          height: number | null
          id: string | null
          is_primary: boolean | null
          product_id: string | null
          production_approved: boolean | null
          sort_order: number | null
          source_type: string | null
          storage_path: string | null
          variant_id: string | null
          width: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "storefront_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      storefront_product_variants: {
        Row: {
          attributes: Json | null
          available: boolean | null
          id: string | null
          name: string | null
          product_id: string | null
          retail_price: number | null
          sku: string | null
          sort_order: number | null
          stock_quantity: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
        ]
      }
      storefront_products: {
        Row: {
          age_group: Json | null
          brand_name: string | null
          brand_slug: string | null
          category_name: string | null
          category_slug: string | null
          compare_at_price: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          featured: boolean | null
          height_cm: number | null
          id: string | null
          is_best_seller: boolean | null
          is_new: boolean | null
          length_cm: number | null
          name: string | null
          retail_price: number | null
          seo_description: string | null
          seo_title: string | null
          shipping_class: string | null
          short_description: string | null
          short_name: string | null
          sku: string | null
          slug: string | null
          stock_status: string | null
          subcategory_name: string | null
          subcategory_slug: string | null
          tags: Json | null
          updated_at: string | null
          usage_notes: string | null
          weight_grams: number | null
          width_cm: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      claim_admin_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          role: string
        }[]
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
  public: {
    Enums: {},
  },
} as const
