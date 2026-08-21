import requests

res = requests.get(
    "https://nominatim.openstreetmap.org/search",
    params={
        "format": "json",
        "q": "restaurante Fortaleza",
        "limit": 50,
        "addressdetails": 1,
        "extratags": 1
    },
    headers={"User-Agent": "LeadPulse-Test/1.0"},
    timeout=8
)

places = res.json()
print(f"Total places returned: {len(places)}")
found_count = 0
for p in places:
    name = p.get("name")
    extratags = p.get("extratags") or {}
    phone = extratags.get("phone") or extratags.get("contact:phone") or extratags.get("contact:whatsapp") or extratags.get("contact:mobile")
    if phone:
        found_count += 1
        print(f"REAL PLACE WITH PHONE: {name} => {phone}")

print(f"Places with real phone in tags: {found_count}")
