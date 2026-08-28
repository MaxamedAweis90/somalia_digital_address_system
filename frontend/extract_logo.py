import re, base64
with open('/home/ahmed/Downloads/cinwaan-landing.html', 'r') as f:
    content = f.read()
match = re.search(r'data:image/png;base64,([A-Za-z0-9+/=]+)', content)
if match:
    b64 = match.group(1)
    data = base64.b64decode(b64)
    with open('/home/ahmed/Desktop/somalia_digital_address_system/frontend/public/logo.png', 'wb') as out:
        out.write(data)
    print(f'Extracted logo: {len(data)} bytes')
else:
    print('No match found')
