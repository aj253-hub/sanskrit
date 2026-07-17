-- ==============================================================================
-- Migration: Secure Passes System
-- Description: Creates the `passes` table and RLS policies for server-verified pro access.
-- ==============================================================================

-- 1. Create the passes table
CREATE TABLE IF NOT EXISTS public.passes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type text NOT NULL, -- e.g., 'monthly', 'yearly'
    start_date timestamptz NOT NULL DEFAULT now(),
    expiry_date timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled'
    payment_id text, -- To store the Razorpay payment ID for reference
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for faster queries on user_id (used frequently on login)
CREATE INDEX IF NOT EXISTS idx_passes_user_id ON public.passes(user_id);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Policy: Users can only READ their own passes
CREATE POLICY "Users can read own passes" 
ON public.passes 
FOR SELECT 
USING (auth.uid() = user_id);

-- Note: No INSERT, UPDATE, or DELETE policies are granted to authenticated users.
-- This ensures clients cannot spoof a pass. All writes must be done using the 
-- Service Role Key from the secure backend environment (Vercel API / Edge Function).

-- ==============================================================================
-- (Optional fix for answer_keys_migration.sql)
-- If you haven't run the previous SQL migration yet, please update `cuet_30` to `पाँच` 
-- in answer_keys_migration.sql to match the fix we did earlier, or run this:
-- UPDATE public.answer_keys SET correct_answer = 'पाँच' WHERE question_id = 'cuet_30';
-- ==============================================================================
