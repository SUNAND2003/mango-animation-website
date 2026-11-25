import json, os

with open(r'C:\Users\sunan\.gemini\antigravity\brain\a3470498-a9ec-4e12-9f86-78361dbc2af6\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        obj = json.loads(line)
        if obj.get('step_index') == 2282:
            tc = obj.get('tool_calls', [])
            for call in tc:
                if call.get('name') == 'write_file':
                    args = call.get('args', {})
                    path = args.get('Path', '').strip('"')
                    base = os.path.basename(path)
                    content = args.get('Content', '')
                    if content.startswith('"') and content.endswith('"'):
                        content = json.loads(content)
                    print('Restoring:', base, 'Length:', len(content))
                    with open(base + '.step2282', 'w', encoding='utf-8') as out_f:
                        out_f.write(content)
print('Done!')
