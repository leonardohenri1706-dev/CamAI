import requests

overpass_url = "https://overpass-api.de/api/interpreter"
overpass_query = """
[out:json][timeout:15];
area["name"="Fortaleza"]["admin_level"="8"]->.searchArea;
(
  node["amenity"~"restaurant|fast_food|bar|cafe"](area.searchArea);
  way["amenity"~"restaurant|fast_food|bar|cafe"](area.searchArea);
);
out tags center 50;
"""

try:
    res = requests.post(overpass_url, data={"data": overpass_query}, timeout=12)
    data = res.json()
    elements = data.get("elements", [])
    print(f"Total elements: {len(elements)}")
    with_phone = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name")
        phone = tags.get("contact:whatsapp") or tags.get("contact:mobile") or tags.get("contact:phone") or tags.get("phone")
        if name and phone:
            with_phone.append((name, phone, tags.get("cuisine", ""), tags.get("website", "")))

    print(f"Elements with REAL phone: {len(with_phone)}")
    for name, phone, cuisine, website in with_phone[:15]:
        print(f" * {name} -> Real Phone: {phone} (Cuisine: {cuisine})")
except Exception as e:
    print(f"Error: {e}")
