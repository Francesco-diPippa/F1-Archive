@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM === Variabili ===
SET MONGO_BIN="C:\Program Files\MongoDB\Server\8.0\bin"
SET BASE_DIR=%USERPROFILE%\mongo-replica

REM === Crea le directory per i nodi ===
mkdir "%BASE_DIR%\rs0"
mkdir "%BASE_DIR%\rs1"
mkdir "%BASE_DIR%\rs2"

REM === Avvia 3 nodi mongod in 3 terminali separati ===
start "MongoDB rs0" %MONGO_BIN%\mongod.exe --replSet rs0 --port 27017 --dbpath "%BASE_DIR%\rs0" --bind_ip localhost --oplogSize 50
start "MongoDB rs1" %MONGO_BIN%\mongod.exe --replSet rs0 --port 27018 --dbpath "%BASE_DIR%\rs1" --bind_ip localhost --oplogSize 50
start "MongoDB rs2" %MONGO_BIN%\mongod.exe --replSet rs0 --port 27019 --dbpath "%BASE_DIR%\rs2" --bind_ip localhost --oplogSize 50

echo.
echo Replica Set avviato! Attendi almeno 5-10 secondi, poi inizializza con:
echo.
echo cd C:\Users\franc\Desktop\BD 2\mongosh-2.5.3-win32-x64\bin
echo mongosh --port 27017
echo.
echo Poi dentro mongosh:
echo.
echo rs.initiate({
echo   _id: "rs0",
echo   members: [
echo     { _id: 0, host: "localhost:27017" },
echo     { _id: 1, host: "localhost:27018" },
echo     { _id: 2, host: "localhost:27019" }
echo   ]
echo })
