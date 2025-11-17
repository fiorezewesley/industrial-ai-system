class IndustrialDashboard {
    constructor() {
        this.apiBaseUrl = '/backend-php/api';
        this.monitoringInterval = null;
        this.historyData = [];
        this.maxHistoryPoints = 20;
        
        console.log('Dashboard inicializado');
        
        // Inicializar após o DOM carregar
        setTimeout(() => {
            this.initializeCharts();
            this.setupEventListeners();
            this.updateTimestamp();
        }, 100);
    }
    
    initializeCharts() {
        console.log('Inicializando gráficos...');
        
        // Gauge de probabilidade de falha
        const gaugeCtx = document.getElementById('failureGauge');
        if (gaugeCtx) {
            this.failureGauge = new Chart(gaugeCtx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [100, 0],
                        backgroundColor: ['#27ae60', '#e74c3c'],
                        borderWidth: 0
                    }]
                },
                options: {
                    cutout: '70%',
                    rotation: -90,
                    circumference: 180,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                }
            });
            console.log('Gauge inicializado');
        } else {
            console.error('Elemento failureGauge não encontrado');
        }
        
        // Gráfico de importância de features
        const featureCtx = document.getElementById('featureImportanceChart');
        if (featureCtx) {
            this.featureChart = new Chart(featureCtx, {
                type: 'bar',
                data: {
                    labels: ['Temperatura', 'Pressão', 'Vibração', 'Consumo', 'Horas'],
                    datasets: [{
                        label: 'Importância',
                        data: [0.25, 0.25, 0.25, 0.125, 0.125],
                        backgroundColor: ['#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c']
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 1
                        }
                    }
                }
            });
            console.log('Gráfico de features inicializado');
        }

        // Gráfico de tendência temporal
        const trendCtx = document.getElementById('trendChart');
        if (trendCtx) {
            this.trendChart = new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: [], // Inicialmente vazio
                    datasets: [{
                        label: 'Probabilidade de Falha',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 1
                        }
                    }
                }
            });
            console.log('Gráfico de tendência inicializado');
        }
    }
    
    setupEventListeners() {
        console.log('Configurando botões...');
        
        const trainBtn = document.getElementById('btnTrainModel');
        const startBtn = document.getElementById('btnStartMonitoring');
        const stopBtn = document.getElementById('btnStopMonitoring');
        
        if (trainBtn) {
            trainBtn.addEventListener('click', () => this.trainModel());
            console.log('Botão treinar configurado');
        }
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startMonitoring());
            console.log('Botão iniciar monitoramento configurado');
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopMonitoring());
            console.log('Botão parar monitoramento configurado');
        }
    }
    
    async trainModel() {
        console.log('Iniciando treinamento...');
        this.showLoading(true);
        this.updateModelStatus('Treinando...');
        
        try {
            const response = await fetch(this.apiBaseUrl + '/train_model.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            console.log('📡 Resposta do servidor:', response.status);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Resultado do treinamento:', result);
            
            if (result.success) {
                this.updateModelStatus('Treinado');
                if (result.data && result.data.feature_importance) {
                    this.updateFeatureImportance(result.data.feature_importance);
                }
                this.showMessage(`✅ Modelo treinado com sucesso!\nAcurácia: ${(result.data.test_accuracy * 100).toFixed(1)}%`);
            } else {
                throw new Error(result.error || 'Erro desconhecido no treinamento');
            }
            
        } catch (error) {
            console.error('Erro no treinamento:', error);
            this.showError('Erro ao treinar modelo: ' + error.message);
            this.updateModelStatus('Erro no Treinamento');
        } finally {
            this.showLoading(false);
        }
    }
    
    async startMonitoring() {
        console.log('Iniciando monitoramento...');
        
        if (this.monitoringInterval) {
            this.stopMonitoring();
        }
        
        // Primeira execução imediata
        await this.generateAndPredict();
        
        // Configurar intervalo
        this.monitoringInterval = setInterval(() => {
            this.generateAndPredict();
        }, 3000);
        
        this.updateModelStatus('Monitorando...');
        this.toggleButtons(true);
        this.showMessage('Monitoramento iniciado - Coletando dados a cada 3 segundos');
    }
    
    stopMonitoring() {
        console.log('Parando monitoramento...');
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        this.updateModelStatus('Treinado');
        this.toggleButtons(false);
        this.showMessage('Monitoramento parado');
    }
    
    async generateAndPredict() {
        try {
            // Gerar dados de exemplo
            const sampleData = this.generateSampleData();
            console.log('📝 Dados gerados:', sampleData);
            
            await this.makePrediction(sampleData);
            
        } catch (error) {
            console.error('Erro na geração de dados:', error);
        }
    }
    
    generateSampleData() {
        const hasAnomaly = Math.random() > 0.7; // 30% de chance de anomalia
        
        return {
            temperatura: hasAnomaly ? Math.random() * 20 + 80 : Math.random() * 10 + 70,
            pressao: hasAnomaly ? Math.random() * 40 + 120 : Math.random() * 20 + 90,
            vibracao: hasAnomaly ? Math.random() * 4 + 8 : Math.random() * 3 + 4,
            consumo_energia: Math.random() * 50 + 130,
            horas_operacao: Math.floor(Math.random() * 500),
            //equipment_id: 'EQ-' + Math.floor(Math.random() * 9000 + 1000)
            equipment_id: 'Centur-30'
        };
    }
    
    async makePrediction(sensorData) {
        try {
            console.log('Fazendo predição para:', sensorData);
            
            const response = await fetch(this.apiBaseUrl + '/get_predictions.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sensorData)
            });
            
            console.log('Status da resposta:', response.status);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Resultado da predição:', result);
            
            if (result.success) {
                this.updateDashboard(sensorData, result.prediction);
                this.updateTimestamp();
            } else {
                throw new Error(result.error || 'Erro na predição');
            }
            
        } catch (error) {
            console.error('Erro na predição:', error);
            this.showError('Erro na predição: ' + error.message);
            
            // Para demonstração, simule uma predição
            this.simulatePrediction(sensorData);
        }
    }
    
    simulatePrediction(sensorData) {
        console.log('Simulando predição...');
        
        // Simulação básica para demonstração
        const tempRisk = sensorData.temperatura > 85 ? 0.4 : 0.1;
        const pressureRisk = sensorData.pressao > 130 ? 0.4 : 0.1;
        const vibrationRisk = sensorData.vibracao > 8 ? 0.2 : 0.1;
        
        const probability = Math.min(tempRisk + pressureRisk + vibrationRisk, 0.95);
        
        const prediction = {
            probabilidade_falha: probability,
            status: probability > 0.5 ? 'ALERTA' : 'NORMAL',
            confianca: 0.8
        };
        
        this.updateDashboard(sensorData, prediction);
        this.updateTimestamp();
    }
    
    updateDashboard(sensorData, prediction) {
        console.log('Atualizando dashboard...', prediction);
        
        // Atualizar gauge
        const failurePercent = (prediction.probabilidade_falha * 100);
        if (this.failureGauge) {
            this.failureGauge.data.datasets[0].data = [
                100 - failurePercent, 
                failurePercent
            ];
            this.failureGauge.update();
        }
        
        // Atualizar valor numérico
        const failureValue = document.getElementById('failureValue');
        if (failureValue) {
            failureValue.textContent = `${failurePercent.toFixed(1)}%`;
        }
        
        // Atualizar status
        const statusElement = document.getElementById('failureStatus');
        if (statusElement) {
            statusElement.textContent = `Status: ${prediction.status}`;
            statusElement.className = prediction.status === 'ALERTA' ? 'status-alert' : 'status-normal';
        }
        
        // Atualizar métricas
        this.updateMetric('tempValue', sensorData.temperatura, '°C');
        this.updateMetric('pressureValue', sensorData.pressao, 'bar');
        this.updateMetric('vibrationValue', sensorData.vibracao, 'mm/s');
        this.updateMetric('energyValue', sensorData.consumo_energia, 'kW');
        
        // Adicionar ao histórico
        this.addToHistory(sensorData, prediction);

        // Atualizar gráfico de tendência
        this.updateTrendChart(prediction.probabilidade_falha);
        
        console.log('Dashboard atualizado');
    }

    updateTrendChart(probability) {
        if (!this.trendChart) {
            return;
        }

        const now = new Date();
        const timeString = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

        // Adicionar novo ponto
        this.trendChart.data.labels.push(timeString);
        this.trendChart.data.datasets[0].data.push(probability);

        // Manter apenas os últimos 10 pontos
        if (this.trendChart.data.labels.length > 10) {
            this.trendChart.data.labels.shift();
            this.trendChart.data.datasets[0].data.shift();
        }

        // Atualizar gráfico
        this.trendChart.update();
    }
    
    updateMetric(elementId, value, unit) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = `${value.toFixed(1)} ${unit}`;
        }
    }
    
    addToHistory(sensorData, prediction) {
        const historyEntry = {
            equipment: sensorData.equipment_id || 'Torno CNC Centur-30',
            temperatura: sensorData.temperatura.toFixed(1),
            pressao: sensorData.pressao.toFixed(1),
            vibracao: sensorData.vibracao.toFixed(1),
            probabilidade: (prediction.probabilidade_falha * 100).toFixed(1) + '%',
            status: prediction.status,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.historyData.unshift(historyEntry);
        
        // Manter apenas os últimos 5 registros
        if (this.historyData.length > 5) {
            this.historyData = this.historyData.slice(0, 5);
        }
        
        this.updateHistoryTable();
    }
    
    updateHistoryTable() {
        const tbody = document.getElementById('predictionsBody');
        if (!tbody) {
            console.error('Tabela de histórico não encontrada');
            return;
        }
        
        tbody.innerHTML = '';
        
        this.historyData.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.equipment}</td>
                <td>${entry.temperatura}°C</td>
                <td>${entry.pressao}bar</td>
                <td>${entry.vibracao}mm/s</td>
                <td>${entry.probabilidade}</td>
                <td class="${entry.status === 'ALERTA' ? 'status-alert' : 'status-normal'}">${entry.status}</td>
                <td>${entry.timestamp}</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    updateFeatureImportance(features) {
        if (this.featureChart && features) {
            const labels = Object.keys(features);
            const data = Object.values(features);
            
            this.featureChart.data.labels = labels;
            this.featureChart.data.datasets[0].data = data;
            this.featureChart.update();
            
            console.log('Importância das features atualizada:', features);
        }
    }
    
    updateModelStatus(status) {
        const statusElement = document.getElementById('modelStatus');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = status.includes('Treinado') || status.includes('Monitorando') ? 
                'status-badge status-trained' : 'status-badge status-untrained';
        }
    }
    
    updateTimestamp() {
        const element = document.getElementById('lastUpdate');
        if (element) {
            element.textContent = new Date().toLocaleTimeString();
        }
    }
    
    toggleButtons(monitoring) {
        const startBtn = document.getElementById('btnStartMonitoring');
        const stopBtn = document.getElementById('btnStopMonitoring');
        
        if (startBtn) startBtn.disabled = monitoring;
        if (stopBtn) stopBtn.disabled = !monitoring;
    }
    
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !show);
        }
    }
    
    showMessage(message) {
        console.log('', message);
    }
    
    showError(message) {
        console.error(':', message);
        alert('Erro: ' + message);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado - inicializando dashboard...');
    window.dashboard = new IndustrialDashboard();
});