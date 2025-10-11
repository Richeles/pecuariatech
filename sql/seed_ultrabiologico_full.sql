-- seed_ultrabiologico_full.sql (sample seed)
insert into public.rebanho (nome, raca, peso_kg, data_nascimento) values
('Boi-001','Nelore',350,'2022-05-10'),
('Vaca-001','Nelore',420,'2020-09-15');

insert into public.pastagem (nome, area_ha, tipo_pasto, qualidade, latitude, longitude) values
('Pastagem Norte', 5.2, 'Brachiaria', 'Alta', -15.2, -55.1),
('Pastagem Sul', 3.8, 'Panicum', 'Media', -15.21, -55.11);

insert into public.nutricao (descricao, energia, proteina, fibra) values
('Racao Basica A', 3200, 14, 28),
('Suplemento Proteico B', 3600, 20, 18);
