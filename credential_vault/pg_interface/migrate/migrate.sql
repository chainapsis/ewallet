-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE IF NOT EXISTS public.users (
	user_id uuid DEFAULT gen_random_uuid() NOT NULL,
	email varchar(255) NOT NULL,
	status varchar(16) DEFAULT 'active'::character varying NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (user_id)
);

-- public.wallets definition

-- Drop table

-- DROP TABLE public.wallets;

CREATE TABLE IF NOT EXISTS public.wallets (
    wallet_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id   uuid NOT NULL,
    curve_type varchar(16), -- default: 'secp256k1'
    public_key bytea UNIQUE,
    metadata jsonb NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT wallets_pkey PRIMARY KEY (wallet_id),
    CONSTRAINT wallets_public_key_key UNIQUE (public_key)
);

-- public.key_shares definition

-- Drop table

-- DROP TABLE public.key_shares;

CREATE TABLE IF NOT EXISTS public.key_shares (
    share_id  uuid DEFAULT gen_random_uuid() NOT NULL,
    wallet_id uuid NOT NULL,
    enc_share bytea NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT key_shares_pkey PRIMARY KEY (share_id)
);

-- public.tasks definition

-- Drop table

-- DROP TABLE public.tasks;

CREATE TABLE IF NOT EXISTS public.tasks (
    task_id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_type varchar(255) NOT NULL,
    status varchar(16) NOT NULL,
    meta jsonb NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT tasks_pkey PRIMARY KEY (task_id)
);

-- public.pg_dump_logs definition

-- Drop table

-- DROP TABLE public.pg_dump_logs;

CREATE TABLE IF NOT EXISTS public.pg_dump_logs (
    log_id uuid DEFAULT gen_random_uuid() NOT NULL,
    dump_path varchar(255) NOT NULL,
    dump_size bigint NOT NULL,
    meta jsonb NULL,
    deleted_at timestamptz NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT pg_dump_logs_pkey PRIMARY KEY (log_id)
);

-- public.witnessed_id_tokens definition

-- Drop table

-- DROP TABLE public.witnessed_id_tokens;

CREATE TABLE IF NOT EXISTS public.witnessed_id_tokens (
    witness_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    user_session_public_key bytea NOT NULL, -- 33 bytes (secp256k1 public key)
    id_token_hash bytea NOT NULL, -- 32 bytes (SHA256)
    status varchar(6) NOT NULL, -- 'commit' or 'reveal'
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT witnessed_id_tokens_pkey PRIMARY KEY (witness_id)
);

-- Indexes for witnessed_id_tokens
CREATE INDEX IF NOT EXISTS idx_witnessed_id_tokens_user_id ON public.witnessed_id_tokens(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_witnessed_id_tokens_hash ON public.witnessed_id_tokens(id_token_hash);
CREATE INDEX IF NOT EXISTS idx_witnessed_id_tokens_status ON public.witnessed_id_tokens(status);