import requests
import time

queries = [
    "restaurante Fortaleza",
    "pizzaria Fortaleza",
    "barbearia Fortaleza"
]

for q in queries:
    try:
        res = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"format": "json", "q": q, "limit": 40, "addressdetails": 1, "extratags": 1},
            headers={"User-Agent": "LeadPulse-Test-Runner/1.0"},
            timeout=8
        )
        if res.status_code == 200:
            places = res.json()
            phones = []
            for p in places:
                et = p.get("extratags") or {}
                ph = et.get("contact:whatsapp") or et.get("contact:mobile") or et.get("contact:phone") or et.get("phone")
                if ph:
                    phones.append((p.get("name"), ph))
            print(f"Query '{q}': {len(places)} places, {len(phones)} with phone:")
            for name, ph in phones:
                print(f"   -> {name}: {ph}")
    except Exception as e:
        print(f"Query '{q}' error: {e}")
    time.sleep(1.2)
