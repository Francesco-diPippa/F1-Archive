# 🏁 F1 Archive

Un archivio digitale interattivo del Campionato Mondiale di Formula 1, sviluppato come progetto per il corso **Basi di Dati II** presso l’Università degli Studi di Salerno.

## 📌 Descrizione

F1 Archive è una web app che permette di esplorare, inserire e modificare dati relativi alle stagioni di Formula 1, i piloti, le gare, i risultati e le scuderie. Il progetto fa uso di tecnologie moderne sia per il backend che per il frontend, con l’obiettivo di offrire un’interfaccia semplice e funzionale.

## 🧱 Tecnologie Utilizzate

- **Backend**: Python, Flask, PyMongo
- **Database**: MongoDB (Replica Set, documenti BSON)
- **Frontend**: React, Next.js
- **Altro**: Pandas per il pre-processing dei dati

## 🗃️ Struttura del Database

Il database MongoDB contiene le seguenti collezioni:

- `drivers`: informazioni sui piloti
- `races`: gare per stagione
- `results`: risultati delle gare
- `constructors`: scuderie
- `circuits`: circuiti

Le collezioni sono collegate tramite aggregazioni `$lookup`.

## ⚙️ Funzionalità Principali

- Visualizzazione delle stagioni e delle gare
- Consultazione delle classifiche e dei risultati
- Esplorazione dei profili dei piloti
- Inserimento e modifica di piloti, stagioni, gare e risultati

## 🚀 Come Eseguire il Progetto

### 1. Requisiti

- Python 3.x
- Node.js + npm
- MongoDB (Replica Set attivo)

### 2. Clonazione del Repository

```bash
git clone https://github.com/tuo-username/f1-archive.git
cd f1-archive
```

### 3. Backend (Flask)

```bash
cd backend
python setup_db.py  # Carica i dati nel database
python app.py       # Avvia il server
```

### 4. Frontend (React + Next.js)

```bash
cd frontend
npm install
npm run dev
```

### 5. Configurazione

Modifica i parametri di connessione a MongoDB in `backend/config.py`.

## 🧪 Dataset

Dataset utilizzato: [Formula 1 World Championship 1950-2020 - Kaggle](https://www.kaggle.com/datasets/rohanrao/formula-1-world-championship-1950-2020)

## 📚 Autore

- Francesco Pio di Pippa  
  Università degli Studi di Salerno  
  Matricola: 0522501928
