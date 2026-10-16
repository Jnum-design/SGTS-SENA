import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
CORS_ORIGINS = [o.strip() for o in os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if o.strip()]
DEV_SHOW_RECOVERY_CODE = os.getenv("DEV_SHOW_RECOVERY_CODE", "true").lower() == "true"

if not DATABASE_URL or not SECRET_KEY:
    raise RuntimeError("Faltan DATABASE_URL o SECRET_KEY. Copia .env.example a .env y complétalo.")
