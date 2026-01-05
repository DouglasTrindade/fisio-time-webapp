-- Inserir dados de exemplo para teste

-- Inserir usuário de exemplo
INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt") 
VALUES 
    ('user_1', 'Dr. João Silva', 'joao@fisiotime.com', '$2b$10$example', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- Inserir pacientes de exemplo
INSERT INTO "Patient" ("id", "name", "phone", "email", "birthDate", "notes", "createdAt", "updatedAt") 
VALUES 
    ('patient_1', 'Maria Santos', '(11) 99999-9999', 'maria@email.com', '1985-03-15', 'Paciente com dor nas costas', NOW(), NOW()),
    ('patient_2', 'Pedro Oliveira', '(11) 88888-8888', 'pedro@email.com', '1990-07-22', 'Fisioterapia pós-cirúrgica', NOW(), NOW()),
    ('patient_3', 'Ana Costa', '(11) 77777-7777', NULL, '1978-12-10', 'Reabilitação do joelho', NOW(), NOW()),
    ('patient_4', 'Carlos Silva', '(11) 66666-6666', 'carlos@email.com', '1995-05-30', NULL, NOW(), NOW()),
    ('patient_5', 'Lucia Ferreira', '(11) 55555-5555', 'lucia@email.com', '1982-09-18', 'Tratamento de escoliose', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Inserir agendamentos de exemplo
INSERT INTO "Appointment" ("id", "name", "phone", "date", "status", "professionalId", "patientId", "createdAt", "updatedAt") 
VALUES 
    ('appointment_1', 'Maria Santos', '(11) 99999-9999', '2024-01-15 10:00:00', 'confirmed', 'user_1', 'patient_1', NOW(), NOW()),
    ('appointment_2', 'Pedro Oliveira', '(11) 88888-8888', '2024-01-15 14:00:00', 'confirmed', 'user_1', 'patient_2', NOW(), NOW()),
    ('appointment_3', 'Ana Costa', '(11) 77777-7777', '2024-01-16 09:00:00', 'confirmed', 'user_1', 'patient_3', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;
