-- Import dental contacts from CSV data
-- First, make sure the personal_contacts table exists by running:
-- supabase/migrations/20250604_personal_contacts.sql

-- Import all contacts from MasterD_NYCC.csv
INSERT INTO personal_contacts (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  mobile,
  city,
  state,
  job_title,
  notes,
  tags,
  source,
  import_batch_id,
  custom_data
) VALUES
('5fe37075-c2f5-4acd-abef-1ef15d0c1ffd', 'Sagar', 'Lunagaria', 'sagar.lunagaria.dmd@gmail.com', '17327634705', '7372634705', 'Hillsborough', 'New Jersey', 'General Dentist', '4-5 Full Arches Monthly, Spent roughly 45 minutes at booth, Views Yomi as a way to separate himself clinically and advertise. Using Guides now. Went from shy at first, to very open and wanted to take next steps.', ARRAY['General Dentist', 'High Score'], 'dental_csv_import', 'dental_nycc_2024', '{"hubspot_score": "181", "contact_owner": "Patrick Scanlan", "sales_activities": "3"}'),
('5fe37075-c2f5-4acd-abef-1ef15d0c1ffd', 'Keith', 'Flack', 'drkflack@hotmail.com', '15073820457', '5073820457', 'MANKATO', 'Minnesota', 'General Dentist', NULL, ARRAY['General Dentist', 'High Score', 'Active'], 'dental_csv_import', 'dental_nycc_2024', '{"hubspot_score": "175", "contact_owner": "Alejandra Montes", "sales_activities": "84"}'),
('5fe37075-c2f5-4acd-abef-1ef15d0c1ffd', 'Pouya', 'Namiranian', 'py.namiranian@gmail.com', '916-616-1050', NULL, 'Sacramento', 'California', 'Oral Surgeon', 'Good volume. Mostly freehand. High innovator. Big focus on differentiation. Wants to do a case observation. Sunen Pandya for sure.', ARRAY['Oral Surgeon', 'High Score', 'Active'], 'dental_csv_import', 'dental_nycc_2024', '{"hubspot_score": "174", "contact_owner": "Robert Prenter", "sales_activities": "17"}'),
('5fe37075-c2f5-4acd-abef-1ef15d0c1ffd', 'David', 'Umansky', 'umanskyrex@gmail.com', '832-275-4926', '8322754926', 'Atascocita', 'Texas', 'General Dentist', 'Out of Houston, Matt contact!', ARRAY['General Dentist', 'High Score', 'Active'], 'dental_csv_import', 'dental_nycc_2024', '{"hubspot_score": "163", "contact_owner": "Martin Dixon", "sales_activities": "35"}'),
('5fe37075-c2f5-4acd-abef-1ef15d0c1ffd', 'Fred', 'Puccio', 'fpuccio@midlandfamilydental.com', '201-206-4097', '2012064097', 'Wyckoff', 'New Jersey', 'General Dentist', 'Nick, you are working with him already. He is on the edge.  Told him that now is the time for taking advantage of the promotions for this quarter.', ARRAY['General Dentist', 'High Score', 'Active'], 'dental_csv_import', 'dental_nycc_2024', '{"hubspot_score": "160", "contact_owner": "Patrick Scanlan", "sales_activities": "45"}'),
('5fe37075-c2f5-4acd-abef-1ef15d0c1ffd', 'Fabrice', 'Gallez', 'drgallez@drgallezperio.com', '4083569366', '+16692322250', 'San Jose', 'California', 'Periodontist', NULL, ARRAY['Periodontist', 'High Score', 'Active'], 'dental_csv_import', 'dental_nycc_2024', '{"hubspot_score": "160", "contact_owner": "Robert Prenter", "sales_activities": "52"}'),
('5fe37075-c2f5-4acd-abef-1ef15d0c1ffd', 'Sivothayan', 'Sevvanthiraja', 'sivothayan@msn.com', '+17072387226', '+12159893055', 'Philadelphia', 'California', 'General Dentist', NULL, ARRAY['General Dentist', 'High Score', 'Active'], 'dental_csv_import', 'dental_nycc_2024', '{"hubspot_score": "159", "contact_owner": "Robert Prenter", "sales_activities": "14"}'),
('5fe37075-c2f5-4acd-abef-1ef15d0c1ffd', 'Venkatesh', 'Srinivasan', 'venky@brightsmilesga.com', NULL, '6787773815', 'Cummings', 'Georgia', 'General Dentist', NULL, ARRAY['General Dentist', 'High Score', 'Active'], 'dental_csv_import', 'dental_nycc_2024', '{"hubspot_score": "158", "contact_owner": "joseph penigar", "sales_activities": "34"}'),
('5fe37075-c2f5-4acd-abef-1ef15d0c1ffd', 'Joseph', 'Lichter', 'drjoelichter@gmail.com', '5162427802', NULL, 'BROOKLYN', 'New York', 'General Dentist', 'REPORT: Advancing Implantology at Joseph Lichter DDS with Yomi Robotics', ARRAY['General Dentist', 'High Score', 'Active'], 'dental_csv_import', 'dental_nycc_2024', '{"hubspot_score": "158", "contact_owner": "", "sales_activities": "19"}')
ON CONFLICT (user_id, email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = COALESCE(EXCLUDED.phone, personal_contacts.phone),
  mobile = COALESCE(EXCLUDED.mobile, personal_contacts.mobile),
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  job_title = EXCLUDED.job_title,
  notes = EXCLUDED.notes,
  tags = EXCLUDED.tags,
  custom_data = personal_contacts.custom_data || EXCLUDED.custom_data,
  updated_at = NOW();

-- Note: This is just the first 9 contacts from your CSV
-- The full file has many more contacts that need to be imported
-- For the complete import, use the UI upload feature or the import script