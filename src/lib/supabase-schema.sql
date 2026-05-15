-- BarberPro — Schema Supabase
-- Execute este arquivo no SQL Editor do seu projeto Supabase.
-- O arquivo é idempotente para facilitar reaplicação durante evolução do front.

create extension if not exists "uuid-ossp";

-- ─── Tabelas principais ─────────────────────────────────────────────
create table if not exists unidades (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  slug        text not null unique,
  endereco    text,
  cidade      text,
  telefone    text,
  gerente     text,
  cor         text default 'from-orange-500 to-rose-600',
  ativa       boolean default true,
  created_at  timestamptz default now()
);

create table if not exists perfis (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null,
  role        text not null check (role in ('admin','barbeiro','caixa')),
  unidade_id  uuid references unidades(id),
  avatar_url  text,
  barbeiro_id uuid,
  ativo       boolean default true,
  created_at  timestamptz default now()
);

create table if not exists barbeiros (
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

create table if not exists servicos (
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

create table if not exists produtos (
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

create table if not exists clientes (
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
  ativo           boolean default true,
  created_at      timestamptz default now()
);

create table if not exists agendamentos (
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
  origem       text default 'sistema',
  created_at   timestamptz default now()
);

create table if not exists agendamento_servicos (
  id              uuid primary key default uuid_generate_v4(),
  agendamento_id  uuid references agendamentos(id) on delete cascade,
  servico_id      uuid references servicos(id),
  preco           numeric(10,2) not null
);

create table if not exists vendas (
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

create table if not exists venda_itens (
  id             uuid primary key default uuid_generate_v4(),
  venda_id       uuid references vendas(id) on delete cascade,
  tipo           text not null check (tipo in ('servico','produto')),
  referencia_id  uuid not null,
  nome           text not null,
  quantidade     int default 1,
  preco_unit     numeric(10,2) not null,
  desconto       int default 0,
  subtotal       numeric(10,2) not null
);

create table if not exists transacoes (
  id          uuid primary key default uuid_generate_v4(),
  unidade_id  uuid references unidades(id) on delete cascade,
  tipo        text not null check (tipo in ('receita','despesa')),
  descricao   text not null,
  valor       numeric(10,2) not null,
  categoria   text,
  metodo      text,
  data        date not null,
  venda_id    uuid references vendas(id),
  ativo       boolean default true,
  created_at  timestamptz default now()
);

create table if not exists comissoes (
  id           uuid primary key default uuid_generate_v4(),
  unidade_id   uuid references unidades(id),
  barbeiro_id  uuid references barbeiros(id) on delete cascade,
  venda_id     uuid references vendas(id),
  valor_venda  numeric(10,2) not null,
  pct          int not null,
  valor        numeric(10,2) not null,
  pago         boolean default false,
  data_pag     date,
  periodo_ref  text,
  created_at   timestamptz default now()
);

create table if not exists fidelidade_config (
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

alter table perfis add column if not exists barbeiro_id uuid;
alter table clientes add column if not exists ativo boolean default true;
alter table transacoes add column if not exists ativo boolean default true;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'perfis_barbeiro_id_fkey'
  ) then
    alter table perfis
      add constraint perfis_barbeiro_id_fkey
      foreign key (barbeiro_id) references barbeiros(id)
      deferrable initially deferred;
  end if;
end
$$;

create index if not exists idx_perfis_unidade on perfis(unidade_id);
create index if not exists idx_barbeiros_unidade on barbeiros(unidade_id);
create index if not exists idx_clientes_unidade on clientes(unidade_id);
create index if not exists idx_agendamentos_unidade_data on agendamentos(unidade_id, data);
create index if not exists idx_transacoes_unidade_data on transacoes(unidade_id, data);

-- ─── Helpers privados para RLS ──────────────────────────────────────
create schema if not exists app_private;

create or replace function app_private.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.perfis where id = auth.uid() and ativo is not false
$$;

create or replace function app_private.current_unidade_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select unidade_id from public.perfis where id = auth.uid() and ativo is not false
$$;

create or replace function app_private.current_barbeiro_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(barbeiro_id, (select id from public.barbeiros where perfil_id = auth.uid() limit 1))
  from public.perfis
  where id = auth.uid() and ativo is not false
$$;

create or replace function app_private.has_role(roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select app_private.current_role() = any(roles)
$$;

create or replace function app_private.can_access_unit(row_unidade_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    app_private.current_role() = 'admin'
    or row_unidade_id = app_private.current_unidade_id()
$$;

revoke all on schema app_private from public;
grant usage on schema app_private to authenticated;
grant execute on all functions in schema app_private to authenticated;

-- ─── RLS ─────────────────────────────────────────────────────────────
alter table unidades enable row level security;
alter table perfis enable row level security;
alter table barbeiros enable row level security;
alter table servicos enable row level security;
alter table produtos enable row level security;
alter table clientes enable row level security;
alter table agendamentos enable row level security;
alter table agendamento_servicos enable row level security;
alter table vendas enable row level security;
alter table venda_itens enable row level security;
alter table transacoes enable row level security;
alter table comissoes enable row level security;
alter table fidelidade_config enable row level security;

drop policy if exists "Users see own unit" on clientes;

-- Perfis
drop policy if exists "perfis_select_own_or_admin" on perfis;
create policy "perfis_select_own_or_admin" on perfis
for select to authenticated
using (id = auth.uid() or app_private.has_role(array['admin']));

drop policy if exists "perfis_insert_admin" on perfis;
create policy "perfis_insert_admin" on perfis
for insert to authenticated
with check (app_private.has_role(array['admin']));

drop policy if exists "perfis_update_own_or_admin" on perfis;
create policy "perfis_update_own_or_admin" on perfis
for update to authenticated
using (id = auth.uid() or app_private.has_role(array['admin']))
with check (id = auth.uid() or app_private.has_role(array['admin']));

-- Unidades
drop policy if exists "unidades_select_scoped" on unidades;
create policy "unidades_select_scoped" on unidades
for select to authenticated
using (app_private.has_role(array['admin']) or id = app_private.current_unidade_id());

drop policy if exists "unidades_insert_admin" on unidades;
create policy "unidades_insert_admin" on unidades
for insert to authenticated
with check (app_private.has_role(array['admin']));

drop policy if exists "unidades_update_admin" on unidades;
create policy "unidades_update_admin" on unidades
for update to authenticated
using (app_private.has_role(array['admin']))
with check (app_private.has_role(array['admin']));

-- Barbeiros
drop policy if exists "barbeiros_select_scoped" on barbeiros;
create policy "barbeiros_select_scoped" on barbeiros
for select to authenticated
using (
  app_private.can_access_unit(unidade_id)
  or id = app_private.current_barbeiro_id()
);

drop policy if exists "barbeiros_write_admin" on barbeiros;
create policy "barbeiros_write_admin" on barbeiros
for insert to authenticated
with check (app_private.has_role(array['admin']) and app_private.can_access_unit(unidade_id));

drop policy if exists "barbeiros_update_admin" on barbeiros;
create policy "barbeiros_update_admin" on barbeiros
for update to authenticated
using (app_private.has_role(array['admin']) and app_private.can_access_unit(unidade_id))
with check (app_private.has_role(array['admin']) and app_private.can_access_unit(unidade_id));

-- Serviços
drop policy if exists "servicos_select_scoped" on servicos;
create policy "servicos_select_scoped" on servicos
for select to authenticated
using (app_private.can_access_unit(unidade_id));

drop policy if exists "servicos_write_admin" on servicos;
create policy "servicos_write_admin" on servicos
for insert to authenticated
with check (app_private.has_role(array['admin']) and app_private.can_access_unit(unidade_id));

drop policy if exists "servicos_update_admin" on servicos;
create policy "servicos_update_admin" on servicos
for update to authenticated
using (app_private.has_role(array['admin']) and app_private.can_access_unit(unidade_id))
with check (app_private.has_role(array['admin']) and app_private.can_access_unit(unidade_id));

-- Produtos
drop policy if exists "produtos_select_admin_caixa" on produtos;
create policy "produtos_select_admin_caixa" on produtos
for select to authenticated
using (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id));

drop policy if exists "produtos_write_admin_caixa" on produtos;
create policy "produtos_write_admin_caixa" on produtos
for insert to authenticated
with check (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id));

drop policy if exists "produtos_update_admin_caixa" on produtos;
create policy "produtos_update_admin_caixa" on produtos
for update to authenticated
using (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id))
with check (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id));

-- Clientes
drop policy if exists "clientes_select_scoped" on clientes;
create policy "clientes_select_scoped" on clientes
for select to authenticated
using (app_private.can_access_unit(unidade_id));

drop policy if exists "clientes_write_admin_caixa" on clientes;
create policy "clientes_write_admin_caixa" on clientes
for insert to authenticated
with check (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id));

drop policy if exists "clientes_update_admin_caixa" on clientes;
create policy "clientes_update_admin_caixa" on clientes
for update to authenticated
using (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id))
with check (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id));

-- Agendamentos
drop policy if exists "agendamentos_select_scoped" on agendamentos;
create policy "agendamentos_select_scoped" on agendamentos
for select to authenticated
using (
  (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id))
  or
  (app_private.has_role(array['barbeiro']) and barbeiro_id = app_private.current_barbeiro_id())
);

drop policy if exists "agendamentos_insert_scoped" on agendamentos;
create policy "agendamentos_insert_scoped" on agendamentos
for insert to authenticated
with check (
  (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id))
  or
  (app_private.has_role(array['barbeiro']) and barbeiro_id = app_private.current_barbeiro_id())
);

drop policy if exists "agendamentos_update_scoped" on agendamentos;
create policy "agendamentos_update_scoped" on agendamentos
for update to authenticated
using (
  (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id))
  or
  (app_private.has_role(array['barbeiro']) and barbeiro_id = app_private.current_barbeiro_id())
)
with check (
  (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id))
  or
  (app_private.has_role(array['barbeiro']) and barbeiro_id = app_private.current_barbeiro_id())
);

-- Agendamento serviços via agendamento pai
drop policy if exists "agendamento_servicos_select_scoped" on agendamento_servicos;
create policy "agendamento_servicos_select_scoped" on agendamento_servicos
for select to authenticated
using (
  exists (
    select 1 from agendamentos a
    where a.id = agendamento_id
  )
);

drop policy if exists "agendamento_servicos_write_scoped" on agendamento_servicos;
create policy "agendamento_servicos_write_scoped" on agendamento_servicos
for insert to authenticated
with check (
  exists (
    select 1 from agendamentos a
    where a.id = agendamento_id
  )
);

drop policy if exists "agendamento_servicos_update_scoped" on agendamento_servicos;
create policy "agendamento_servicos_update_scoped" on agendamento_servicos
for update to authenticated
using (
  exists (
    select 1 from agendamentos a
    where a.id = agendamento_id
  )
)
with check (
  exists (
    select 1 from agendamentos a
    where a.id = agendamento_id
  )
);

-- Vendas, itens e financeiro
drop policy if exists "vendas_select_admin_caixa" on vendas;
create policy "vendas_select_admin_caixa" on vendas
for select to authenticated
using (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id));

drop policy if exists "vendas_insert_admin_caixa" on vendas;
create policy "vendas_insert_admin_caixa" on vendas
for insert to authenticated
with check (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id));

drop policy if exists "vendas_update_admin_caixa" on vendas;
create policy "vendas_update_admin_caixa" on vendas
for update to authenticated
using (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id))
with check (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id));

drop policy if exists "venda_itens_select_venda_scoped" on venda_itens;
create policy "venda_itens_select_venda_scoped" on venda_itens
for select to authenticated
using (exists (select 1 from vendas v where v.id = venda_id));

drop policy if exists "venda_itens_insert_venda_scoped" on venda_itens;
create policy "venda_itens_insert_venda_scoped" on venda_itens
for insert to authenticated
with check (exists (select 1 from vendas v where v.id = venda_id));

drop policy if exists "transacoes_select_admin_caixa" on transacoes;
create policy "transacoes_select_admin_caixa" on transacoes
for select to authenticated
using (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id));

drop policy if exists "transacoes_insert_admin_caixa" on transacoes;
create policy "transacoes_insert_admin_caixa" on transacoes
for insert to authenticated
with check (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id));

drop policy if exists "transacoes_update_admin_caixa" on transacoes;
create policy "transacoes_update_admin_caixa" on transacoes
for update to authenticated
using (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id))
with check (app_private.has_role(array['admin','caixa']) and app_private.can_access_unit(unidade_id));

-- Comissões
drop policy if exists "comissoes_select_admin_or_owner" on comissoes;
create policy "comissoes_select_admin_or_owner" on comissoes
for select to authenticated
using (
  (app_private.has_role(array['admin']) and app_private.can_access_unit(unidade_id))
  or
  (app_private.has_role(array['barbeiro']) and barbeiro_id = app_private.current_barbeiro_id())
);

drop policy if exists "comissoes_write_admin" on comissoes;
create policy "comissoes_write_admin" on comissoes
for insert to authenticated
with check (app_private.has_role(array['admin']) and app_private.can_access_unit(unidade_id));

drop policy if exists "comissoes_update_admin" on comissoes;
create policy "comissoes_update_admin" on comissoes
for update to authenticated
using (app_private.has_role(array['admin']) and app_private.can_access_unit(unidade_id))
with check (app_private.has_role(array['admin']) and app_private.can_access_unit(unidade_id));

-- Fidelidade
drop policy if exists "fidelidade_select_scoped" on fidelidade_config;
create policy "fidelidade_select_scoped" on fidelidade_config
for select to authenticated
using (app_private.can_access_unit(unidade_id));

drop policy if exists "fidelidade_write_admin" on fidelidade_config;
create policy "fidelidade_write_admin" on fidelidade_config
for insert to authenticated
with check (app_private.has_role(array['admin']) and app_private.can_access_unit(unidade_id));

drop policy if exists "fidelidade_update_admin" on fidelidade_config;
create policy "fidelidade_update_admin" on fidelidade_config
for update to authenticated
using (app_private.has_role(array['admin']) and app_private.can_access_unit(unidade_id))
with check (app_private.has_role(array['admin']) and app_private.can_access_unit(unidade_id));

-- ─── Stats do cliente após venda aprovada ───────────────────────────
create or replace function atualizar_stats_cliente()
returns trigger language plpgsql as $$
begin
  update clientes set
    total_visitas = coalesce(total_visitas, 0) + 1,
    total_gasto   = coalesce(total_gasto, 0) + NEW.total,
    ultima_visita = CURRENT_DATE
  where id = NEW.cliente_id;
  return NEW;
end;
$$;

drop trigger if exists after_venda_insert on vendas;
create trigger after_venda_insert
  after insert on vendas
  for each row when (NEW.status_pagamento = 'aprovado')
  execute function atualizar_stats_cliente();
