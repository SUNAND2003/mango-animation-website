import json

with open(r'C:\Users\sunan\.gemini\antigravity\brain\a3470498-a9ec-4e12-9f86-78361dbc2af6\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        obj = json.loads(line)
        if obj.get('step_index') == 2282:
            tc = obj.get('tool_calls', [])
            for call in tc:
                if call.get('name') == 'write_file':
                    args = call.get('args', {})
                    path = args.get('Path', '').strip('"')
                    content = args.get('Content', '')
                    # If content was json encoded string
                    if content.startswith('"') and content.endswith('"'):
                        content = json.loads(content)
                    print(f"Restoring {path} (length {len(content)})")
                    with open(path, 'w', encoding='utf-8') as out_f:
                        out_f.write(content)
print("Files restored from step 2282!")
