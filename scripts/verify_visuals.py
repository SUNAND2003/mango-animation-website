import os, time, subprocess

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
user_data = r'C:\Users\sunan\AppData\Local\Temp\chrome_verify_' + str(int(time.time()))
out_dir = r'C:\Users\sunan\.gemini\antigravity\brain\a3470498-a9ec-4e12-9f86-78361dbc2af6'

# Let's take a screenshot directly using Chrome headless
out_0 = os.path.join(out_dir, 'final_verify_hero_0.png')
cmd = [
    chrome_path,
    '--headless',
    '--disable-gpu',
    f'--screenshot={out_0}',
    '--window-size=1280,800',
    'http://localhost:4173/'
]
subprocess.run(cmd, check=True)
print('Saved final_verify_hero_0.png, size:', os.path.getsize(out_0))
