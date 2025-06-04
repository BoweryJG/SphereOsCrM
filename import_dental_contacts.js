const fs = require('fs');
const csv = require('csv-parse');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for backend operations
);

// Your user ID
const USER_ID = '5fe37075-c2f5-4acd-abef-1ef15d0c1ffd';
const CSV_FILE = '/Users/jasonsmacbookpro2022/Desktop/MasterD_NYCC.csv';
const BATCH_ID = `dental_import_${Date.now()}`;

async function importContacts() {
  console.log('Starting import from:', CSV_FILE);
  
  const fileContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const records = [];
  
  // Parse CSV
  const parser = csv.parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  parser.on('data', (row) => {
    // Transform CSV row to personal_contacts format
    const contact = {
      user_id: USER_ID,
      first_name: row['First Name'],
      last_name: row['Last Name'],
      email: row['Email'],
      phone: row['Phone Number'],
      mobile: row['Mobile Phone Number'],
      city: row['City'],
      state: row['State/Region'],
      job_title: row['Specialty'],
      notes: row['Notes'],
      source: 'dental_csv_import',
      import_batch_id: BATCH_ID,
      custom_data: {
        record_id: row['Record ID'],
        hubspot_score: row['HubSpot Score'],
        sales_activities: row['Number of Sales Activities'],
        contact_owner: row['Contact owner'],
        create_date: row['Create Date'],
        specialty: row['Specialty']
      }
    };
    
    // Add tags based on specialty
    const tags = [];
    if (row['Specialty']) {
      tags.push(row['Specialty']);
    }
    if (row['HubSpot Score'] && parseInt(row['HubSpot Score']) > 150) {
      tags.push('High Score');
    }
    if (row['Number of Sales Activities'] && parseInt(row['Number of Sales Activities']) > 10) {
      tags.push('Active');
    }
    contact.tags = tags;
    
    records.push(contact);
  });
  
  parser.on('end', async () => {
    console.log(`Parsed ${records.length} contacts`);
    
    // Import in batches of 100
    const batchSize = 100;
    let imported = 0;
    let failed = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('personal_contacts')
          .upsert(batch, {
            onConflict: 'user_id,email',
            ignoreDuplicates: false
          })
          .select();
        
        if (error) {
          console.error(`Batch ${i/batchSize} error:`, error);
          failed += batch.length;
        } else {
          imported += data.length;
          console.log(`Imported batch ${i/batchSize + 1}: ${data.length} contacts`);
        }
      } catch (err) {
        console.error(`Batch ${i/batchSize} exception:`, err);
        failed += batch.length;
      }
    }
    
    // Record import history
    await supabase.from('personal_contacts_import_history').insert({
      user_id: USER_ID,
      batch_id: BATCH_ID,
      file_name: 'MasterD_NYCC.csv',
      total_rows: records.length,
      imported_rows: imported,
      failed_rows: failed
    });
    
    console.log('\n=== Import Complete ===');
    console.log(`Total contacts: ${records.length}`);
    console.log(`Successfully imported: ${imported}`);
    console.log(`Failed: ${failed}`);
    console.log('\nYour contacts are now in your personal contacts!');
    console.log('Visit http://localhost:3000/personal-contacts to view them.');
  });
  
  parser.on('error', (err) => {
    console.error('CSV parsing error:', err);
  });
}

// Check if table exists first
async function checkTableAndImport() {
  const { error } = await supabase
    .from('personal_contacts')
    .select('id')
    .limit(1);
  
  if (error && error.code === '42P01') {
    console.error('❌ Table personal_contacts does not exist!');
    console.error('Please run the migration first:');
    console.error('supabase/migrations/20250604_personal_contacts.sql');
    return;
  }
  
  importContacts();
}

checkTableAndImport();