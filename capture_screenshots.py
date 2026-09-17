import subprocess
import time
import os
import http.server
import socketserver
import threading

PORT = 8092
DIST_DIR = os.path.join(os.path.dirname(__file__), 'prototype', 'dist')
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), 'docs', 'screenshots')
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
    ('01_3F_corridor.png', 'corridor'),
    ('02_316_office.png', 'office'),
    ('03_his_workstation.png', 'workstation'),
    ('04_elevator_lobby.png', 'elevator'),
    ('05_4f_arrival_duty_room.png', '4f_dutyroom'),
    ('06_4f_closed_ward_gate.png', '4f_gate'),
    ('hotfix_01_316_doorway.png', 'hotfix_316_doorway'),
    ('hotfix_02_4f_signs.png', 'hotfix_4f_signs'),
    ('hotfix_03_orange_fixed.png', 'hotfix_orange_fixed'),
    ('hotfix_04_duty_door_plate.png', 'hotfix_duty_door')
]

for filename, preset in presets:
    out_path = os.path.join(SCREENSHOT_DIR, filename)
    url = f'http://127.0.0.1:{PORT}/index.html?cam={preset}'
    print(f'Capturing {filename}...')
    cmd = [
        chrome_path,
        '--headless=new',
        '--no-sandbox',
        '--hide-scrollbars',
        '--virtual-time-budget=1500',
        '--run-all-compositor-stages-before-draw',
        '--window-size=1280,720',
        f'--screenshot={out_path}',
        url
    ]
    try:
        subprocess.run(cmd, timeout=8)
        if os.path.exists(out_path):
            print(f'✓ {filename} ({os.path.getsize(out_path)} bytes)')
        else:
            print(f'✗ Failed {filename}')
    except Exception as e:
        print(f'Error {filename}: {e}')

print('Capture complete.')
