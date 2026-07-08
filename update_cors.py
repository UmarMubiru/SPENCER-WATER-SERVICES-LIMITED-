with open('core/settings.py', 'r') as f:
    content = f.read()

content = content.replace(
    "'http://localhost:3000,http://127.0.0.1:3000'",
    "'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001'"
)

with open('core/settings.py', 'w') as f:
    f.write(content)

print("CORS updated to include port 3001")
