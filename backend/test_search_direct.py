import requests
from prospector.engine.osm_search import search_real_places_with_python

leads = search_real_places_with_python("Fortaleza", "Fortaleza", -3.731862, -38.526670, "Hamburgueria")
print(f"Total leads returned: {len(leads)}")
for l in leads:
    print(f" * {l['displayName']} => {l['digitalHealth']['formattedPhone']} ({l['digitalHealth']['rawPhone']})")
