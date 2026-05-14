-- BarberPro — Schema Supabase
-- Execute este arquivo no SQL Editor do seu projeto Supabase
-- https://supabase.com/dashboard → SQL Editor → New query

-- ─── Extensões ───────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Unidades (franquias/filiais) ────────────────────────────────────
create table unidades (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  slug        text not null unique,  -- usado na URL /agendar/[slug]
  endereco    text,
  cidade      text,
  telefone    text,
  gerente     text,
  cor         text default 'from-orange-500 to-rose-600',
  ativa       boolean default true,
  created_at  timestamptz default now()
);

-- ─── Perfis de usuários (admins, barbeiros, caixa) ───────────────────
create table perfis (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null,
  role        text not null check (role in ('admin','barbeiro','caixa')),
  unidade_id  uuid references unidades(id),
  avatar_url  text,
  ativo       boolean default true,
  created_at  timestamptz default now()
);

-- ─── Barbeiros ───────────────────────────────────────────────────────
create table barbeiros (
  id              uuid primary key default uuid_generate_v4(),
  unidade_id      uuid references unidades(id) on delete cascade,
  perfil_id       uuid references perfis(id),
  nome            text not null,
  email           text,
  telefone        text,
  especialidades  text[],
  comissao        int default 35,
  meta_mensal     int default 30,
  avaliacao       numeric(2,1) default 5.0,
  experiencia     text,
  ativo           boolean default true,
  created_at      timestamptz default now()
);

-- ─── Serviços ────────────────────────────────────────────────────────
create table servicos (
  id               uuid primary key default uuid_generate_v4(),
  unidade_id       uuid references unidades(id) on delete cascade,
  nome             text not null,
  categoria        text not null,
  preco            numeric(10,2) not null,
  duracao_minutos  int not null,
  popular          boolean default false,
  ativo            boolean default true,
  created_at       timestamptz default now()
);

-- ─── Produtos ────────────────────────────────────────────────────────
create table produtos (
  id               uuid primary key default uuid_generate_v4(),
  unidade_id       uuid references unidades(id) on delete cascade,
  nome             text not null,
  categoria        text,
  preco            numeric(10,2) not null,
  custo            numeric(10,2) default 0,
  estoque          int default 0,
  estoque_minimo   int default 3,
  ativo            boolean default true,
  created_at       timestamptz default now()
);

-- ─── Clientes ────────────────────────────────────────────────────────
create table clientes (
  id              uuid primary key default uuid_generate_v4(),
  unidade_id      uuid references unidades(id),
  nome            text not null,
  telefone        text,
  email           text,
  nascimento      date,
  observacoes     text,
  total_visitas   int default 0,
  total_gasto     numeric(10,2) default 0,
  ultima_visita   date,
  pontos          int default 0,
  tier            text default 'bronze',
  created_at      timestamptz default now()
);

-- ─── Agendamentos ────────────────────────────────────────────────────
create table agendamentos (
  id           uuid primary key default uuid_generate_v4(),
  unidade_id   uuid references unidades(id) on delete cascade,
  cliente_id   uuid references clientes(id),
  barbeiro_id  uuid references barbeiros(id),
  data         date not null,
  hora_inicio  time not null,
  duracao_min  int default 30,
  status       text default 'agendado' check (status in ('agendado','confirmado','em_andamento','concluido','cancelado','faltou')),
  valor_total  numeric(10,2) default 0,
  observacoes  text,
  origem       text default 'sistema',  -- 'sistema' | 'link_publico' | 'whatsapp'
  created_at   timestamptz default now()
);

-- ─── Itens de agendamento (serviços) ─────────────────────────────────
create table agendamento_servicos (
  id              uuid primary key default uuid_generate_v4(),
  agendamento_id  uuid references agendamentos(id) on delete cascade,
  servico_id      uuid references servicos(id),
  preco           numeric(10,2) not null
);

-- ─── Vendas (PDV) ────────────────────────────────────────────────────
create table vendas (
  id                     uuid primary key default uuid_generate_v4(),
  unidade_id             uuid references unidades(id) on delete cascade,
  cliente_id             uuid references clientes(id),
  barbeiro_id            uuid references barbeiros(id),
  agendamento_id         uuid references agendamentos(id),
  subtotal               numeric(10,2) not null,
  desconto_pct           int default 0,
  total                  numeric(10,2) not null,
  metodo_pagamento       text not null,
  status_pagamento       text default 'pendente' check (status_pagamento in ('pendente','aprovado','recusado','cancelado')),
  infinitepay_charge_id  text,
  observacoes            text,
  created_at             timestamptz default now()
);

-- ─── Itens de venda ──────────────────────────────────────────────────
create table venda_itens (
  id            uuid primary key default uuid_generate_v4(),
  venda_id      uuid references vendas(id) on delete cascade,
  tipo          text not null check (tipo in ('servico','produto')),
  referencia_id uuid not null,
  nome          text not null,
  quantidade    int default 1,
  preco_unit    numeric(10,2) not null,
  desconto      int default 0,
  subtotal      numeric(10,2) not null
);

-- ─── Transações financeiras ──────────────────────────────────────────
create table transacoes (
  id          uuid primary key default uuid_generate_v4(),
  unidade_id  uuid references unidades(id) on delete cascade,
  tipo        text not null check (tipo in ('receita','despesa')),
  descricao   text not null,
  valor       numeric(10,2) not null,
  categoria   text,
  metodo      text,
  data        date not null,
  venda_id    uuid references vendas(id),
  created_at  timestamptz default now()
);

-- ─── Comissões ───────────────────────────────────────────────────────
create table comissoes (
  id           uuid primary key default uuid_generate_v4(),
  unidade_id   uuid references unidades(id),
  barbeiro_id  uuid references barbeiros(id) on delete cascade,
  venda_id     uuid references vendas(id),
  valor_venda  numeric(10,2) not null,
  pct          int not null,
  valor        numeric(10,2) not null,
  pago         boolean default false,
  data_pag     date,
  periodo_ref  text,  -- 'YYYY-MM'
  created_at   timestamptz default now()
);

-- ─── Configurações do programa de fidelidade ─────────────────────────
create table fidelidade_config (
  id                   uuid primary key default uuid_generate_v4(),
  unidade_id           uuid references unidades(id) unique,
  ativo                boolean default true,
  pontos_per_real      numeric(3,1) default 1,
  expiracao_dias       int default 365,
  desconto_automatico  boolean default true,
  bonus_aniversario    int default 50,
  notif_tier_up        boolean default true,
  notif_aniversario    boolean default true,
  mensagem_boas_vindas text,
  updated_at           timestamptz default now()
);

-- ─── RLS (Row Level Security) ────────────────────────────────────────
-- Habilite em cada tabela e configure políticas conforme o role do usuário
alter table unidades      enable row level security;
alter table clientes       enable row level security;
alter table agendamentos   enable row level security;
alter table vendas         enable row level security;
alter table transacoes     enable row level security;

-- Política básica: usuário autenticado vê apenas sua unidade
create policy "Users see own unit" on clientes
  for all using (
    unidade_id = (select unidade_id from perfis where id = auth.uid())
    or
    (select role from perfis where id = auth.uid()) = 'admin'
  );

-- ─── Função: atualizar stats do cliente após venda ───────────────────
create or replace function atualizar_stats_cliente()
returns trigger language plpgsql as $$
begin
  update clientes set
    total_visitas = total_visitas + 1,
    total_gasto   = total_gasto   + NEW.total,
    ultima_visita = CURRENT_DATE
  where id = NEW.cliente_id;
  return NEW;
end;
$$;

create trigger after_venda_insert
  after insert on vendas
  for each row when (NEW.status_pagamento = 'aprovado')
  execute function atualizar_stats_cliente();
