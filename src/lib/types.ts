export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type VendorPlan = 'free' | 'pro';

// The ledger entry kind. 'initial' is the DB-seeded opening balance recorded
// atomically by migration 0018 when a product starts with nonzero on_hand; never
// chosen by the user through the stock-movement form (see schemas.ts).
export type StockMovementReason = 'restock' | 'waste' | 'adjustment' | 'initial';

type LegalCheckState = {
  email: string;
  checked_at: string;
  is_current: boolean;
};

// Migrations 0017-0019 constrain ownership, retain history and make stock writes atomic.
// RPC argument/return and column shapes are unchanged; 0019 changes grants and function security.
export interface Database {
  stockkit: {
    Tables: {
      vendors: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          tour_seen_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          created_at?: string;
          tour_seen_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          tour_seen_at?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          vendor_id: string;
          name: string;
          unit: string;
          unit_cost_cents: number;
          on_hand: number;
          low_stock_threshold: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          name: string;
          unit?: string;
          unit_cost_cents?: number;
          on_hand?: number;
          low_stock_threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          name?: string;
          unit?: string;
          unit_cost_cents?: number;
          on_hand?: number;
          low_stock_threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'products_vendor_id_fkey';
            columns: ['vendor_id'];
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      stock_movements: {
        Row: {
          id: string;
          vendor_id: string;
          product_id: string;
          delta: number;
          reason: StockMovementReason;
          note: string | null;
          unit_cost_cents: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          product_id: string;
          delta: number;
          reason: StockMovementReason;
          note?: string | null;
          unit_cost_cents?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          product_id?: string;
          delta?: number;
          reason?: StockMovementReason;
          note?: string | null;
          unit_cost_cents?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'stock_movements_vendor_id_fkey';
            columns: ['vendor_id'];
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'stock_movements_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      feedback: {
        Row: {
          id: number;
          vendor_id: string;
          nps: number;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          vendor_id: string;
          nps: number;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          vendor_id?: string;
          nps?: number;
          message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      admins: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_audit: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_id: string | null;
          detail: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          target_id?: string | null;
          detail?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: string;
          target_id?: string | null;
          detail?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      vendor_entitlements: {
        Row: {
          vendor_id: string;
          tier: 'free' | 'paid';
          founder: boolean;
          stats_window: '24h' | '90d';
          valid_until: string | null;
          issued_at: string;
          updated_at: string;
        };
        Insert: {
          vendor_id: string;
          tier: 'free' | 'paid';
          founder?: boolean;
          stats_window?: '24h' | '90d';
          valid_until?: string | null;
          issued_at: string;
          updated_at?: string;
        };
        Update: {
          vendor_id?: string;
          tier?: 'free' | 'paid';
          founder?: boolean;
          stats_window?: '24h' | '90d';
          valid_until?: string | null;
          issued_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      legal_check_state: {
        Row: LegalCheckState;
        Insert: {
          email: string;
          checked_at?: string;
          is_current: boolean;
        };
        Update: {
          checked_at?: string;
          is_current?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      // Cap-internal (migration 0011). Both are mirrored here to keep this
      // file a faithful schema mirror; neither is callable via .rpc(), and
      // both would fail if tried — 0011 revokes EXECUTE from PUBLIC, granting
      // can_create_product to `authenticated` only because an RLS policy
      // expression runs as the querying role, and active_product_cap to no
      // one at all. The plan cap they enforce is surfaced to vendors by
      // saveProduct's own friendly-error check.
      //
      // Not listed: stockkit.enforce_product_limit(), the statement-level
      // AFTER INSERT trigger backing the same cap — a `RETURNS trigger`
      // function has no callable signature to mirror.
      active_product_cap: {
        Args: { p_vendor: string };
        Returns: number | null;
      };
      _can_create_product_unchecked: {
        Args: { p_vendor: string };
        Returns: boolean;
      };
      can_create_product: {
        Args: { p_vendor: string };
        Returns: boolean;
      };
      // Admin membership predicate (migration 0013), used inside the
      // admins/admin_audit RLS policies. Granted to anon/authenticated/
      // service_role, but the app never calls it via .rpc() — src/lib/admin.ts
      // reads the admins table directly, relying on the same policy.
      is_admin: {
        Args: { p_uid: string };
        Returns: boolean;
      };
      // Merqo entitlement push (migration 0025); service role only. Returns
      // 'stored', 'stale' (issued_at not newer, no-op) or 'unknown_vendor'.
      apply_vendor_entitlement: {
        Args: {
          p_email: string;
          p_tier: string;
          p_founder: boolean;
          p_stats_window: string;
          p_valid_until: string | null;
          p_issued_at: string;
        };
        Returns: string;
      };
      // Fixed-window limiter (migration 0024); service role only.
      check_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number };
        Returns: boolean;
      };
      record_stock_movement: {
        Args: {
          p_product_id: string;
          p_delta: number;
          p_reason: string;
          p_note?: string | null;
          p_unit_cost_cents?: number | null;
        };
        Returns: Database['stockkit']['Tables']['products']['Row'];
      };
      sync_vendor_profile: {
        Args: { p_stall_name: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Product = Database['stockkit']['Tables']['products']['Row'];
export type StockMovement = Database['stockkit']['Tables']['stock_movements']['Row'];
