import requests

query = """
[out:json][timeout:15];
(
  node["amenity"~"restaurant|fast_food|cafe|bar"](-3.76, -38.58, -3.70, -38.48);
  way["amenity"~"restaurant|fast_food|cafe|bar"](-3.76, -38.58, -3.70, -38.48);
);
out tags center 50;
"""

urls = [
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter"
]

for u in urls:
    try:
        print(f"Testing {u}...")
        r = requests.post(u, data={"data": query}, headers={"User-Agent": "LeadPulse-Agent/1.0"}, timeout=10)
        print(f"  -> Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            elements = data.get("elements", [])
            print(f"  -> Total places: {len(elements)}")
            with_mobile = []
            for el in elements:
                tags = el.get("tags", {})
                name = tags.get("name")
                ph = tags.get("contact:whatsapp") or tags.get("contact:mobile") or tags.get("contact:phone") or tags.get("phone")
                if name and ph:
                    with_mobile.append((name, ph))
            print(f"  -> With phone: {len(with_mobile)}")
            for n, p in with_mobile[:8]:
                print(f"      * {n} -> {p}")
            break
    except Exception as e:
        print(f"  -> Error: {e}")
