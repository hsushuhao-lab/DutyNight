import subprocess
import time
import os
import http.server
import socketserver
import threading

PORT = 8094
ROOT_DIR = os.path.dirname(__file__)
DIST_DIR = os.path.join(ROOT_DIR, 'prototype', 'dist')
SCREENSHOT_DIR = os.path.join(ROOT_DIR, 'docs', 'screenshots')
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)
    def log_message(self, format, *args):
        pass

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('', PORT), QuietHandler) as httpd:
        httpd.serve_forever()

server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()
time.sleep(1)

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
if not os.path.exists(chrome_path):
    chrome_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

presets = [
    ('01_1f_closed_glass_entrance.png', 'first_campus_1f', 1.0, 1.7, -4.5, 0.0, -0.05),
    ('02_2f_er_triage_and_ward_gate.png', 'first_campus_2f', -2.5, 1.7, 0.0, -1.57, 0.0),
    ('03_3f_316_entrance_privacy.png', 'first_campus_3f', 2.1, 1.7, 0.4, 2.65, 0.0),
    ('04_4f_ward_signage.png', 'first_campus_4f', -8.0, 1.7, 0.0, -1.57, 0.12),
    ('05_4f_protected_nursing_station.png', 'first_campus_4f', 8.0, 1.7, 0.0, 3.14, 0.05),
    ('06_8f_heritage_gallery.png', 'first_campus_8f', -3.8, 1.7, 0.0, -1.57, 0.02),
    ('07_second_campus_1f_guard_desk.png', 'second_campus_1f', 74.0, 1.7, -2.2, 0.0, -0.12),
    ('08_second_campus_2f_bridge_control.png', 'second_campus_2f', 67.0, 1.7, 0.0, 3.14, -0.05),
    ('09_second_campus_5f_nursing_station.png', 'second_campus_5f', 77.5, 1.7, -0.5, 3.14, 0.02),
    ('10_ecology_pond_waterside_boardwalk.png', 'ecology_pond', 61.5, 0.84, -50.8, 3.14, -0.05)
]

for filename, zone, x, y, z, yaw, pitch in presets:
    out_path = os.path.join(SCREENSHOT_DIR, filename)
    url = f'http://127.0.0.1:{PORT}/index.html?zone={zone}&spawn=m12_pond_waterside' if zone == 'ecology_pond' else f'http://127.0.0.1:{PORT}/index.html?zone={zone}&x={x}&y={y}&z={z}&yaw={yaw}&pitch={pitch}'
    print(f'Capturing {filename} ({zone})...')
    cmd = [
        chrome_path,
        '--headless=new',
        '--no-sandbox',
        '--hide-scrollbars',
        '--virtual-time-budget=2000',
        '--run-all-compositor-stages-before-draw',
        '--window-size=1280,720',
        f'--screenshot={out_path}',
        url
    ]
    try:
        subprocess.run(cmd, timeout=12)
        if os.path.exists(out_path):
            print(f'✓ {filename} ({os.path.getsize(out_path)} bytes)')
        else:
            print(f'✗ Failed {filename}')
    except Exception as e:
        print(f'Error {filename}: {e}')

print('All 10 validation screenshots captured successfully.')
