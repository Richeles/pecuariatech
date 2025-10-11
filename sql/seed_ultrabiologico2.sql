-- seed_ultrabiologico2.sql
insert into public.rebanho(nome,raca,peso_kg,idade) values
('Boi Alpha','Nelore',320,2),
('Boi Beta','Angus',280,1);

insert into public.pastagem(nome,area_ha,tipo_pasto,qualidade,latitude,longitude) values
('Pastagem A',5.2,'Brachiaria','Boa',-23.5,-46.6),
('Pastagem B',3.8,'Panicum','Regular',-23.51,-46.61);
