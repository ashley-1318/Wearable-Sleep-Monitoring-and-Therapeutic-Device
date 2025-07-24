# app.py
# Main application for the Wearable Sleep Monitoring and Therapeutic Device Simulation
# with a rule-based detection model.

import time
import random
import json
from flask import Flask, render_template, Response
from collections import deque

app = Flask(__name__)

# --- Configuration for the Detection Model ---
# We'll use a deque as a sliding window to hold the last 10 seconds of data.
DATA_HISTORY = deque(maxlen=10)
HEART_RATE_DIP_THRESHOLD = 8  # BPM drop from baseline to be considered a dip
HEART_RATE_SPIKE_THRESHOLD = 12 # BPM spike from the dip to be considered a recovery spike

def analyze_data_model(history):
    """
    This function acts as our detection model. It analyzes the recent
    history of data to identify a sleep apnea pattern.

    The pattern is:
    1. A significant dip in heart rate compared to the average.
    2. A sharp spike in heart rate immediately following the dip.

    Args:
        history: A deque containing the most recent data points.

    Returns:
        True if an apnea pattern is detected, False otherwise.
    """
    if len(history) < history.maxlen:
        return False # Not enough data to make a determination

    # Calculate the average heart rate over the history window
    avg_hr = sum(d['heart_rate'] for d in history) / len(history)

    # Find the minimum heart rate in the last 5 seconds
    recent_dip = min(d['heart_rate'] for d in list(history)[-5:])

    # Get the most recent heart rate
    current_hr = history[-1]['heart_rate']

    # Check for the pattern: a dip followed by a spike
    if (recent_dip < avg_hr - HEART_RATE_DIP_THRESHOLD) and \
       (current_hr > recent_dip + HEART_RATE_SPIKE_THRESHOLD):
        print(f"MODEL DETECTED APNEA: Avg HR={avg_hr:.1f}, Dip={recent_dip}, Spike={current_hr}")
        return True

    return False

def generate_simulated_data():
    """
    A generator function that simulates real-time data from a sleep monitoring device.
    It now includes forced patterns for the model to detect.
    """
    heart_rate_baseline = 65
    motion_baseline = 10

    while True:
        # Decide whether to inject an apnea pattern into the data stream
        if random.random() < 0.08: # 8% chance to start generating an apnea pattern
            print("Injecting apnea data pattern into the stream...")
            # Generate 4-5 seconds of dipping heart rate
            for _ in range(random.randint(4, 5)):
                hr = heart_rate_baseline - random.randint(10, 15)
                motion = motion_baseline + random.randint(5, 10)
                yield hr, motion
                time.sleep(1)
            # Generate 1-2 seconds of a recovery spike
            for _ in range(random.randint(1, 2)):
                hr = heart_rate_baseline + random.randint(15, 20)
                motion = motion_baseline + random.randint(15, 25)
                yield hr, motion
                time.sleep(1)
        else:
            # Generate normal data
            hr = heart_rate_baseline + random.randint(-2, 2)
            motion = motion_baseline + random.randint(-5, 5)
            yield hr, motion
            time.sleep(1)

def data_stream_generator():
    """
    Main generator that gets simulated data, analyzes it, and yields it.
    """
    for heart_rate, motion in generate_simulated_data():
        # Ensure motion is not negative
        motion = max(0, motion)

        # Create the data point for the current second
        current_data = {
            'time': time.strftime('%H:%M:%S'),
            'heart_rate': heart_rate,
            'motion': motion
        }

        # Add the current data to our history
        DATA_HISTORY.append(current_data)

        # Analyze the history with our model to detect apnea
        is_apnea = analyze_data_model(DATA_HISTORY)
        current_data['is_apnea'] = is_apnea

        # Yield the data in SSE format
        json_data = json.dumps(current_data)
        yield f"data:{json_data}\n\n"


@app.route('/')
def index():
    """Render the main web page."""
    return render_template('index.html')

@app.route('/data_feed')
def data_feed():
    """Data streaming route that sends server-sent events."""
    return Response(data_stream_generator(), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
