#!/usr/bin/env python3
"""
Create a summary of the CSV data and generate sample records
"""

import csv
from collections import Counter
from datetime import datetime

def analyze_csv(input_file):
    """Analyze CSV file and generate summary"""
    
    print("Analyzing CSV file...")
    
    # Initialize counters
    total_rows = 0
    specialty_counts = Counter()
    state_counts = Counter()
    owner_counts = Counter()
    year_counts = Counter()
    missing_emails = 0
    missing_phones = 0
    
    with open(input_file, 'r', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            total_rows += 1
            
            # Count specialties
            if row['Specialty']:
                specialty_counts[row['Specialty']] += 1
            
            # Count states
            if row['State/Region']:
                state_counts[row['State/Region']] += 1
            
            # Count owners
            if row['Contact owner']:
                owner_counts[row['Contact owner']] += 1
            
            # Count years
            if row['Create Date']:
                try:
                    year = datetime.strptime(row['Create Date'].strip(), '%Y-%m-%d %H:%M:%S').year
                    year_counts[year] += 1
                except:
                    pass
            
            # Check missing data
            if not row['Email'] or row['Email'].strip() == '':
                missing_emails += 1
            if not row['Phone Number'] or row['Phone Number'].strip() == '':
                missing_phones += 1
    
    # Generate summary report
    print(f"\n=== CSV DATA SUMMARY ===")
    print(f"Total Records: {total_rows:,}")
    print(f"Records with missing emails: {missing_emails:,} ({missing_emails/total_rows*100:.1f}%)")
    print(f"Records with missing phones: {missing_phones:,} ({missing_phones/total_rows*100:.1f}%)")
    
    print(f"\n=== TOP 10 SPECIALTIES ===")
    for specialty, count in specialty_counts.most_common(10):
        print(f"{specialty}: {count:,} ({count/total_rows*100:.1f}%)")
    
    print(f"\n=== TOP 10 STATES ===")
    for state, count in state_counts.most_common(10):
        print(f"{state}: {count:,} ({count/total_rows*100:.1f}%)")
    
    print(f"\n=== TOP 10 CONTACT OWNERS ===")
    for owner, count in owner_counts.most_common(10):
        print(f"{owner}: {count:,} ({count/total_rows*100:.1f}%)")
    
    print(f"\n=== RECORDS BY YEAR ===")
    for year in sorted(year_counts.keys()):
        count = year_counts[year]
        print(f"{year}: {count:,} ({count/total_rows*100:.1f}%)")
    
    # Generate sample records
    print(f"\n=== SAMPLE RECORDS (First 5) ===")
    with open(input_file, 'r', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        for i, row in enumerate(reader):
            if i >= 5:
                break
            print(f"\nRecord {i+1}:")
            print(f"  ID: {row['Record ID']}")
            print(f"  Name: {row['First Name']} {row['Last Name']}")
            print(f"  Email: {row['Email']}")
            print(f"  Specialty: {row['Specialty']}")
            print(f"  Location: {row['City']}, {row['State/Region']}")
            print(f"  Score: {row['HubSpot Score']}")

if __name__ == "__main__":
    input_csv = "/Users/jasonsmacbookpro2022/Desktop/MasterD_NYCC.csv"
    analyze_csv(input_csv)