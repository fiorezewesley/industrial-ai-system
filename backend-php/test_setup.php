<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== TESTE DE CONFIGURAÇÃO DO SISTEMA ===\n\n";

// Configurações
$basePath = realpath(__DIR__ . '/..');
$venvPython = $basePath . '/python-ai/venv/bin/python3';
$pythonScript = $basePath . '/python-ai/models/train_model.py';

echo "Base Path: $basePath\n";
echo "Python Venv: $venvPython\n";
echo "Python Script: $pythonScript\n\n";

// Teste 1: Verificar existência dos arquivos
echo "1. VERIFICANDO ARQUIVOS:\n";
echo "   Venv Python: " . (file_exists($venvPython) ? "✅ EXISTE" : "❌ NÃO ENCONTRADO") . "\n";
echo "   Script Python: " . (file_exists($pythonScript) ? "✅ EXISTE" : "❌ NÃO ENCONTRADO") . "\n";

// Teste 2: Verificar permissões
echo "\n2. VERIFICANDO PERMISSÕES:\n";
echo "   Venv Python: " . (is_executable($venvPython) ? "✅ EXECUTÁVEL" : "❌ NÃO EXECUTÁVEL") . "\n";
echo "   Script Python: " . (is_readable($pythonScript) ? "✅ LEGÍVEL" : "❌ NÃO LEGÍVEL") . "\n";

// Teste 3: Testar comando Python
echo "\n3. TESTANDO EXECUÇÃO PYTHON:\n";
$testCommand = escapeshellarg($venvPython) . " -c \"import pandas; print('✅ Pandas:', pandas.__version__)\" 2>&1";
$output = shell_exec($testCommand);
echo "   Comando: $testCommand\n";
echo "   Saída: " . trim($output) . "\n";

// Teste 4: Testar treinamento do modelo
echo "\n4. TESTANDO TREINAMENTO DO MODELO:\n";
$trainCommand = escapeshellarg($venvPython) . " " . escapeshellarg($pythonScript) . " train 2>&1";
$trainOutput = shell_exec($trainCommand);
echo "   Comando: $trainCommand\n";

if ($trainOutput) {
    $result = json_decode($trainOutput, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "   ✅ Treinamento bem-sucedido!\n";
        echo "   Acurácia Treino: " . ($result['train_accuracy'] ?? 'N/A') . "\n";
        echo "   Acurácia Teste: " . ($result['test_accuracy'] ?? 'N/A') . "\n";
    } else {
        echo "   ❌ Erro no JSON: " . $trainOutput . "\n";
    }
} else {
    echo "   ❌ Nenhuma saída do Python\n";
}

// Teste 5: Testar predição
echo "\n5. TESTANDO PREDIÇÃO:\n";
$testData = json_encode([
    'temperatura' => 80,
    'pressao' => 110, 
    'vibracao' => 6,
    'consumo_energia' => 160,
    'horas_operacao' => 200
]);

$predictCommand = "echo " . escapeshellarg($testData) . " | " . escapeshellarg($venvPython) . " " . escapeshellarg($pythonScript) . " predict 2>&1";
$predictOutput = shell_exec($predictCommand);
echo "   Comando: $predictCommand\n";

if ($predictOutput) {
    $result = json_decode($predictOutput, true);
    if (isset($result['error'])) {
        echo "   ❌ Erro: " . $result['error'] . "\n";
    } else {
        echo "   ✅ Predição bem-sucedida!\n";
        echo "   Probabilidade: " . ($result['probabilidade_falha'] ?? 'N/A') . "\n";
        echo "   Status: " . ($result['status'] ?? 'N/A') . "\n";
    }
} else {
    echo "   ❌ Nenhuma saída da predição\n";
}

echo "\n=== FIM DO TESTE ===\n";
?>