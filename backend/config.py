import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGODB_URI = "mongodb://localhost:27017"
    #"mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0" 
      
    DATABASE_NAME = "F1_DB"