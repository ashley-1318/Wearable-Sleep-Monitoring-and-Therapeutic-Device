document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const statusText = document.getElementById('status-text');
    const statusIndicator = document.getElementById('status-indicator');
    const heartRateValue = document.getElementById('heart-rate-value');
    const motionValue = document.getElementById('motion-value');
    const alertPanel = document.getElementById('alert-panel');
    const eventLog = document.getElementById('event-log');
    const heartSvg = document.getElementById('heart-svg');
    const ctx = document.getElementById('sleepChart').getContext('2d');
    
    const MAX_DATA_POINTS = 30;
    const MAX_LOG_ENTRIES = 10;

    // Audio Alert Synthesis
    const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
    }).toDestination();

    // Chart.js Configuration
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Heart Rate (BPM)',
                data: [],
                borderColor: 'var(--accent-blue)',
                backgroundColor: 'rgba(88, 166, 255, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                yAxisID: 'y',
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: 'var(--accent-blue)'
            }, {
                label: 'Motion Level',
                data: [],
                borderColor: 'var(--accent-green)',
                backgroundColor: 'rgba(63, 185, 80, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                yAxisID: 'y1',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'second', displayFormats: { second: 'HH:mm:ss' } },
                    ticks: { color: 'var(--text-secondary)' },
                    grid: { color: 'var(--border-color)' }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Heart Rate (BPM)', color: 'var(--accent-blue)' },
                    min: 40,
                    max: 100,
                    ticks: { color: 'var(--accent-blue)' },
                    grid: { color: 'var(--border-color)' }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: { display: true, text: 'Motion Level', color: 'var(--accent-green)' },
                    min: 0,
                    max: 50,
                    grid: { drawOnChartArea: false },
                    ticks: { color: 'var(--accent-green)' }
                }
            },
            plugins: {
                legend: { labels: { color: 'var(--text-primary)' } }
            }
        }
    });

    function addLogEntry(message, timestamp) {
        const placeholder = document.querySelector('.log-entry-placeholder');
        if (placeholder) placeholder.remove();
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `<span class="timestamp">${timestamp}</span> ${message}`;
        
        eventLog.prepend(logEntry);

        if (eventLog.children.length > MAX_LOG_ENTRIES) eventLog.lastChild.remove();
    }

    // Main data handling via Server-Sent Events
    const eventSource = new EventSource("/data_feed");

    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const time = new Date();

        // Update SVG animation speed based on heart rate
        const heartRateAnimationSpeed = 60 / data.heart_rate;
        heartSvg.style.animationDuration = `${heartRateAnimationSpeed.toFixed(2)}s`;

        // Update chart data
        if (chart.data.labels.length >= MAX_DATA_POINTS) {
            chart.data.labels.shift();
            chart.data.datasets.forEach((dataset) => dataset.data.shift());
        }

        chart.data.labels.push(time);
        chart.data.datasets[0].data.push(data.heart_rate);
        chart.data.datasets[1].data.push(data.motion);
        
        // Reset previous point styles
        chart.data.datasets[0].pointRadius = chart.data.datasets[0].data.map(() => 3);
        chart.data.datasets[0].pointBackgroundColor = chart.data.datasets[0].data.map(() => 'var(--accent-blue)');


        // Update text values
        heartRateValue.textContent = data.heart_rate;
        motionValue.textContent = data.motion;

        // Update status and alert panel
        if (data.is_apnea) {
            if (statusIndicator.className !== 'status-apnea') {
                statusText.textContent = 'APNEA DETECTED';
                statusIndicator.className = 'status-apnea';
                alertPanel.className = 'alert-visible';
                addLogEntry('Apnea Event Detected', data.time);
                Tone.start().then(() => synth.triggerAttackRelease("C4", "0.5"));
            }
            // Highlight the apnea point on the chart
            const lastIndex = chart.data.datasets[0].data.length - 1;
            chart.data.datasets[0].pointRadius[lastIndex] = 8;
            chart.data.datasets[0].pointBackgroundColor[lastIndex] = 'var(--accent-red)';

        } else {
            statusText.textContent = 'NORMAL';
            statusIndicator.className = 'status-normal';
            alertPanel.className = 'alert-hidden';
        }
        
        chart.update('quiet');
    };

    eventSource.onerror = function(err) {
        console.error("EventSource failed:", err);
        statusText.textContent = 'DISCONNECTED';
        eventSource.close();
    };
});
