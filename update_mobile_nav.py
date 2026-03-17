import os

files = ["index.html", "about.html", "team.html", "contact.html", "publications.html", "opportunities.html", "workshops.html"]

js_snippet = """
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const mobileMenu = document.getElementById('mobile-menu');
            const navLinks = document.querySelector('.nav-links');
            if (mobileMenu) {
                mobileMenu.addEventListener('click', () => {
                    navLinks.classList.toggle('active');
                    mobileMenu.classList.toggle('active');
                });
            }
        });
    </script>
</body>"""

for f in files:
    try:
        if not os.path.exists(f):
            print(f"File {f} not found.")
            continue
            
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            
        # Add menu-toggle element
        if '<div class="menu-toggle"' not in content:
            content = content.replace('<ul class="nav-links">', 
                '<div class="menu-toggle" id="mobile-menu">\n                <span class="bar"></span>\n                <span class="bar"></span>\n                <span class="bar"></span>\n            </div>\n            <ul class="nav-links">')
                
        # Add JavaScript to the bottom
        if "mobileMenu.addEventListener" not in content:
            content = content.replace('</body>', js_snippet)
            
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
            print(f"Successfully updated nav in {f}")
            
    except Exception as e:
        print(f"Error on {f}: {e}")
