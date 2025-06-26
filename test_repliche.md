# Test Failover Replica Set MongoDB (locale)

## 1. Avviare `mongosh` e inizializzare il Replica Set

```bash
cd C:\Users\maria\Downloads\mongosh-2.5.2-win32-x64\bin
mongosh --port 27017

rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})

rs.status()
```
## 2. Identificare e killare il nodo `PRIMARY`

```bash
rs.status().members.filter(m => m.stateStr === "PRIMARY")

netstat -ano | findstr :27017
taskkill /PID <PID_PROCESSO> /F

```

## 3. Collegarsi a un nuovo nodo e verificare il `PRIMARY`

```bash
cd C:\Users\maria\Downloads\mongosh-2.5.2-win32-x64\bin
mongosh --port 27018

rs.status()
```