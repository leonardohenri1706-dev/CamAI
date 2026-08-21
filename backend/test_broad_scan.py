import requests

query = """
[out:json][timeout:20];
(
  node["amenity"~"restaurant|fast_food|cafe|bar|pub|ice_cream|food_court"](-3.85, -38.65, -3.68, -38.42);
  node["shop"~"hairdresser|barber|beauty|bakery|pastry|deli|car_repair|car_parts"](-3.85, -38.65, -3.68, -38.42);
  node["healthcare"~"dentist|clinic|doctor"](-3.85, -38.65, -3.68, -38.42);
  node["contact:whatsapp"](-3.85, -38.65, -3.68, -38.42);
  node["contact:mobile"](-3.85, -38.65, -3.68, -38.42);
  way["amenity"~"restaurant|fast_food|cafe|bar"](-3.85, -38.65, -3.68, -38.42);
);
out tags center 300;
"""

res = requests.post("https://lz4.overpass-api.de/api/interpreter", data={"data": query}, headers={"User-Agent": "BotClientes/2.0"}, timeout=15)
print("Status:", res.status_code)
if res.status_code == 200:
    data = res.json()
    elements = data.get("elements", [])
    print("Total elements found in broad scan:", len(elements))
    with_mobile = []
    for el in elements:
        t = el.get("tags", {})
        name = t.get("name")
        ph = t.get("contact:whatsapp") or t.get("contact:mobile") or t.get("contact:phone") or t.get("phone")
        if name and ph:
            with_mobile.append((name, ph, t.get("amenity") or t.get("shop") or "comercio"))
    print("Total with registered phone:", len(with_mobile))
    for n, p, cat in with_mobile[:25]:
        print(f" * {n} [{cat}] -> {p}")
