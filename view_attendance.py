"""
Smart Campus Attendance Viewer
view_attendance.py: Displays today's attendance from local CSV and Neon PostgreSQL Cloud.
"""

import os
import glob
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGS_DIR = os.path.join(BASE_DIR, "attendance_logs")

load_dotenv(os.path.join(BASE_DIR, ".env"))
NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL", "")


def view_attendance():
    print("=" * 70)
    print("📋 APNA CAMPUS - ATTENDANCE VIEWER (LOCAL & NEON CLOUD)")
    print("=" * 70)

    today = datetime.now().strftime("%Y-%m-%d")
    today_file = os.path.join(LOGS_DIR, f"attendance_{today}.csv")

    # 1. Local CSV Records
    print(f"\n📂 LOCAL LOGS ({today}):")
    if os.path.exists(today_file):
        try:
            df = pd.read_csv(today_file)
            if df.empty:
                print("  No records yet in local CSV.")
            else:
                print(df.to_string(index=False))
                print(f"  Total Local Punches: {len(df)}")
        except Exception as e:
            print(f"  Error reading CSV: {e}")
    else:
        print("  No local CSV attendance file created for today yet.")

    # 2. Neon PostgreSQL Cloud Records
    print(f"\n☁️ NEON POSTGRESQL CLOUD DATABASE ({today}):")
    try:
        import psycopg2
        if NEON_DATABASE_URL:
            conn = psycopg2.connect(NEON_DATABASE_URL, connect_timeout=8)
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT roll_number, student_name, date, time, status, source
                    FROM face_attendance_logs
                    WHERE date = %s
                    ORDER BY time ASC;
                """, (today,))
                rows = cur.fetchall()
            conn.close()

            if rows:
                cloud_df = pd.DataFrame(rows, columns=["RollNumber", "Name", "Date", "Time", "Status", "Source"])
                print(cloud_df.to_string(index=False))
                print(f"  Total Cloud Verified Records: {len(cloud_df)}")
            else:
                print(f"  No records in Neon Cloud for date {today} yet.")
        else:
            print("  NEON_DATABASE_URL not configured in .env.")
    except Exception as e:
        print(f"  Cloud query note: {e}")

    print("\n" + "=" * 70)


if __name__ == "__main__":
    view_attendance()
