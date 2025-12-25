@echo off
REM Grant permissions to rasa_user
echo Granting permissions to rasa_user...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -d rasa_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rasa_user; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rasa_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO rasa_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO rasa_user;"
echo Done!
