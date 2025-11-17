<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

class PredictionAPI {
    private $pythonScriptPath;
    private $venvPythonPath;
    
    public function __construct() {
        $this->pythonScriptPath = __DIR__ . '/../../python-ai/models/train_model.py';
        $this->venvPythonPath = __DIR__ . '/../../python-ai/venv/bin/python';
    }
    
    public function predict($inputData) {
        try {
            // Valida dados de entrada
            $requiredFields = ['temperatura', 'pressao', 'vibracao', 'consumo_energia', 'horas_operacao'];
            foreach ($requiredFields as $field) {
                if (!isset($inputData[$field])) {
                    throw new Exception("Campo obrigatório faltando: " . $field);
                }
            }
            
            // Prepara dados para Python
            $jsonInput = json_encode($inputData);
            
            // Executa predição usando o Python do ambiente virtual
            $command = "echo " . escapeshellarg($jsonInput) . " | " . 
                      $this->venvPythonPath . " " . escapeshellarg($this->pythonScriptPath) . " predict";
            
            $output = shell_exec($command);
            
            if ($output === null) {
                throw new Exception("Erro ao executar script Python");
            }
            
            $prediction = json_decode($output, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Resposta inválida do Python: " . $output);
            }
            
            return [
                'success' => true,
                'prediction' => $prediction,
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    public function generateSampleData($count = 10) {
        // Gera dados de exemplo para demonstração (agora em PHP)
        $samples = [];
        
        for ($i = 0; $i < $count; $i++) {
            $hasAnomaly = ($i % 3 == 0); // Cada 3ª amostra tem anomalia
            
            $samples[] = [
                'temperatura' => $hasAnomaly ? rand(85, 95) : rand(70, 80),
                'pressao' => $hasAnomaly ? rand(130, 150) : rand(90, 120),
                'vibracao' => $hasAnomaly ? rand(7, 12) : rand(3, 6),
                'consumo_energia' => rand(120, 200),
                'horas_operacao' => rand(1, 500),
                'equipment_id' => 'EQ-' . rand(1000, 9999)
            ];
        }
        
        return $samples;
    }
}

// Handler da requisição
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $api = new PredictionAPI();
    
    if (isset($input['action']) && $input['action'] === 'generate_samples') {
        $samples = $api->generateSampleData(10);
        echo json_encode(['success' => true, 'samples' => $samples]);
    } else {
        $result = $api->predict($input);
        echo json_encode($result);
    }
    
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Método não permitido. Use POST.'
    ]);
}
?>