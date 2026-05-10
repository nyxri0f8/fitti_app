INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES 
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'test01@fitti.org.in', crypt('Test@01', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'admin@fitti.org.in', crypt('Test@01', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'cook@fitti.org.in', crypt('Test@01', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'doctor@fitti.org.in', crypt('Test@01', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'trainer@fitti.org.in', crypt('Test@01', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

-- Add corresponding identities for these users
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT id::text, id, jsonb_build_object('sub', id, 'email', email), 'email', now(), now(), now()
FROM auth.users
WHERE email IN ('test01@fitti.org.in', 'admin@fitti.org.in', 'cook@fitti.org.in', 'doctor@fitti.org.in', 'trainer@fitti.org.in');
