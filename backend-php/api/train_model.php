<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

class AITrainer {
    private $pythonScriptPath;
    private $venvPythonPath;
    
    public function __construct() {
        // Use caminhos absolutos
        $basePath = realpath(__DIR__ . '/../..');
        $this->pythonScriptPath = $basePath . '/python-ai/models/train_model.py';
        $this->venvPythonPath = $basePath . '/python-ai/venv/bin/python3';
        
        error_log("Python Path: " . $this->venvPythonPath);
        error_log("Script Path: " . $this->pythonScriptPath);
    }
    
    public function trainModel() {
        try {
            // Verifica se os arquivos existem
            if (!file_exists($this->venvPythonPath)) {
                throw new Exception("Python do venv não encontrado: " . $this->venvPythonPath);
            }
            if (!file_exists($this->pythonScriptPath)) {
                throw new Exception("Script Python não encontrado: " . $this->pythonScriptPath);
            }
            
            // Comando corrigido - SEM source, usando o python do venv diretamente
            $command = escapeshellarg($this->venvPythonPath) . " " . 
                      escapeshellarg($this->pythonScriptPath) . " train";
            
            error_log("Executando comando: " . $command);
            
            $output = shell_exec($command);
            
            // Tenta extrair o JSON da última linha
            $lines = explode("\n", trim($output));
            $lastLine = end($lines);

            $result = json_decode($lastLine, true);
            if ($output === null) {
                throw new Exception("Nenhuma saída do comando Python");
            }
            
            error_log("Saída do Python: " . $output);
            
            $result = json_decode($output, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Resposta JSON inválida: " . $output);
            }
            
            return [
                'success' => true,
                'data' => $result,
                'message' => 'Modelo treinado com sucesso'
            ];
            
        } catch (Exception $e) {
            error_log("ERRO: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}

// Handler da requisição
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $trainer = new AITrainer();
    $result = $trainer->trainModel();
    
    echo json_encode($result);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Método não permitido'
    ]);
}
?>