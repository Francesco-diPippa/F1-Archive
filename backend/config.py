import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGODB_URI = "mongodb://localhost:27017"
    DATABASE_NAME = "F1_DB"