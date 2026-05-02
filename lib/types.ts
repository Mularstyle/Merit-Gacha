/**
 * Core TypeScript types for Merit Gacha application
 * 
 * This file defines the type system for the entire application,
 * ensuring type safety across components, API routes, and services.
 */

/**
 * Gacha tier system representing the quality/worthiness of a prayer offering
 * - SSR: ศักดิ์สิทธิ์สูงสุด (Most Sacred) - Luxurious offerings worthy of the wish
 * - SR: ศักดิ์สิทธิ์ (Sacred) - Good offerings, acceptable
 * - R: ธรรมดา (Regular) - Ordinary offerings, not quite matching the wish
 * - เกลือ: ไร้ค่า (Worthless/Salt) - Poor offerings, inappropriate or low-effort
 */
export type GachaTier = 'SSR' | 'SR' | 'R' | 'เกลือ';

/**
 * Prayer record stored in the database
 * Represents a complete prayer submission with AI evaluation results
 */
export interface Prayer {
  /** Unique identifier for the prayer */
  id: string;
  
  /** User ID from Supabase auth.users */
  user_id: string;
  
  /** The wish text submitted by the user */
  wish_text: string;
  
  /** Public URL of the offering image in Supabase Storage */
  offering_image_url: string;
  
  /** Tier assigned by the AI evaluator */
  tier: GachaTier;
  
  /** Short judgment text from the AI deity */
  verdict: string;
  
  /** Longer commentary from the AI deity (1-2 sentences) */
  comment: string;
  
  /** Timestamp when the prayer was created (ISO 8601 format) */
  created_at: string;
}

/**
 * AI evaluation result returned by the Gemini evaluator
 * This is the parsed response from the AI deity
 */
export interface EvaluationResult {
  /** Tier assigned based on offering quality vs wish magnitude */
  tier: GachaTier;
  
  /** Short judgment text in Thai */
  verdict: string;
  
  /** Humorous commentary in Thai (1-2 sentences) */
  comment: string;
}

/**
 * Prayer submission data from the client
 * Used when submitting a new prayer through the form
 */
export interface PrayerSubmission {
  /** The wish text entered by the user */
  wish: string;
  
  /** The offering image file selected by the user */
  offering: File;
}

/**
 * Generic API response wrapper
 * Provides consistent response structure across all API routes
 * 
 * @template T - The type of data returned on success
 */
export interface ApiResponse<T> {
  /** Indicates whether the operation was successful */
  success: boolean;
  
  /** Data payload returned on success (undefined on error) */
  data?: T;
  
  /** Error message in Thai (undefined on success) */
  error?: string;
}

/**
 * User data from Supabase authentication
 * Represents an authenticated user in the system
 */
export interface User {
  /** Unique user identifier from Supabase auth */
  id: string;
  
  /** User's email address from Google OAuth */
  email: string;
  
  /** Additional user metadata from OAuth provider */
  user_metadata: {
    /** Avatar URL from Google profile (optional) */
    avatar_url?: string;
    
    /** Full name from Google profile (optional) */
    full_name?: string;
  };
}
