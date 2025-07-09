class Visualizer {
    constructor() {
        this.processColors = {};
        this.colorIndex = 1;
    }

    // Generate a unique color for each process
    getProcessColor(processName) {
        if (!this.processColors[processName]) {
            this.processColors[processName] = `process-color-${this.colorIndex}`;
            this.colorIndex = (this.colorIndex % 8) + 1;
        }
        return this.processColors[processName];
    }


    clearGanttChart() {
        const ganttChart = document.getElementById('ganttChart');
        ganttChart.innerHTML = '';
    }

    drawGanttChart(ganttChartData) {
        this.clearGanttChart();
        const ganttChart = document.getElementById('ganttChart');

        const blockRow = document.createElement('div');
        blockRow.style.display = 'flex';
        blockRow.style.alignItems = 'center';

        const timeRow = document.createElement('div');
        timeRow.style.display = 'flex';
        timeRow.style.alignItems = 'center';
        timeRow.style.marginTop = '10px';

        ganttChartData.forEach((block, index) => {
            const blockElement = document.createElement('div');
            blockElement.className = `gantt-block ${this.getProcessColor(block.process)}`;
            blockElement.style.width = `${(block.end - block.start) * 30}px`;
            blockElement.textContent = block.process;
            blockElement.title = `Process: ${block.process}\nStart: ${block.start}\nEnd: ${block.end}`;
            blockRow.appendChild(blockElement);
            const timeMarker = document.createElement('div');
            timeMarker.style.width = `${(block.end - block.start) * 30}px`;
            timeMarker.style.textAlign = 'left';
            timeMarker.style.position = 'relative';
            timeMarker.style.fontSize = '12px';
            timeMarker.style.color = '#666';
            timeMarker.textContent = block.start;
            timeRow.appendChild(timeMarker);

            if (index === ganttChartData.length - 1) {
                const endMarker = document.createElement('div');
                endMarker.style.position = 'relative';
                endMarker.style.left = '0';
                endMarker.style.fontSize = '12px';
                endMarker.style.color = '#666';
                endMarker.textContent = block.end;
                timeRow.appendChild(endMarker);
            }
        });

        ganttChart.appendChild(blockRow);
        ganttChart.appendChild(timeRow);
    }

    updateMetricsTable(processes, metrics) {
        const metricsTable = document.getElementById('metricsTable').getElementsByTagName('tbody')[0];
        metricsTable.innerHTML = '';

        processes.forEach(process => {
            const row = metricsTable.insertRow();
            row.insertCell(0).textContent = process.name;
            row.insertCell(1).textContent = process.waitingTime;
            row.insertCell(2).textContent = process.turnaroundTime;
            row.insertCell(3).textContent = process.responseTime;
        });

        const averageMetrics = document.getElementById('averageMetrics');
        averageMetrics.innerHTML = `
            <div class="row">
                <div class="col-md-4">Average Waiting Time: ${metrics.averageWaitingTime.toFixed(2)}</div>
                <div class="col-md-4">Average Turnaround Time: ${metrics.averageTurnaroundTime.toFixed(2)}</div>
                <div class="col-md-4">Average Response Time: ${metrics.averageResponseTime.toFixed(2)}</div>
            </div>
        `;
    }

    updateProcessTable(processes) {
        const processTable = document.getElementById('processTable').getElementsByTagName('tbody')[0];
        processTable.innerHTML = '';

        processes.forEach(process => {
            const row = processTable.insertRow();
            row.insertCell(0).textContent = process.name;
            row.insertCell(1).textContent = process.burstTime;
            row.insertCell(2).textContent = process.arrivalTime;
            row.insertCell(3).textContent = process.priority;
            
            const deleteCell = row.insertCell(4);
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger btn-sm';
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => {
                const index = processes.indexOf(process);
                if (index > -1) {
                    processes.splice(index, 1);
                    this.updateProcessTable(processes);
                }
            };
            deleteCell.appendChild(deleteButton);
        });
    }

    visualize(algorithm, processes) {
        const result = algorithm.execute();
        this.drawGanttChart(result.ganttChart);
        this.updateMetricsTable(processes, result.metrics);
    }
} 