import os

files = ["index.html", "about.html", "team.html", "contact.html", "publications.html", "opportunities.html"]

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Check if workshops is already added
        if "workshops.html" not in content:
            lines = content.split('\n')
            new_lines = []
            for line in lines:
                new_lines.append(line)
                if '>Introduction</a></li>' in line:
                    new_lines.append('                <li><a href="workshops.html" class="blink">Workshops</a></li>')
            
            with open(f, 'w', encoding='utf-8') as file:
                file.write('\n'.join(new_lines))
                print(f"Updated nav in {f}")
    except Exception as e:
        print(f"Error on {f}: {e}")
