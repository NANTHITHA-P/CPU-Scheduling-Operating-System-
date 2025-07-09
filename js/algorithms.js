class Process {
    constructor(name, burstTime, arrivalTime, priority = 0) {
        this.name = name;
        this.burstTime = burstTime;
        this.arrivalTime = arrivalTime;
        this.priority = priority;
        this.remainingTime = burstTime;
        this.waitingTime = 0;
        this.turnaroundTime = 0;
        this.responseTime = -1;
        this.completionTime = 0;
    }
}

class SchedulingAlgorithm {
    constructor(processes) {
        this.processes = [...processes];
        this.ganttChart = [];
        this.currentTime = 0;
    }

    // Common method to calculate metrics
    calculateMetrics() {
        let totalWaitingTime = 0;
        let totalTurnaroundTime = 0;
        let totalResponseTime = 0;

        this.processes.forEach(process => {
            process.turnaroundTime = process.completionTime - process.arrivalTime;
            process.waitingTime = process.turnaroundTime - process.burstTime;
            if (process.responseTime === -1) process.responseTime = process.waitingTime;

            totalWaitingTime += process.waitingTime;
            totalTurnaroundTime += process.turnaroundTime;
            totalResponseTime += process.responseTime;
        });

        return {
            averageWaitingTime: totalWaitingTime / this.processes.length,
            averageTurnaroundTime: totalTurnaroundTime / this.processes.length,
            averageResponseTime: totalResponseTime / this.processes.length
        };
    }
}

class FCFS extends SchedulingAlgorithm {
    execute() {
        // Sort processes by arrival time
        this.processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
        
        this.currentTime = this.processes[0].arrivalTime;

        for (let process of this.processes) {
            // If current time is less than process arrival time, update current time
            if (this.currentTime < process.arrivalTime) {
                this.currentTime = process.arrivalTime;
            }

            // Record start time for response time
            if (process.responseTime === -1) {
                process.responseTime = this.currentTime - process.arrivalTime;
            }

            // Add to Gantt chart
            this.ganttChart.push({
                process: process.name,
                start: this.currentTime,
                end: this.currentTime + process.burstTime
            });

            // Update process completion time
            process.completionTime = this.currentTime + process.burstTime;
            this.currentTime = process.completionTime;
        }

        return {
            ganttChart: this.ganttChart,
            metrics: this.calculateMetrics()
        };
    }
}

class SJF extends SchedulingAlgorithm {
    execute() {
        let remainingProcesses = [...this.processes];
        let completedProcesses = [];
        
        this.currentTime = Math.min(...this.processes.map(p => p.arrivalTime));

        while (remainingProcesses.length > 0) {
            // Find available processes at current time
            let availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= this.currentTime);
            
            if (availableProcesses.length === 0) {
                this.currentTime++;
                continue;
            }

            // Find process with shortest burst time
            let nextProcess = availableProcesses.reduce((min, p) => 
                p.burstTime < min.burstTime ? p : min
            );

            // Record response time
            if (nextProcess.responseTime === -1) {
                nextProcess.responseTime = this.currentTime - nextProcess.arrivalTime;
            }

            // Add to Gantt chart
            this.ganttChart.push({
                process: nextProcess.name,
                start: this.currentTime,
                end: this.currentTime + nextProcess.burstTime
            });

            // Update process completion time
            nextProcess.completionTime = this.currentTime + nextProcess.burstTime;
            this.currentTime = nextProcess.completionTime;

            // Move process to completed list
            completedProcesses.push(nextProcess);
            remainingProcesses = remainingProcesses.filter(p => p !== nextProcess);
        }

        this.processes = completedProcesses;
        return {
            ganttChart: this.ganttChart,
            metrics: this.calculateMetrics()
        };
    }
}

class RoundRobin extends SchedulingAlgorithm {
    constructor(processes, timeQuantum) {
        super(processes);
        this.timeQuantum = timeQuantum;
    }

    execute() {
        let remainingProcesses = [...this.processes];
        let queue = [];
        let completedProcesses = [];
        
        this.currentTime = Math.min(...this.processes.map(p => p.arrivalTime));

        // Sort processes by arrival time
        remainingProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);

        while (remainingProcesses.length > 0 || queue.length > 0) {
            // Add newly arrived processes to queue
            while (remainingProcesses.length > 0 && remainingProcesses[0].arrivalTime <= this.currentTime) {
                queue.push(remainingProcesses.shift());
            }

            if (queue.length === 0) {
                this.currentTime++;
                continue;
            }

            let currentProcess = queue.shift();

            // Record response time
            if (currentProcess.responseTime === -1) {
                currentProcess.responseTime = this.currentTime - currentProcess.arrivalTime;
            }

            // Calculate execution time for this quantum
            let executionTime = Math.min(this.timeQuantum, currentProcess.remainingTime);

            // Add to Gantt chart
            this.ganttChart.push({
                process: currentProcess.name,
                start: this.currentTime,
                end: this.currentTime + executionTime
            });

            // Update process
            currentProcess.remainingTime -= executionTime;
            this.currentTime += executionTime;

            // Add newly arrived processes during this quantum
            while (remainingProcesses.length > 0 && remainingProcesses[0].arrivalTime <= this.currentTime) {
                queue.push(remainingProcesses.shift());
            }

            if (currentProcess.remainingTime > 0) {
                queue.push(currentProcess);
            } else {
                currentProcess.completionTime = this.currentTime;
                completedProcesses.push(currentProcess);
            }
        }

        this.processes = completedProcesses;
        return {
            ganttChart: this.ganttChart,
            metrics: this.calculateMetrics()
        };
    }
}
class SRTF {
    constructor(processes) {
        this.processes = JSON.parse(JSON.stringify(processes)); // Deep copy
        this.timeline = [];
        this.metrics = [];
        this.run();
    }

    run() {
        let time = 0;
        let completed = 0;
        const n = this.processes.length;
        const remaining = this.processes.map(p => ({
            ...p,
            remainingTime: p.burstTime,
            isStarted: false
        }));

        while (completed < n) {
            const available = remaining
                .filter(p => p.arrivalTime <= time && p.remainingTime > 0)
                .sort((a, b) => a.remainingTime - b.remainingTime || a.arrivalTime - b.arrivalTime);

            if (available.length > 0) {
                const current = available[0];

                if (!current.isStarted) {
                    current.startTime = time;
                    current.isStarted = true;
                }

                this.timeline.push({ process: current.name, start: time, end: time + 1 });
                current.remainingTime--;
                time++;

                if (current.remainingTime === 0) {
                    current.completionTime = time;
                    current.turnaroundTime = time - current.arrivalTime;
                    current.waitingTime = current.turnaroundTime - current.burstTime;
                    current.responseTime = current.startTime - current.arrivalTime;
                    this.metrics.push(current);
                    completed++;
                }
            } else {
                this.timeline.push({ process: 'Idle', start: time, end: time + 1 });
                time++;
            }
        }

        this.processes = this.metrics; // optional cleanup
    }

    getTimeline() {
        return this.timeline;
    }

    getMetrics() {
        return this.metrics.map(p => ({
            processName: p.name,
            waitingTime: p.waitingTime,
            turnaroundTime: p.turnaroundTime,
            responseTime: p.responseTime
        }));
    }

    getAverageMetrics() {
        const n = this.metrics.length;
        let totalWaiting = 0, totalTurnaround = 0, totalResponse = 0;

        for (const p of this.metrics) {
            totalWaiting += p.waitingTime;
            totalTurnaround += p.turnaroundTime;
            totalResponse += p.responseTime;
        }

        return {
            avgWaitingTime: totalWaiting / n,
            avgTurnaroundTime: totalTurnaround / n,
            avgResponseTime: totalResponse / n
        };
    }

    execute() {
        return {
            ganttChart: this.getTimeline(),
            metrics: this.getMetrics(),
            averageMetrics: this.getAverageMetrics()
        };
    }
}

class PriorityScheduling extends SchedulingAlgorithm {
    execute() {
        let remainingProcesses = [...this.processes];
        let completedProcesses = [];
        
        this.currentTime = Math.min(...this.processes.map(p => p.arrivalTime));

        while (remainingProcesses.length > 0) {
            // Find available processes at current time
            let availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= this.currentTime);
            
            if (availableProcesses.length === 0) {
                this.currentTime++;
                continue;
            }

            // Find process with highest priority (lower number = higher priority)
            let nextProcess = availableProcesses.reduce((min, p) => 
                p.priority < min.priority ? p : min
            );

            // Record response time
            if (nextProcess.responseTime === -1) {
                nextProcess.responseTime = this.currentTime - nextProcess.arrivalTime;
            }

            // Add to Gantt chart
            this.ganttChart.push({
                process: nextProcess.name,
                start: this.currentTime,
                end: this.currentTime + nextProcess.burstTime
            });

            // Update process completion time
            nextProcess.completionTime = this.currentTime + nextProcess.burstTime;
            this.currentTime = nextProcess.completionTime;

            // Move process to completed list
            completedProcesses.push(nextProcess);
            remainingProcesses = remainingProcesses.filter(p => p !== nextProcess);
        }

        this.processes = completedProcesses;
        return {
            ganttChart: this.ganttChart,
            metrics: this.calculateMetrics()
        };
    }
} 