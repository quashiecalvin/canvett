import os
import sys

os.environ.setdefault("DATABASE_URL", "sqlite://")

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
