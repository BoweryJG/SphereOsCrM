#!/usr/bin/env python3
"""
Convert MasterD_NYCC.csv to SQL INSERT statements for personal_contacts table
"""

import csv
import sys
import re
from datetime import datetime

def clean_phone(phone):
    """Clean phone number to digits only"""
    if not phone or phone.strip() == '':
        return None
    # Remove all non-digit characters
    cleaned = re.sub(r'[^\d]', '', phone.strip())
    if cleaned:
        return cleaned
    return None

def clean_text(text):
    """Clean text for SQL insertion"""
    if not text or text.strip() == '':
        return None
    # Escape single quotes for SQL
    cleaned = text.strip().replace("'", "''")
    return cleaned

def clean_number(num):
    """Clean numeric value"""
    if not num or num.strip() == '':
        return None
    try:
        # Remove decimal if it's .0
        val = float(num)
        if val.is_integer():
            return str(int(val))
        return str(val)
    except:
        return None

def parse_date(date_str):
    """Parse date string to SQL format"""
    if not date_str or date_str.strip() == '':
        return None
    try:
        # Parse the date format from CSV: 2022-04-22 16:15:00
        dt = datetime.strptime(date_str.strip(), '%Y-%m-%d %H:%M:%S')
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except:
        return None

def process_csv(input_file, output_file):
    """Process CSV file and generate SQL INSERT statements"""
    
    # Count total rows first
    print("Counting rows...", file=sys.stderr)
    total_rows = sum(1 for line in open(input_file, 'r', encoding='utf-8-sig')) - 1  # Subtract header
    print(f"Total rows to process: {total_rows}", file=sys.stderr)
    
    with open(input_file, 'r', encoding='utf-8-sig') as csvfile:
        with open(output_file, 'w', encoding='utf-8') as sqlfile:
            # Write header
            sqlfile.write("-- SQL INSERT statements for personal_contacts table\n")
            sqlfile.write("-- Generated from MasterD_NYCC.csv\n\n")
            
            reader = csv.DictReader(csvfile)
            
            batch_size = 1000
            batch = []
            row_count = 0
            
            for row in reader:
                row_count += 1
                
                # Extract and clean fields
                record_id = clean_text(row['Record ID'])
                first_name = clean_text(row['First Name'])
                last_name = clean_text(row['Last Name'])
                hubspot_score = clean_number(row['HubSpot Score'])
                specialty = clean_text(row['Specialty'])
                city = clean_text(row['City'])
                state_region = clean_text(row['State/Region'])
                email = clean_text(row['Email'])
                phone_number = clean_phone(row['Phone Number'])
                mobile_phone = clean_phone(row['Mobile Phone Number'])
                sales_activities = clean_number(row['Number of Sales Activities'])
                notes = clean_text(row['Notes'])
                contact_owner = clean_text(row['Contact owner'])
                create_date = parse_date(row['Create Date'])
                
                # Build values for this row
                values = []
                
                # Map CSV fields to database columns
                # Assuming personal_contacts table structure based on common CRM patterns
                values.append(f"'{record_id}'" if record_id else "NULL")  # external_id
                values.append(f"'{first_name}'" if first_name else "NULL")  # first_name
                values.append(f"'{last_name}'" if last_name else "NULL")  # last_name
                values.append(f"'{email}'" if email else "NULL")  # email
                values.append(f"'{phone_number}'" if phone_number else "NULL")  # phone
                values.append(f"'{mobile_phone}'" if mobile_phone else "NULL")  # mobile_phone
                values.append(f"'{specialty}'" if specialty else "NULL")  # specialty/job_title
                values.append("NULL")  # company (not in CSV)
                values.append(f"'{city}'" if city else "NULL")  # city
                values.append(f"'{state_region}'" if state_region else "NULL")  # state
                values.append("NULL")  # country (not in CSV)
                values.append(f"'{notes}'" if notes else "NULL")  # notes
                values.append(f"{hubspot_score}" if hubspot_score else "NULL")  # score
                values.append(f"'{contact_owner}'" if contact_owner else "NULL")  # owner
                values.append(f"'{create_date}'" if create_date else "NULL")  # created_at
                values.append(f"{sales_activities}" if sales_activities else "NULL")  # sales_activities_count
                
                batch.append(f"({','.join(values)})")
                
                # Write batch when it reaches batch_size
                if len(batch) >= batch_size:
                    sqlfile.write("INSERT INTO personal_contacts (external_id, first_name, last_name, email, phone, mobile_phone, job_title, company, city, state, country, notes, score, owner, created_at, sales_activities_count) VALUES\n")
                    sqlfile.write(",\n".join(batch))
                    sqlfile.write(";\n\n")
                    batch = []
                    
                    print(f"Processed {row_count}/{total_rows} rows ({row_count/total_rows*100:.1f}%)", file=sys.stderr)
            
            # Write remaining batch
            if batch:
                sqlfile.write("INSERT INTO personal_contacts (external_id, first_name, last_name, email, phone, mobile_phone, job_title, company, city, state, country, notes, score, owner, created_at, sales_activities_count) VALUES\n")
                sqlfile.write(",\n".join(batch))
                sqlfile.write(";\n\n")
            
            print(f"\nCompleted! Processed {row_count} rows.", file=sys.stderr)
            print(f"Output written to: {output_file}", file=sys.stderr)

if __name__ == "__main__":
    input_csv = "/Users/jasonsmacbookpro2022/Desktop/MasterD_NYCC.csv"
    output_sql = "/Users/jasonsmacbookpro2022/SphereOsCrM/personal_contacts_import.sql"
    
    print("Starting CSV to SQL conversion...", file=sys.stderr)
    process_csv(input_csv, output_sql)