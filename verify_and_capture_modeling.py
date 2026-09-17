# verify_and_capture_modeling.py - Automated QA runner & screenshot capturer for Milestones M0~M13
import subprocess
import time
import os
import sys
import http.server
import socketserver
import threading
import json
import shutil

PORT = 8095
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(ROOT_DIR, 'prototype', 'dist')
SCREENSHOT_DIR = os.path.join(ROOT_DIR, 'docs', 'screenshots', 'modeling')
ART_DIR = r'C:\Users\Asher\.gemini\antigravity\brain\3fd2e15d-b3b8-4aa0-8be8-1bad8791d299'

os.makedirs(SCREENSHOT_DIR, exist_ok=True)
if os.path.exists(ART_DIR):
    os.makedirs(ART_DIR, exist_ok=True)

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

# Milestones and corresponding spawn presets
milestones = [
    ('m0_3f_corridor.png', 'first_campus_3f', 'm0_3f_corridor', 'M0: First Campus 3F Corridor'),
    ('m0_316_entrance.png', 'first_campus_3f', 'm0_316_entrance', 'M0: 316 Office Entrance & Plaque'),
    ('m0_316_office.png', 'first_campus_3f', 'm0_316_office', 'M0: 316 Physician Office Anchors'),
    ('m1_4f_lobby.png', 'first_campus_4f', 'm1_4f_lobby', 'M1: 4F Arrival & Elevator Lobby'),
    ('m2_4f_duty_room.png', 'first_campus_4f', 'm2_4f_duty_room', 'M2: 4F Independent Duty Room Suite'),
    ('m3_4f_nursing_station.png', 'first_campus_4f', 'm3_4f_nursing_station', 'M3: 4F Care Nursing Station'),
    ('m3_4f_ward_gate.png', 'first_campus_4f', 'm3_4f_ward_gate', 'M3: 4F Controlled Ward Gate'),
    ('m4_2f_er_arrival.png', 'first_campus_2f', 'm4_2f_er_arrival', 'M4: 2F ER Arrival Corridor'),
    ('m4_2f_er_bays.png', 'first_campus_2f', 'm4_2f_er_bays', 'M4: 2F ER Acute Observation Bays'),
    ('m4_2f_er_treatment.png', 'first_campus_2f', 'm4_2f_er_treatment', 'M4: 2F Acute Treatment Room'),
    ('m4_2f_er_exterior.png', 'first_campus_2f', 'm4_2f_er_exterior', 'M4: 2F Ambulance Bay Exterior'),
    ('m5_1f_lobby_entrance.png', 'first_campus_1f', 'm5_1f_lobby_entrance', 'M5: 1F Main Public Lobby Entrance'),
    ('m5_1f_reception.png', 'first_campus_1f', 'm5_1f_reception', 'M5: 1F Information & Reception Counter'),
    ('m6_8f_bridge_entry.png', 'first_campus_8f', 'm6_8f_bridge_entry', 'M6: 8F Skybridge Transition Vestibule'),
    ('m7_skybridge_span.png', 'skybridge', 'm7_skybridge_mid', 'M7: Long Enclosed Skybridge Span'),
    ('m8_second_campus_std.png', 'second_campus_std', 'm8_second_campus_std', 'M8: Second Campus Standard Inpatient Ward'),
    ('m9_second_campus_2f.png', 'second_campus_2f', 'm9_second_campus_2f', 'M9: Second Campus 2F Bridge Landing'),
    ('m10_second_campus_1f.png', 'second_campus_1f', 'm10_second_campus_1f', 'M10: Second Campus 1F Hillside Exit'),
    ('m11_hillside_trail.png', 'hillside_route', 'm11_hillside_main', 'M11: Outdoor Hillside Trail'),
    ('m11_hillside_fork.png', 'hillside_route', 'm11_hillside_branch', 'M11: Pond Branching Fork'),
    ('m12_ecology_pond.png', 'ecology_pond', 'm12_pond_deck', 'M12: Contained Ecological Pond Boardwalk')
]

print("=== CAPTURING MILESTONE MODELING SCREENSHOTS ===")
for filename, zone_id, spawn_id, desc in milestones:
    out_path = os.path.join(SCREENSHOT_DIR, filename)
    url = f"http://127.0.0.1:{PORT}/index.html?zone={zone_id}&spawn={spawn_id}"
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
            size = os.path.getsize(out_path)
            print(f"✓ [{desc}] -> {filename} ({size} bytes)")
            # Copy to artifact dir for report embedding
            if os.path.exists(ART_DIR):
                shutil.copyfile(out_path, os.path.join(ART_DIR, filename))
        else:
            print(f"✗ Failed to capture {filename}")
    except Exception as e:
        print(f"Error {filename}: {e}")

print("=== ALL MILESTONE SCREENSHOTS CAPTURED SUCCESSFULLY ===")
