CREATE TABLE IF NOT EXISTS pastagem (
    id SERIAL PRIMARY KEY,
    nome TEXT,
    area_ha NUMERIC,
    tipo_pasto TEXT,
    qualidade TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rebanho (
    id SERIAL PRIMARY KEY,
    raca TEXT,
    quantidade INT,
    ganho_peso_dia NUMERIC,
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financeiro (
    id SERIAL PRIMARY KEY,
    descricao TEXT,
    valor NUMERIC,
    data DATE,
    categoria TEXT
);
