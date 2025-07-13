-- Inserir dados na tabela racas

INSERT INTO public.racas (
  raca, cruzamento, clima_ideal, sistema_producao, ganho_peso_dia,
  ganho_peso_mes, ganho_peso_ano, arroba_ha,
  media_diaria_arroba, media_quinzenal_arroba, media_ciclo_arroba,
  alimentacao, manejo
) VALUES
('Nelore', 'Nelore Puro', 'Tropical', 'Extensivo', 0.8, 24.0, 288.0, 30.0, 0.5, 3.5, 14.0, 'Capim Brachiaria', 'Manejo rotacionado'),
('Guzerá', 'Guzerá Puro', 'Semiárido', 'Intensivo', 0.9, 27.0, 324.0, 32.0, 0.6, 4.0, 16.0, 'Capim Mombaça', 'Confinamento parcial'),
('Girolando', 'Holandês x Gir', 'Subtropical', 'Semi-intensivo', 1.0, 30.0, 360.0, 35.0, 0.7, 4.5, 18.0, 'Silagem de milho', 'Pasto com suplementação'),
('Angus', 'Angus Puro', 'Temperado', 'Confinado', 1.2, 36.0, 432.0, 38.0, 0.8, 5.0, 20.0, 'Ração balanceada', 'Confinamento total');
