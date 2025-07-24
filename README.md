Web-Based Simulation of a Wearable Sleep Monitoring and Therapeutic Device

This project is a web-based simulation of the academic project, "Wearable Sleep Monitoring and Therapeutic Device". It demonstrates the core concept of analyzing real-time biometric data to detect sleep apnea events and trigger a simulated therapeutic response.

Project Objective
The goal is to showcase a system that can:

Receive and process a real-time stream of simulated biometric data (Heart Rate and Motion).

Analyze this data to identify patterns indicative of a sleep apnea event.

Visualize the data on a live dashboard.

Trigger a clear alert when a potential apnea event is detected, simulating the "therapeutic" aspect of the device.

Features
Real-Time Data Simulation: The Flask backend generates a continuous stream of realistic, fluctuating sleep data.

Apnea Event Simulation: The backend randomly injects data patterns typical of a sleep apnea event (a drop in heart rate followed by a spike, accompanied by increased motion).

Live Data Visualization: A responsive dashboard built with Chart.js plots the incoming heart rate and motion data on a real-time graph.

Status Monitoring: The UI clearly indicates whether the current status is "NORMAL" or "APNEA DETECTED".

Therapeutic Alert: A prominent alert panel appears on the screen to signify when a therapeutic response (like a gentle vibration on a real device) would be triggered.

Technology Stack
Backend: Python, Flask (for the web server and data streaming).

Data Streaming: Server-Sent Events (SSE) for efficient real-time communication from server to client.

Frontend: HTML, CSS, JavaScript.

Data Visualization: Chart.js for creating responsive, real-time charts.

How It Works
Backend Simulation: The Python app.py script runs a Flask server. A generator function continuously creates simulated sleep data, randomly creating apnea-like events.

Data Streaming: The /data_feed endpoint uses SSE to push this data to any connected web client every second.

Frontend Reception: The script.js file on the client-side listens to the /data_feed event stream.

Live Updates: On receiving new data, the JavaScript updates the numerical displays, updates the Chart.js graph, and checks if an apnea event is flagged.

Alert Trigger: If the incoming data indicates an apnea event, the script changes the status display to "APNEA DETECTED" and makes the therapeutic alert panel visible.

Setup and Installation
1. Clone the Repository:

git clone https://github.com/ashley-1318/Wearable-Sleep-Monitoring-and-Therapeutic-Device
cd sleep-monitoring-device

2. Create a Virtual Environment (Recommended):

# For Windows
python -m venv venv
venv\Scripts\activate

# For macOS/Linux
python3 -m venv venv
source venv/bin/activate

3. Install Dependencies:

pip install -r requirements.txt

4. Run the Application:

python app.py

5. View in Browser:

Open your web browser and navigate to http://127.0.0.1:5000. You will see the dashboard with live-updating data. Wait for a few moments, and you should see a simulated apnea event trigger the alert.
