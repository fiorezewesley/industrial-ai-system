#!/bin/bash
echo "Iniciando Sistema de Análise Preditiva Industrial"
echo "==================================================="

cd "$(dirname "$0")"

# Verificar se o ambiente virtual existe
if [ ! -d "python-ai/venv" ]; then
    echo "Ambiente virtual não encontrado. Execute setup.sh primeiro."
    exit 1
fi

echo "Ativando ambiente virtual Python..."
cd python-ai
source venv/bin/activate

echo "Testando modelo Python..."
python models/train_model.py train

echo "Iniciando servidor PHP..."
cd ../backend-php

PORT=8002

echo ""
echo "Sistema iniciado com sucesso!"
echo "Acesse: http://localhost:8002/aula-teste/industrial-ai-system/frontend/index.html"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo "==================================================="

php -S localhost:$PORT