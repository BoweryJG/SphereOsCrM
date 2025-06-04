-- Table structure for personal_contacts
-- Based on the CSV data structure from MasterD_NYCC.csv

CREATE TABLE IF NOT EXISTS personal_contacts (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile_phone VARCHAR(50),
    job_title VARCHAR(255),  -- Maps to 'Specialty' in CSV
    company VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),      -- Maps to 'State/Region' in CSV
    country VARCHAR(255),
    notes TEXT,
    score INTEGER,           -- Maps to 'HubSpot Score' in CSV
    owner VARCHAR(255),      -- Maps to 'Contact owner' in CSV
    created_at TIMESTAMP,    -- Maps to 'Create Date' in CSV
    sales_activities_count INTEGER,  -- Maps to 'Number of Sales Activities' in CSV
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_personal_contacts_email ON personal_contacts(email);
CREATE INDEX idx_personal_contacts_external_id ON personal_contacts(external_id);
CREATE INDEX idx_personal_contacts_owner ON personal_contacts(owner);
CREATE INDEX idx_personal_contacts_state ON personal_contacts(state);
CREATE INDEX idx_personal_contacts_job_title ON personal_contacts(job_title);
CREATE INDEX idx_personal_contacts_created_at ON personal_contacts(created_at);