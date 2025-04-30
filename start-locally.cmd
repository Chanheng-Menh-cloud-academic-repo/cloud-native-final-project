@echo off
echo Starting all services locally...

:: Create temporary environment files
echo PORT=5001> add-service\.env
echo MONGO_URI=mongodb://localhost:27017/student-management>> add-service\.env

echo PORT=5002> delete-service\.env
echo MONGO_URI=mongodb://localhost:27017/student-management>> delete-service\.env

echo PORT=5003> update-service\.env
echo MONGO_URI=mongodb://localhost:27017/student-management>> update-service\.env

echo PORT=5004> search-service\.env
echo MONGO_URI=mongodb://localhost:27017/student-management>> search-service\.env

echo PORT=5000> api-gateway\.env
echo K8S=false>> api-gateway\.env

:: Check if MongoDB is running, if not try to start it
echo Checking MongoDB status...
netstat -ano | findstr "27017" > nul
if %ERRORLEVEL% NEQ 0 (
  echo Starting MongoDB...
  start "" "C:\Program Files\MongoDB\Server\6.0\bin\mongod" --dbpath="%USERPROFILE%\MongoData"
  echo Waiting for MongoDB to start...
  timeout /t 5 /nobreak
) else (
  echo MongoDB is already running...
)

:: Start the main application 
echo Starting all services...
npm start

:: Cleanup environment files when done
echo Press Ctrl+C to stop the services when you are finished.
pause
del add-service\.env
del delete-service\.env
del update-service\.env
del search-service\.env
del api-gateway\.env 