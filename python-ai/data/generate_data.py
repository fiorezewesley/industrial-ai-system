import json
import random
import time
from datetime import datetime

class IndustrialDataGenerator:
    def __init__(self):
        self.base_temperature = 75
        self.base_pressure = 100
        self.base_vibration = 5
        self.base_energy = 150
        
    def generate_realtime_data(self, equipment_id=1, anomaly=False):
        """Gera dados simulados em tempo real"""
        # Variação normal
        temp_variation = random.gauss(0, 3)
        pressure_variation = random.gauss(0, 5)
        vibration_variation = random.gauss(0, 0.5)
        
        if anomaly:
            # Simula anomalia
            temp_variation += random.uniform(5, 15)
            pressure_variation += random.uniform(10, 30)
            vibration_variation += random.uniform(2, 6)
        
        data = {
            'timestamp': datetime.now().isoformat(),
            'equipment_id': equipment_id,
            'temperatura': max(50, self.base_temperature + temp_variation),
            'pressao': max(60, self.base_pressure + pressure_variation),
            'vibracao': max(0, self.base_vibration + vibration_variation),
            'consumo_energia': self.base_energy + random.gauss(0, 10),
            'horas_operacao': random.randint(1, 500)
        }
        
        return data

# Teste do gerador
if __name__ == "__main__":
    generator = IndustrialDataGenerator()
    
    # Gera 10 amostras normais
    print("Dados Normais:")
    for i in range(5):
        print(json.dumps(generator.generate_realtime_data()))
    
    print("\nDados com Anomalia:")
    for i in range(5):
        print(json.dumps(generator.generate_realtime_data(anomaly=True)))