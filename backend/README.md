to run 

source venv/bin/activate

# 1. Start the service
sudo systemctl start ollama

# 2. Pull Llama 3.2 to your local model cache
ollama pull llama3.2


uvicorn app.main:app --reload --port 8000