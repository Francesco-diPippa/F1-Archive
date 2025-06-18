from pymongo import MongoClient
from config import Config

class Database:
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance
    
    def connect(self):
        if self._client is None:
            self._client = MongoClient(Config.MONGODB_URI)
            self._db = self._client[Config.DATABASE_NAME]
            print(f"Connesso a MongoDB: {Config.DATABASE_NAME}")
        return self._db
    
    def get_collection(self, collection_name=None):
        if self._db is None:
            self.connect()
        collection_name = collection_name or Config.COLLECTION_NAME
        return self._db[collection_name]
    
    def close(self):
        if self._client:
            self._client.close()
            self._client = None
            self._db = None