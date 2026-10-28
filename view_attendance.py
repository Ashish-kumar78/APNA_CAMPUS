import os
import glob
import pandas as pd
from datetime import datetime

LOGS_DIR = "attendance_logs"

def view_attendance():
    print("=" * 60)
    print("📋 APNA CAMPUS - DAILY ATTENDANCE VIEWER")
    print("=" * 60)

    today = datetime.now().strftime("%Y-%m-%d")
    today_file = os.path.join(LOGS_DIR, f"attendance_{today}.csv")

    if not os.path.exists(today_file):
        print(f"[INFO] No attendance records found for today ({today}).")
        # List other log files if any
        all_logs = glob.glob(os.path.join(LOGS_DIR, "attendance_*.csv"))
        if all_logs:
            print(f"[INFO] Found {len(all_logs)} past attendance log file(s):")
            for f in sorted(all_logs, reverse=True)[:5]:
                print(f"   - {os.path.basename(f)}")
        return

    df = pd.read_csv(today_file)
    print(f"\n📅 Date: {today} | Total Present: {len(df)}")
    print("-" * 60)
    if df.empty:
        print("No punches recorded yet.")
    else:
        # Display formatted table
        print(df.to_string(index=False))
    print("-" * 60)

if __name__ == "__main__":
    view_attendance()
