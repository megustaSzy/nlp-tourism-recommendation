@echo off
echo Starting LUMIARA System...

echo Seed Database...
cd backend
call npm run seed

echo Starting NLP Service...
cd ../nlp_service
start cmd /k ".\venv\Scripts\activate & python app.py"

echo Starting Backend Express...
cd ../backend
start cmd /k "node index.js"

echo Starting Frontend Next.js...
cd ../frontend
start cmd /k "npm run dev"

echo All services started!
