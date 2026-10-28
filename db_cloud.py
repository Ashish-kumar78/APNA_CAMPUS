import os
import glob
import psycopg2
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Load .env file
load_dotenv()

NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL", "")

def get_connection():
    """Establishes connection to Neon Serverless PostgreSQL."""
    if not NEON_DATABASE_URL or "neon.tech" not in NEON_DATABASE_URL and "postgres" not in NEON_DATABASE_URL:
        return None
    try:
        # 15s timeout to allow Neon serverless compute to wake from Idle
        conn = psycopg2.connect(NEON_DATABASE_URL, connect_timeout=15)
        return conn
    except Exception as e:
        print(f"[NEON WARNING] Could not connect to Neon Cloud: {e}")
        return None

def init_neon_schema():
    """Initializes the attendance table in Neon if not already present."""
    conn = get_connection()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS face_attendance_logs (
                    id SERIAL PRIMARY KEY,
                    roll_number VARCHAR(50) NOT NULL,
                    student_name VARCHAR(100) NOT NULL,
                    date VARCHAR(20) NOT NULL,
                    time VARCHAR(20) NOT NULL,
                    status VARCHAR(20) DEFAULT 'PRESENT',
                    source VARCHAR(50) DEFAULT 'FACE_RECOGNITION_AI',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT unique_roll_per_date UNIQUE (roll_number, date)
                );
            """)
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"[NEON ERROR] Schema initialization failed: {e}")
        conn.close()
        return False

def push_attendance_to_neon(roll_number, name, date_str, time_str):
    """Pushes a single attendance record directly to Neon Cloud Database."""
    conn = get_connection()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO face_attendance_logs (roll_number, student_name, date, time, status)
                VALUES (%s, %s, %s, %s, 'PRESENT')
                ON CONFLICT (roll_number, date) DO NOTHING;
            """, (str(roll_number), str(name), str(date_str), str(time_str)))
        conn.commit()
        conn.close()
        print(f"[NEON CLOUD] ☁️ Synced to Neon PostgreSQL: {name} ({roll_number})")
        return True
    except Exception as e:
        print(f"[NEON ERROR] Failed to push to cloud: {e}")
        conn.close()
        return False

def sync_local_logs_to_neon(logs_dir="attendance_logs"):
    """Reads all local CSV logs and syncs any missing records to Neon."""
    conn = get_connection()
    if not conn:
        print("[NEON] No valid NEON_DATABASE_URL found in .env. Skipping cloud sync.")
        return 0

    init_neon_schema()
    
    csv_files = glob.glob(os.path.join(logs_dir, "attendance_*.csv"))
    if not csv_files:
        print("[NEON] No local attendance CSV files to sync.")
        conn.close()
        return 0

    total_synced = 0
    try:
        with conn.cursor() as cur:
            for csv_file in csv_files:
                df = pd.read_csv(csv_file)
                for _, row in df.iterrows():
                    cur.execute("""
                        INSERT INTO face_attendance_logs (roll_number, student_name, date, time, status)
                        VALUES (%s, %s, %s, %s, 'PRESENT')
                        ON CONFLICT (roll_number, date) DO NOTHING;
                    """, (str(row["RollNumber"]), str(row["Name"]), str(row["Date"]), str(row["Time"])))
                    if cur.rowcount > 0:
                        total_synced += 1
        conn.commit()
        conn.close()
        print(f"[NEON SUCCESS] ☁️ Successfully synchronized {total_synced} new record(s) to Neon Cloud!")
        return total_synced
    except Exception as e:
        print(f"[NEON ERROR] Cloud sync error: {e}")
        conn.close()
        return 0

if __name__ == "__main__":
    print("Testing Neon Cloud Database Connection...")
    conn = get_connection()
    if conn:
        print("✅ SUCCESS: Connected to Neon PostgreSQL Cloud Database!")
        init_neon_schema()
        sync_local_logs_to_neon()
    else:
        print("ℹ️ Set your NEON_DATABASE_URL in .env to connect.")
