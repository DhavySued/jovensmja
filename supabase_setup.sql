-- Execute este SQL no Editor SQL do seu projeto Supabase
-- https://supabase.com/dashboard/project/_/sql

CREATE TABLE IF NOT EXISTS public.pessoas (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  nome             text        NOT NULL,
  data_nascimento  date        NOT NULL,
  sexo             text        NOT NULL CHECK (sexo IN ('Masculino', 'Feminino')),
  categoria        text        NOT NULL,
  rua              text,
  bairro           text,
  cidade           text,
  como_conheceu    text,
  created_at       timestamptz DEFAULT now()
);

-- Se a tabela já existir, adicione as colunas com:
-- ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS rua text;
-- ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS bairro text;
-- ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS cidade text;
-- ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS como_conheceu text;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;

-- Política pública para leitura e escrita (ajuste conforme necessário)
CREATE POLICY "Acesso público" ON public.pessoas
  FOR ALL USING (true) WITH CHECK (true);

-- Índice para buscas por nome
CREATE INDEX IF NOT EXISTS idx_pessoas_nome ON public.pessoas (nome);
