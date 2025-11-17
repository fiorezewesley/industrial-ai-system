# Sistema de Análise Preditiva Industrial

Sistema completo de análise preditiva para monitoramento de equipamentos industriais utilizando Machine Learning e dashboard em tempo real.

## Arquitetura do Sistema

### Stack Tecnológica

**Frontend**
- HTML5, CSS3, JavaScript ES6+
- Chart.js para visualizações
- Dashboard responsivo

**Backend** 
- PHP 8.3 com API REST
- Comunicação via JSON
- Integração com processos Python

**Machine Learning**
- Python 3.8+ com Scikit-learn
- Modelo Random Forest Regressor
- Pandas/NumPy para processamento
- Joblib para serialização

### Estrutura de Diretórios
### industrial-ai-system/
### ├── frontend/ # Interface web
### │ ├── index.html # Dashboard principal
### │ ├── banca-panel.html # Painel interativo
### │ ├── css/style.css # Estilos
### │ └── js/dashboard.js # Lógica do frontend
### ├── backend-php/ # API e servidor
### │ └── api/
### │ ├── train_model.php # Endpoint de treinamento
### │ └── get_predictions.php # Endpoint de predições
### └── python-ai/ # Modelos de ML
### ├── models/
### │ ├── train_model.py # Script de treinamento
### │ └── model.pkl # Modelo serializado
### ├── venv/ # Ambiente virtual
### └── requirements.txt # Dependências

### Fluxo de Dados

1. Frontend coleta dados de sensores simulados
2. JavaScript envia requisições POST para API PHP
3. PHP executa script Python via shell
4. Python carrega modelo treinado e faz predições
5. Resposta JSON é retornada para frontend
6. Interface é atualizada em tempo real

## Funcionalidades

- Treinamento de modelo Random Forest
- Predição de probabilidade de falha em tempo real
- Dashboard com visualizações interativas
- Monitoramento de variáveis: temperatura, pressão, vibração, consumo energético
- Sistema de alertas baseado em thresholds
- Histórico de previsões e tendências temporais

## Modelo de Machine Learning

**Algoritmo**: Random Forest Regressor
**Features**: temperatura, pressão, vibração, consumo energético, horas de operação
**Acurácia**: 95.7% (teste), 99.3% (treino)
**Importância das variáveis**:
- Temperatura: 42.8%
- Pressão: 37.9% 
- Vibração: 18.1%
- Consumo energético: 0.6%
- Horas de operação: 0.6%

## Instalação e Execução

### Pré-requisitos
- PHP 8.3+
- Python 3.8+

### Configuração

```bash
# Clone o repositório
git clone https://github.com/fiorezewesley/industrial-ai-system.git
cd industrial-ai-system

# Configure ambiente Python
cd python-ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Execute o servidor
cd ..
php -S localhost:8000

Casos de Uso
Monitoramento preditivo de equipamentos industriais

Detecção precoce de anomalias em sensores

Sistema de alertas para manutenção preventiva

Dashboard para visualização de métricas operacionais

Autor
Wesley Fioreze

