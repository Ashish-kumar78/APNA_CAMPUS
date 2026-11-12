"""
APNA CAMPUS - Deep Neural Embedding Compiler (AdaFace IR-50)
train_model.py: Compiles student face crops from dataset/ into 512-D L2-normalized deep centroids.
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from migrate_sface_to_adaface import run_database_migration


def main():
    print("=" * 70)
    print("🧠 APNA CAMPUS - DEEP NEURAL EMBEDDING COMPILER (ADAFACE IR-50)")
    print("=" * 70)
    res = run_database_migration(
        dataset_dir=os.path.join(BASE_DIR, "dataset"),
        face_db_path=os.path.join(BASE_DIR, "models", "face_database.npz"),
        backup_db_path=os.path.join(BASE_DIR, "models", "face_database_sface_backup.npz"),
        metadata_json_path=os.path.join(BASE_DIR, "models", "migration_metadata.json"),
        students_json_path=os.path.join(BASE_DIR, "models", "students.json")
    )
    if res and res.get("validation_passed"):
        print(f"\n✅ Training/Compilation finished successfully. {res.get('total_students_migrated', 0)} students compiled.")
    else:
        print(f"\n❌ Compilation failed: {res.get('message', 'Validation error') if res else 'No report returned'}")


if __name__ == "__main__":
    main()
