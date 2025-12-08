-- ==============================================
-- KOURT - SISTEMA FINANCEIRO E SAAS COMPLETO
-- Este SQL adiciona todas as tabelas para:
-- - Pagamentos e transações
-- - Assinaturas (subscriptions)
-- - Payouts para hosts
-- - Torneios com taxas de inscrição
-- - Webhooks do Stripe
-- - Invoices e histórico de cobrança
-- ==============================================

-- ==============================================
-- PART 1: TIPOS ENUM (se não existirem)
-- ==============================================

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'plus', 'pro');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('booking_payment', 'subscription_payment', 'tournament_entry', 'refund', 'payout', 'credit', 'debit');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==============================================
-- PART 2: COLUNAS ADICIONAIS EM TABELAS EXISTENTES
-- ==============================================

-- PROFILES - campos de pagamento
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_payment_method_id VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_name VARCHAR(200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_address JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_spent DECIMAL(12,2) DEFAULT 0;

-- HOSTS - campos financeiros
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS stripe_account_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS payout_schedule VARCHAR(20) DEFAULT 'weekly';
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS payout_minimum DECIMAL(10,2) DEFAULT 50.00;
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS available_balance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS lifetime_revenue DECIMAL(12,2) DEFAULT 0;
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS bank_account_info JSONB;

-- BOOKINGS - campos de pagamento expandidos
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_charge_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS host_payout_amount DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- TOURNAMENTS - campos de pagamento
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS prize_pool DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS prize_distribution JSONB DEFAULT '{"1st": 50, "2nd": 30, "3rd": 20}';
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS refund_policy TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS total_collected DECIMAL(12,2) DEFAULT 0;

-- TOURNAMENT_PARTICIPANTS - campos de pagamento
ALTER TABLE tournament_participants ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE tournament_participants ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);
ALTER TABLE tournament_participants ADD COLUMN IF NOT EXISTS entry_fee_paid DECIMAL(10,2);
ALTER TABLE tournament_participants ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE tournament_participants ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- COURTS - campos de preço
ALTER TABLE courts ADD COLUMN IF NOT EXISTS price_per_hour DECIMAL(10,2);
ALTER TABLE courts ADD COLUMN IF NOT EXISTS peak_price_per_hour DECIMAL(10,2);
ALTER TABLE courts ADD COLUMN IF NOT EXISTS weekend_price_per_hour DECIMAL(10,2);
ALTER TABLE courts ADD COLUMN IF NOT EXISTS minimum_booking_hours DECIMAL(3,1) DEFAULT 1;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS cancellation_hours INTEGER DEFAULT 24;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS cancellation_fee_percent INTEGER DEFAULT 0;

-- ==============================================
-- PART 3: TABELAS DE SUBSCRIPTIONS
-- ==============================================

-- Tabela principal de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tier VARCHAR(20) DEFAULT 'free',
  status VARCHAR(20) DEFAULT 'active',
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Adicionar colunas se tabela já existe
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;

-- Planos de assinatura
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  tier VARCHAR(20) NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]',
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de mudanças de plano
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  previous_tier VARCHAR(20),
  new_tier VARCHAR(20),
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- PART 4: TABELAS DE TRANSAÇÕES E PAGAMENTOS
-- ==============================================

-- Transações (ledger financeiro)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  host_id UUID,
  booking_id UUID,
  subscription_id UUID,
  tournament_id UUID,
  transaction_type VARCHAR(30) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  description TEXT,
  stripe_id VARCHAR(255),
  stripe_fee DECIMAL(10,2),
  net_amount DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Métodos de pagamento salvos
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) NOT NULL,
  type VARCHAR(20) DEFAULT 'card',
  brand VARCHAR(20),
  last4 VARCHAR(4),
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  billing_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices (faturas)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subscription_id UUID,
  booking_id UUID,
  tournament_id UUID,
  invoice_number VARCHAR(50) UNIQUE,
  stripe_invoice_id VARCHAR(255),
  amount_due DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  subtotal DECIMAL(12,2),
  tax DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BRL',
  status VARCHAR(20) DEFAULT 'draft',
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  pdf_url TEXT,
  hosted_invoice_url TEXT,
  description TEXT,
  line_items JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cupons de desconto
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100),
  description TEXT,
  discount_type VARCHAR(20) DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  max_discount DECIMAL(10,2),
  min_purchase DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BRL',
  applies_to VARCHAR(30) DEFAULT 'all',
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  times_used INTEGER DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_coupon_id VARCHAR(255),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uso de cupons
CREATE TABLE IF NOT EXISTS coupon_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID,
  subscription_id UUID,
  discount_applied DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coupon_id, user_id, booking_id)
);

-- ==============================================
-- PART 5: TABELAS DE PAYOUTS (REPASSES PARA HOSTS)
-- ==============================================

-- Payouts para hosts
CREATE TABLE IF NOT EXISTS host_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL,
  stripe_transfer_id VARCHAR(255),
  stripe_payout_id VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'pending',
  period_start DATE,
  period_end DATE,
  bookings_count INTEGER DEFAULT 0,
  booking_ids UUID[] DEFAULT '{}',
  failure_reason TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de earnings do host
CREATE TABLE IF NOT EXISTS host_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL,
  booking_id UUID,
  court_id UUID,
  gross_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'pending',
  payout_id UUID REFERENCES host_payouts(id),
  available_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- PART 6: TABELAS DE WEBHOOKS E EVENTOS STRIPE
-- ==============================================

-- Eventos do Stripe (para idempotência)
CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  api_version VARCHAR(20),
  livemode BOOLEAN DEFAULT FALSE,
  data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook logs (para debugging)
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50) DEFAULT 'stripe',
  event_type VARCHAR(100),
  payload JSONB,
  headers JSONB,
  response_status INTEGER,
  response_body TEXT,
  processing_time_ms INTEGER,
  error TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- PART 7: TABELAS DE CRÉDITOS E WALLET
-- ==============================================

-- Movimentações da wallet do usuário
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(30) NOT NULL,
  description TEXT,
  reference_type VARCHAR(30),
  reference_id UUID,
  balance_before DECIMAL(12,2),
  balance_after DECIMAL(12,2),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créditos promocionais
CREATE TABLE IF NOT EXISTS promotional_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  remaining_amount DECIMAL(10,2) NOT NULL,
  source VARCHAR(50),
  campaign_id VARCHAR(100),
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- PART 8: TABELAS DE REEMBOLSOS
-- ==============================================

-- Solicitações de reembolso
CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  booking_id UUID,
  tournament_id UUID,
  subscription_id UUID,
  transaction_id UUID REFERENCES transactions(id),
  amount DECIMAL(10,2) NOT NULL,
  reason VARCHAR(100),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  stripe_refund_id VARCHAR(255),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- PART 9: TABELAS DE RELATÓRIOS FINANCEIROS
-- ==============================================

-- Resumo financeiro diário (para dashboards)
CREATE TABLE IF NOT EXISTS financial_daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  total_gmv DECIMAL(14,2) DEFAULT 0,
  total_revenue DECIMAL(14,2) DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_subscriptions_revenue DECIMAL(12,2) DEFAULT 0,
  new_subscriptions INTEGER DEFAULT 0,
  canceled_subscriptions INTEGER DEFAULT 0,
  total_tournaments_revenue DECIMAL(12,2) DEFAULT 0,
  total_refunds DECIMAL(12,2) DEFAULT 0,
  total_payouts DECIMAL(12,2) DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumo por host
CREATE TABLE IF NOT EXISTS host_monthly_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_commission DECIMAL(12,2) DEFAULT 0,
  net_earnings DECIMAL(12,2) DEFAULT 0,
  total_payouts DECIMAL(12,2) DEFAULT 0,
  avg_booking_value DECIMAL(10,2) DEFAULT 0,
  cancellation_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(host_id, year, month)
);

-- ==============================================
-- PART 10: INDEXES
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_host ON transactions(host_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe ON transactions(stripe_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);

CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe ON invoices(stripe_invoice_id);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupon_uses_user ON coupon_uses(user_id);

CREATE INDEX IF NOT EXISTS idx_host_payouts_host ON host_payouts(host_id);
CREATE INDEX IF NOT EXISTS idx_host_payouts_status ON host_payouts(status);

CREATE INDEX IF NOT EXISTS idx_host_earnings_host ON host_earnings(host_id);
CREATE INDEX IF NOT EXISTS idx_host_earnings_booking ON host_earnings(booking_id);

CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON stripe_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON stripe_events(processed);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);

CREATE INDEX IF NOT EXISTS idx_refund_requests_user ON refund_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);

CREATE INDEX IF NOT EXISTS idx_financial_daily_summary_date ON financial_daily_summary(date DESC);
CREATE INDEX IF NOT EXISTS idx_host_monthly_summary_host ON host_monthly_summary(host_id, year, month);

-- ==============================================
-- PART 11: ENABLE RLS
-- ==============================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotional_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_daily_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_monthly_summary ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- PART 12: RLS POLICIES
-- ==============================================

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "subscriptions_read_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON subscriptions;
CREATE POLICY "subscriptions_read_own" ON subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "subscriptions_insert_own" ON subscriptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "subscriptions_update_own" ON subscriptions FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- SUBSCRIPTION_PLANS (public read)
DROP POLICY IF EXISTS "subscription_plans_read_all" ON subscription_plans;
CREATE POLICY "subscription_plans_read_all" ON subscription_plans FOR SELECT USING (true);

-- SUBSCRIPTION_HISTORY
DROP POLICY IF EXISTS "subscription_history_read_own" ON subscription_history;
CREATE POLICY "subscription_history_read_own" ON subscription_history FOR SELECT TO authenticated USING (user_id = auth.uid());

-- TRANSACTIONS
DROP POLICY IF EXISTS "transactions_read_own" ON transactions;
DROP POLICY IF EXISTS "transactions_insert" ON transactions;
CREATE POLICY "transactions_read_own" ON transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "transactions_insert" ON transactions FOR INSERT TO authenticated WITH CHECK (true);

-- PAYMENT_METHODS
DROP POLICY IF EXISTS "payment_methods_read_own" ON payment_methods;
DROP POLICY IF EXISTS "payment_methods_insert_own" ON payment_methods;
DROP POLICY IF EXISTS "payment_methods_update_own" ON payment_methods;
DROP POLICY IF EXISTS "payment_methods_delete_own" ON payment_methods;
CREATE POLICY "payment_methods_read_own" ON payment_methods FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "payment_methods_insert_own" ON payment_methods FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "payment_methods_update_own" ON payment_methods FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "payment_methods_delete_own" ON payment_methods FOR DELETE TO authenticated USING (user_id = auth.uid());

-- INVOICES
DROP POLICY IF EXISTS "invoices_read_own" ON invoices;
CREATE POLICY "invoices_read_own" ON invoices FOR SELECT TO authenticated USING (user_id = auth.uid());

-- COUPONS (public read active)
DROP POLICY IF EXISTS "coupons_read_active" ON coupons;
CREATE POLICY "coupons_read_active" ON coupons FOR SELECT USING (is_active = true);

-- COUPON_USES
DROP POLICY IF EXISTS "coupon_uses_read_own" ON coupon_uses;
DROP POLICY IF EXISTS "coupon_uses_insert" ON coupon_uses;
CREATE POLICY "coupon_uses_read_own" ON coupon_uses FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "coupon_uses_insert" ON coupon_uses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- HOST_PAYOUTS (hosts can see their own)
DROP POLICY IF EXISTS "host_payouts_read_own" ON host_payouts;
CREATE POLICY "host_payouts_read_own" ON host_payouts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM hosts WHERE hosts.id = host_payouts.host_id AND hosts.user_id = auth.uid()));

-- HOST_EARNINGS
DROP POLICY IF EXISTS "host_earnings_read_own" ON host_earnings;
CREATE POLICY "host_earnings_read_own" ON host_earnings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM hosts WHERE hosts.id = host_earnings.host_id AND hosts.user_id = auth.uid()));

-- STRIPE_EVENTS (admin only - no public access)
DROP POLICY IF EXISTS "stripe_events_no_access" ON stripe_events;
CREATE POLICY "stripe_events_no_access" ON stripe_events FOR SELECT USING (false);

-- WEBHOOK_LOGS (admin only)
DROP POLICY IF EXISTS "webhook_logs_no_access" ON webhook_logs;
CREATE POLICY "webhook_logs_no_access" ON webhook_logs FOR SELECT USING (false);

-- WALLET_TRANSACTIONS
DROP POLICY IF EXISTS "wallet_transactions_read_own" ON wallet_transactions;
CREATE POLICY "wallet_transactions_read_own" ON wallet_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());

-- PROMOTIONAL_CREDITS
DROP POLICY IF EXISTS "promotional_credits_read_own" ON promotional_credits;
CREATE POLICY "promotional_credits_read_own" ON promotional_credits FOR SELECT TO authenticated USING (user_id = auth.uid());

-- REFUND_REQUESTS
DROP POLICY IF EXISTS "refund_requests_read_own" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_insert_own" ON refund_requests;
CREATE POLICY "refund_requests_read_own" ON refund_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "refund_requests_insert_own" ON refund_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- FINANCIAL_DAILY_SUMMARY (admin only)
DROP POLICY IF EXISTS "financial_daily_summary_no_access" ON financial_daily_summary;
CREATE POLICY "financial_daily_summary_no_access" ON financial_daily_summary FOR SELECT USING (false);

-- HOST_MONTHLY_SUMMARY
DROP POLICY IF EXISTS "host_monthly_summary_read_own" ON host_monthly_summary;
CREATE POLICY "host_monthly_summary_read_own" ON host_monthly_summary FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM hosts WHERE hosts.id = host_monthly_summary.host_id AND hosts.user_id = auth.uid()));

-- ==============================================
-- PART 13: FUNÇÕES AUXILIARES
-- ==============================================

-- Função para gerar número de invoice
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  invoice_number TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 6) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM invoices
  WHERE invoice_number LIKE 'KRT-' || year_part || '-%';

  invoice_number := 'KRT-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');

  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular earnings do host
CREATE OR REPLACE FUNCTION calculate_host_earnings(
  p_booking_id UUID,
  p_gross_amount DECIMAL,
  p_host_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
  v_commission_rate DECIMAL;
  v_net_amount DECIMAL;
BEGIN
  -- Buscar taxa de comissão do host
  SELECT COALESCE(commission_rate, 10.00) INTO v_commission_rate
  FROM hosts WHERE id = p_host_id;

  -- Calcular valor líquido
  v_net_amount := p_gross_amount * (1 - v_commission_rate / 100);

  -- Registrar earning
  INSERT INTO host_earnings (host_id, booking_id, gross_amount, platform_fee, net_amount, commission_rate, status)
  VALUES (p_host_id, p_booking_id, p_gross_amount, p_gross_amount * v_commission_rate / 100, v_net_amount, v_commission_rate, 'pending');

  -- Atualizar pending_balance do host
  UPDATE hosts SET pending_balance = COALESCE(pending_balance, 0) + v_net_amount WHERE id = p_host_id;

  RETURN v_net_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para processar pagamento de booking
CREATE OR REPLACE FUNCTION process_booking_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_host_id UUID;
  v_court_host_id UUID;
BEGIN
  -- Apenas quando payment_status muda para 'paid'
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    -- Buscar host do court
    SELECT c.owner_id, h.id INTO v_court_host_id, v_host_id
    FROM courts c
    LEFT JOIN hosts h ON h.user_id = c.owner_id
    WHERE c.id = NEW.court_id;

    IF v_host_id IS NOT NULL THEN
      -- Calcular e registrar earnings
      PERFORM calculate_host_earnings(NEW.id, NEW.total_price, v_host_id);
    END IF;

    -- Criar transação
    INSERT INTO transactions (user_id, booking_id, transaction_type, amount, currency, status, stripe_id)
    VALUES (NEW.user_id, NEW.id, 'booking_payment', NEW.total_price, 'BRL', 'completed', NEW.stripe_payment_intent_id);

    -- Atualizar total_spent do usuário
    UPDATE profiles SET total_spent = COALESCE(total_spent, 0) + NEW.total_price WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para processar pagamento
DROP TRIGGER IF EXISTS on_booking_payment ON bookings;
CREATE TRIGGER on_booking_payment
AFTER UPDATE OF payment_status ON bookings
FOR EACH ROW EXECUTE FUNCTION process_booking_payment();

-- Função para atualizar subscription no profile
CREATE OR REPLACE FUNCTION sync_profile_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE profiles
    SET subscription = NEW.tier,
        subscription_expires_at = NEW.current_period_end
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET subscription = 'free',
        subscription_expires_at = NULL
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_subscription_change ON subscriptions;
CREATE TRIGGER on_subscription_change
AFTER INSERT OR UPDATE OR DELETE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION sync_profile_subscription();

-- ==============================================
-- PART 14: INSERIR PLANOS DEFAULT
-- ==============================================

INSERT INTO subscription_plans (name, tier, description, features, price_monthly, price_yearly, sort_order)
VALUES
  ('Free', 'free', 'Plano gratuito básico',
   '["Criar partidas", "Participar de partidas", "Ver quadras próximas", "Perfil básico"]'::jsonb,
   0, 0, 1),
  ('Plus', 'plus', 'Para jogadores frequentes',
   '["Tudo do Free", "Análise de partidas com IA", "Estatísticas automáticas", "Highlights automáticos", "Reservar 14 dias antes", "Sem anúncios", "Badge Plus"]'::jsonb,
   14.90, 119.00, 2),
  ('Pro', 'pro', 'Para jogadores profissionais',
   '["Tudo do Plus", "Dicas de IA para melhorar", "Análise mensal de evolução", "Comparação com jogadores", "Criar torneios", "R$15/mês em créditos", "Descontos em lojas parceiras", "Badge Pro exclusivo"]'::jsonb,
   49.90, 539.00, 3)
ON CONFLICT DO NOTHING;

-- ==============================================
-- END - Migration Complete
-- ==============================================
