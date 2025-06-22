import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
import pandas as pd

MONGODB_URI = "mongodb://localhost:27017"
DATABASE_NAME = "F1_DB"
PATH_DATASET = './dataset/cleaned'

id_fields = {'constructors': 'constructorId', 'drivers': 'driverId', 'races': 'raceId', 'results': 'resultId', 'circuits': 'circuitId'}

def find_files():
     # Verifica se la cartella esiste
    if not os.path.exists(PATH_DATASET):
        print(f"Error: folder '{PATH_DATASET}' not exist.")
        return
    
    if not os.path.isdir(PATH_DATASET):
        print(f"Error: '{PATH_DATASET}' is not a folder.")
        return
    
    # Ottiene la lista dei file nella cartella
    try:
        files = [f for f in os.listdir(PATH_DATASET) 
                if os.path.isfile(os.path.join(PATH_DATASET, f))]
        
        if not files:
            print(f"Not files found in '{PATH_DATASET}'.")
            return
        
        print(f"Found {len(files)} file/s in '{PATH_DATASET}':\n")
        
        # Itera attraverso ogni file
        for file_name in files:
            print(f"\tFILE: {file_name}")

        return files
    
    except PermissionError:
        print(f"Errore: Permessi insufficienti per accedere alla cartella '{PATH_DATASET}'.")
    except Exception as e:
        print(f"Errore imprevisto: {e}")
    
async def load_csv_to_mongodb(client, db, file_path, collection_name):
    """Carica un singolo file CSV in MongoDB"""
    try:
        print(f"\nCaricamento {file_path} nella collezione '{collection_name}'...")
        
        # Leggi il CSV
        df = pd.read_csv(file_path)
        print(f"Righe nel CSV: {len(df)}")
        print(f"Colonne: {list(df.columns)}")
        
        # Converti NaN in None per MongoDB
        df = df.where(pd.notnull(df), None)

        id_field = id_fields.get(collection_name)
        if id_field and id_field in df.columns:
            df.rename(columns={id_field: '_id'}, inplace=True)
        
        # Converti DataFrame in lista di dizionari
        records = df.to_dict('records')
        
        # Ottieni la collezione
        collection = db[collection_name]
        
        # Elimina la collezione esistente se presente
        await collection.drop()
        print(f"Collezione '{collection_name}' eliminata se esistente")
        
        # Inserisci i dati
        if records:
            result = await collection.insert_many(records)
            print(f"Inseriti {len(result.inserted_ids)} documenti in '{collection_name}'")            
            return True
        else:
            print(f"Nessun record da inserire per '{collection_name}'")
            return False
            
    except Exception as e:
        print(f"Errore durante il caricamento di {file_path}: {e}")
        return False

async def setup_database():
    print("Connessione a MongoDB...")
    client = AsyncIOMotorClient(MONGODB_URI)
    
    try:
        # Test connessione
        await client.server_info()
        print("Connessione riuscita!")
        
        # Seleziona database
        db = client[DATABASE_NAME]
        
        # Elimina collezione esistente (per test)
        files = find_files()
        print(f"\nInizio caricamento di {len(files)} file CSV...")
        
        # Carica ogni file CSV
        success_count = 0
        for filename in files:
            file_path = os.path.join(PATH_DATASET, filename)
            collection_name = filename.split('_')[0]
            
            success = await load_csv_to_mongodb(client, db, file_path, collection_name)
            if success:
                success_count += 1
        
        print(f"\n{'='*50}")
        print(f"Caricamento completato!")
        print(f"File elaborati con successo: {success_count}/{len(files)}")
    
        # Mostra statistiche finali
        collections = await db.list_collection_names()
        print(f"\nCollezioni create:")
        for coll_name in collections:
            collection = db[coll_name]
            count = await collection.count_documents({})
            indexes = await collection.list_indexes().to_list(length=None)
            index_names = [idx['name'] for idx in indexes if idx['name'] != '_id_']
            print(f"  • {coll_name}: {count} documenti, indici: {index_names if index_names else 'solo _id_'}")
        
        print("\nSetup completato con successo!")
        return True
        
    except Exception as e:
        print(f"Errore durante il setup: {e}")
        return False
    
    finally:
        client.close()
    
    return True

async def check_connection():
    print("Verifica connessione...")
    client = AsyncIOMotorClient(MONGODB_URI)
    
    try:
        # Test connessione
        server_info = await client.server_info()
        print(f"MongoDB versione: {server_info['version']}")
        
        # Verifica database specifico
        db = client[DATABASE_NAME]
        collections = await db.list_collection_names()
        print(f"Collezioni in '{DATABASE_NAME}': {', '.join(collections) if collections else 'Nessuna'}")
        
        return True
        
    except Exception as e:
        print(f"Errore di connessione: {e}")
        return False
    
    finally:
        client.close()

async def main():
    """Funzione principale"""
    
    print("Inizializzazione Database MongoDB")
    print("=" * 40)
    print(f"URI: {MONGODB_URI}")
    print(f"Database: {DATABASE_NAME}")
    print("=" * 40)
    
    # Verifica connessione
    if not await check_connection():
        print("Impossibile connettersi al database")
        return
    
    print("\n" + "=" * 40)
    
    # Setup database
    if await setup_database():
        print("\nInizializzazione completata!")
        print("\nPuoi ora avviare il server:")
    else:
        print("\nInizializzazione fallita")

if __name__ == "__main__":
    asyncio.run(main())