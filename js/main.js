const visualizer = new Visualizer();
let processes = [];

const algorithmSelect = document.getElementById('algorithm');
const quantumInput = document.getElementById('quantum');
const rrQuantumDiv = document.getElementById('rr-quantum');
const priorityInput = document.getElementById('priority');
const processNameInput = document.getElementById('processName');
const burstTimeInput = document.getElementById('burstTime');
const arrivalTimeInput = document.getElementById('arrivalTime');
const addProcessButton = document.getElementById('addProcess');
const runSimulationButton = document.getElementById('runSimulation');

algorithmSelect.addEventListener('change', () => {
    if (algorithmSelect.value === 'rr') {
        rrQuantumDiv.classList.remove('d-none');
    } else {
        rrQuantumDiv.classList.add('d-none');
    }

    if (algorithmSelect.value === 'priority') {
        priorityInput.style.display = 'block';
    } else {
        priorityInput.style.display = 'none';
    }
});

addProcessButton.addEventListener('click', () => {
    const name = processNameInput.value.trim();
    const burstTime = parseInt(burstTimeInput.value);
    const arrivalTime = parseInt(arrivalTimeInput.value);
    const priority = parseInt(priorityInput.value) || 0;

    if (!name || isNaN(burstTime) || isNaN(arrivalTime)) {
        alert('Please fill in all required fields with valid values.');
        return;
    }

    if (burstTime <= 0 || arrivalTime < 0) {
        alert('Burst time must be positive and arrival time must be non-negative.');
        return;
    }

    const process = new Process(name, burstTime, arrivalTime, priority);
    processes.push(process);
    visualizer.updateProcessTable(processes);

    processNameInput.value = '';
    burstTimeInput.value = '';
    arrivalTimeInput.value = '';
    priorityInput.value = '';
});

runSimulationButton.addEventListener('click', () => {
    if (processes.length === 0) {
        alert('Please add at least one process.');
        return;
    }

    let algorithm;
    switch (algorithmSelect.value) {
        case 'fcfs':
            algorithm = new FCFS(processes);
            break;
        case 'sjf':
            algorithm = new SJF(processes);
            break;
        case 'rr':
            const quantum = parseInt(quantumInput.value);
            if (isNaN(quantum) || quantum <= 0) {
                alert('Please enter a valid time quantum.');
                return;
            }
            algorithm = new RoundRobin(processes, quantum);
            break;
        case 'priority':
            algorithm = new PriorityScheduling(processes);
            break;
        case 'srtf':
            algorithm = new SRTF(processes);
              result = algorithm.execute();
            break;
    }

    visualizer.visualize(algorithm, processes);
});

function addSampleProcesses() {
    const sampleProcesses = [
        new Process('P1', 4, 0, 2),
        new Process('P2', 3, 1, 3),
        new Process('P3', 5, 2, 1),
        new Process('P4', 2, 3, 4)
    ];

    processes = sampleProcesses;
    visualizer.updateProcessTable(processes);
}
addSampleProcesses(); 