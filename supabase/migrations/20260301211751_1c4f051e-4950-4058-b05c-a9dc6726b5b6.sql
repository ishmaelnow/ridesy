
-- Wallet transactions table
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('top_up', 'ride_payment', 'refund', 'payout')),
  amount numeric NOT NULL,
  description text,
  stripe_session_id text,
  ride_id uuid REFERENCES public.rides(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.wallet_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.wallet_transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.wallet_transactions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Wallet balances table
CREATE TABLE public.wallet_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance numeric NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own balance" ON public.wallet_balances
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own balance" ON public.wallet_balances
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own balance" ON public.wallet_balances
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Driver Stripe Connect accounts table
CREATE TABLE public.driver_stripe_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_account_id text NOT NULL,
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_stripe_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stripe account" ON public.driver_stripe_accounts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stripe account" ON public.driver_stripe_accounts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stripe account" ON public.driver_stripe_accounts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stripe accounts" ON public.driver_stripe_accounts
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
