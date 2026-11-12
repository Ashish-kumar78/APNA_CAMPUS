"""
Smart Campus CCTV Student Face Enrollment
register_student.py (Routes to unified enroll_student_cli pipeline)
"""

import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from enroll_student_cli import prompt_user_interactively, enroll_student_pipeline

if __name__ == "__main__":
    reg_no, name, stream_source, image_path = prompt_user_interactively()
    enroll_student_pipeline(
        reg_no=reg_no,
        name=name,
        stream_source=stream_source,
        image_path=image_path
    )
