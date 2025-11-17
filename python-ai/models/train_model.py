import pandas as pd
import numpy as np
import joblib
import json
import sys
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

def generate_training_data(n_samples=1000):
    """Gera dados simulados de planta industrial"""
    np.random.seed(42)
    
    dados = {
        'temperatura': np.random.normal(75, 10, n_samples),
        'pressao': np.random.normal(100, 20, n_samples),
        'vibracao': np.random.normal(5, 2, n_samples),
        'consumo_energia': np.random.normal(150, 30, n_samples),
        'horas_operacao': np.random.randint(1, 500, n_samples)
    }
    
    df = pd.DataFrame(dados)
    
    # Criando variável alvo (probabilidade de falha)
    df['probabilidade_falha'] = (
        0.3 * (df['temperatura'] > 85).astype(int) +
        0.4 * (df['pressao'] > 130).astype(int) +
        0.3 * (df['vibracao'] > 8).astype(int) +
        0.1 * np.random.random(n_samples)  # Ruído
    )
    
    return df

def train_and_save_model():
    """Treina e salva o modelo"""
    # Removemos as mensagens de log que eram escritas no stderr
    df = generate_training_data(1000)
    
    features = ['temperatura', 'pressao', 'vibracao', 'consumo_energia', 'horas_operacao']
    X = df[features]
    y = df['probabilidade_falha']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X_train, y_train)
    
    # Avaliação
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    # Feature importance
    feature_importance = dict(zip(features, model.feature_importances_))
    
    # Salva o modelo
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    joblib.dump(model, model_path)
    
    result = {
        'status': 'success',
        'train_accuracy': float(train_score),
        'test_accuracy': float(test_score),
        'feature_importance': feature_importance
    }
    
    return result

def predict_from_input(input_data):
    """Faz predição a partir dos dados de entrada"""
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    
    if not os.path.exists(model_path):
        return {'error': 'Modelo não encontrado. Treine o modelo primeiro.'}
    
    model = joblib.load(model_path)
    
    # Prepara os dados
    features = ['temperatura', 'pressao', 'vibracao', 'consumo_energia', 'horas_operacao']
    input_df = pd.DataFrame([input_data])[features]
    
    prediction = model.predict(input_df)[0]
    
    return {
        'probabilidade_falha': float(prediction),
        'status': 'ALERTA' if prediction > 0.5 else 'NORMAL',
        'confianca': min(abs(prediction - 0.5) * 2, 1.0)
    }

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1 and sys.argv[1] == "train":
            result = train_and_save_model()
            print(json.dumps(result))
            
        elif len(sys.argv) > 1 and sys.argv[1] == "predict":
            # Lê JSON do stdin
            input_json = sys.stdin.read().strip()
            if not input_json:
                print(json.dumps({'error': 'Nenhum dado de entrada'}))
                sys.exit(1)
                
            input_data = json.loads(input_json)
            result = predict_from_input(input_data)
            print(json.dumps(result))
            
        else:
            print(json.dumps({'error': 'Comando inválido. Use "train" ou "predict"'}))
            
    except Exception as e:
        error_result = {'error': f'Erro no Python: {str(e)}'}
        print(json.dumps(error_result))
        sys.exit(1)