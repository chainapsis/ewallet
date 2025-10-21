-- public.key_share_node_meta definition

-- Drop table

-- DROP TABLE public.key_share_node_meta;

CREATE TABLE public.key_share_node_meta (
	meta_id uuid DEFAULT gen_random_uuid() NOT NULL,
	wallet_id uuid NOT NULL,
	sss_threshold int2 NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	aux jsonb NULL,
	CONSTRAINT key_share_node_meta_pkey PRIMARY KEY (meta_id),
	CONSTRAINT key_share_node_meta_wallet_id_key UNIQUE (wallet_id)
);


-- public.key_shares definition

-- Drop table

-- DROP TABLE public.key_shares;

CREATE TABLE public.key_shares (
	share_id uuid DEFAULT gen_random_uuid() NOT NULL,
	wallet_id uuid NOT NULL,
	enc_share bytea NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	aux jsonb NULL,
	CONSTRAINT key_shares_pkey PRIMARY KEY (share_id),
	CONSTRAINT key_shares_unique UNIQUE (wallet_id)
);


-- public.pg_dumps definition

-- Drop table

-- DROP TABLE public.pg_dumps;

CREATE TABLE public.pg_dumps (
	dump_id uuid DEFAULT gen_random_uuid() NOT NULL,
	status varchar(16) NOT NULL,
	dump_path varchar(255) NULL,
	meta jsonb NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT pg_dumps_pkey PRIMARY KEY (dump_id)
);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	user_id uuid DEFAULT gen_random_uuid() NOT NULL,
	email varchar(255) NOT NULL,
	status varchar(16) DEFAULT 'active'::character varying NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	aux jsonb NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (user_id)
);


-- public.wallets definition

-- Drop table

-- DROP TABLE public.wallets;

CREATE TABLE public.wallets (
	wallet_id uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	curve_type varchar(16) NULL,
	public_key bytea NULL,
	aux jsonb NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT wallets_pkey PRIMARY KEY (wallet_id),
	CONSTRAINT wallets_public_key_key UNIQUE (public_key)
);
