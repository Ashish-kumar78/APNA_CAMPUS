import os
import requests
import pandas as pd
from datetime import datetime
from db_cloud import sync_local_logs_to_neon, get_connection

LOGS_DIR = "attendance_logs"
BACKEND_URL = os.getenv("CAMPUS_API_URL", "http://localhost:4000")

def sync_attendance():
    print("=" * 65)
    print("🔄 APNA CAMPUS - ATTENDANCE CLOUD & SERVER SYNC TOOL")
    print("=" * 65)

    # 1. Sync directly to Neon Cloud Database
    print("\n[STEP 1] Checking Neon Cloud Database (PostgreSQL)...")
    conn = get_connection()
    if conn:
        print("  ✅ Neon Cloud Connected! Syncing records...")
        synced = sync_local_logs_to_neon(LOGS_DIR)
        print(f"  ☁️ Synced {synced} new record(s) to Neon Cloud.")
    else:
        print("  ℹ️ Neon Cloud not configured or unreachable.")
        print("     To enable, paste your connection string in '.env' as NEON_DATABASE_URL.")

    # 2. Check NestJS API Server
    print("\n[STEP 2] Checking APNA CAMPUS NestJS Backend Server...")
    today = datetime.now().strftime("%Y-%m-%d")
    today_file = os.path.join(LOGS_DIR, f"attendance_{today}.csv")

    if os.path.exists(today_file):
        df = pd.read_csv(today_file)
        attendance_map = {str(row["RollNumber"]): True for _, row in df.iterrows()}
        print(f"  ℹ️ Found {len(attendance_map)} record(s) for today ({today}).")

        try:
            resp = requests.get(f"{BACKEND_URL}/health", timeout=2)
            if resp.status_code == 200:
                print(f"  ✅ NestJS Server online at {BACKEND_URL}!")
        except Exception:
            print(f"  ℹ️ NestJS server not running locally. (Records safely stored in Neon/CSV).")
    else:
        print(f"  ℹ️ No attendance records for today ({today}) yet.")

    print("\n" + "=" * 65)
    print("Sync check finished.")
    print("=" * 65)

if __name__ == "__main__":
    sync_attendance()
