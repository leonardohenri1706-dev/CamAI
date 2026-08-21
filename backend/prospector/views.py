from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Avg, Q
from .models import TargetLocation, ProjectAnalysis, Lead
from .serializers import TargetLocationSerializer, ProjectAnalysisSerializer, LeadSerializer
from .engine.nlp_analyzer import analyze_github_or_text_with_python
from .engine.osm_search import geocode_location_with_osm, search_real_places_with_python
from .engine.scoring import calculate_python_lead_score
import datetime

class AnalyzeRepoView(APIView):
    """
    POST /api/django/analyze-repo/
    Analyzes GitHub repo or manual description with Pure Python NLP / regex.
    Saves analysis to Django SQLite database.
    """
    def post(self, request):
        repo_url = request.data.get('repoUrl')
        manual_description = request.data.get('manualDescription')
        openrouter_key = request.data.get('openrouterApiKey')
        openrouter_model = request.data.get('openrouterModel')

        analysis_dict = analyze_github_or_text_with_python(
            repo_url=repo_url,
            manual_description=manual_description,
            openrouter_api_key=openrouter_key,
            openrouter_model=openrouter_model
        )

        project, _ = ProjectAnalysis.objects.update_or_create(
            repo_url=analysis_dict.get('repoUrl', 'custom'),
            defaults={
                'repo_name': analysis_dict.get('repoName', 'Projeto'),
                'description': analysis_dict.get('description', ''),
                'icp_data': analysis_dict.get('icp', {}),
                'core_value_prop': analysis_dict.get('coreValueProp', ''),
                'search_keywords': analysis_dict.get('searchKeywords', []),
                'solved_pain_points': analysis_dict.get('solvedPainPoints', []),
            }
        )

        return Response({'success': True, 'analysis': analysis_dict, 'projectId': project.id})


class SearchPlacesView(APIView):
    """
    POST /api/django/search-places/
    Pure Python geographic search & OSM Nominatim geocoder with real places.
    Zero AI required.
    """
    def post(self, request):
        location = request.data.get('location') or {}
        custom_query = request.data.get('customQuery')
        category = request.data.get('category')

        target_name = custom_query or location.get('name') or 'São Paulo - Moema'
        target_city = location.get('city') or 'São Paulo'
        target_center = location.get('center') or {'lat': -23.604, 'lng': -46.666}

        if custom_query:
            geo_res = geocode_location_with_osm(custom_query)
            if geo_res.get('success'):
                target_center = geo_res['center']
                target_name = geo_res['name']
                target_city = geo_res['city']

        leads = search_real_places_with_python(
            location_name=target_name,
            city_name=target_city,
            center_lat=target_center['lat'],
            center_lng=target_center['lng'],
            category=category or 'Hamburgueria',
            keywords=request.data.get('keywords')
        )

        return Response({
            'success': True,
            'leads': leads,
            'center': target_center,
            'locationName': target_name,
            'city': target_city,
            'source': 'real_osm_places_engine'
        })


class ScoreLeadsView(APIView):
    """
    POST /api/django/score-lead/
    Pure Python Lead Scoring algorithm (0-100%) and WhatsApp sales copy generator.
    """
    def post(self, request):
        raw_leads = request.data.get('rawLeads') or []
        repo_analysis = request.data.get('repoAnalysis') or {}
        pitch_tone = request.data.get('pitchTone', 'consultive')
        openrouter_key = request.data.get('openrouterApiKey')
        openrouter_model = request.data.get('openrouterModel')
        dev_name = request.data.get('devName', 'Leonardo')
        demo_url = request.data.get('demoUrl')

        scored_leads = []
        for lead in raw_leads:
            dh = lead.get('digitalHealth', {})
            score_res = calculate_python_lead_score(
                place_name=lead.get('displayName', 'Estabelecimento'),
                category=lead.get('category', 'Restaurante'),
                digital_health=dh,
                repo_analysis=repo_analysis,
                pitch_tone=pitch_tone,
                openrouter_api_key=openrouter_key,
                openrouter_model=openrouter_model,
                dev_name=dev_name,
                demo_url=demo_url
            )
            scored_leads.append({
                **lead,
                'scoreResult': score_res,
            })

        scored_leads.sort(key=lambda x: x['scoreResult']['leadScorePercentage'], reverse=True)
        return Response({'success': True, 'leads': scored_leads})


class LocationListCreateView(APIView):
    def get(self, request):
        locations = TargetLocation.objects.all()
        serializer = TargetLocationSerializer(locations, many=True)
        return Response({'success': True, 'locations': serializer.data})

    def post(self, request):
        raw_name = request.data.get('name')
        if not raw_name:
            return Response({'success': False, 'error': 'Nome da localização é obrigatório'}, status=400)

        geo = geocode_location_with_osm(raw_name)
        location_obj, _ = TargetLocation.objects.get_or_create(
            name=geo['name'],
            defaults={
                'city': geo['city'],
                'state': geo['state'],
                'latitude': geo['center']['lat'],
                'longitude': geo['center']['lng'],
                'zoom': geo['zoom'],
                'is_custom': True,
            }
        )
        serializer = TargetLocationSerializer(location_obj)
        return Response({
            'success': True,
            'location': {
                'id': location_obj.id,
                'name': location_obj.name,
                'city': location_obj.city,
                'state': location_obj.state,
                'center': {'lat': location_obj.latitude, 'lng': location_obj.longitude},
                'zoom': location_obj.zoom,
                'isCustom': location_obj.is_custom,
            }
        }, status=status.HTTP_201_CREATED)


class LocationDeleteView(APIView):
    def delete(self, request, pk):
        location = get_object_or_404(TargetLocation, pk=pk)
        location.delete()
        return Response({'success': True, 'message': 'Localização removida.'})


class LeadListCreateView(APIView):
    """
    GET /api/django/leads/ - Fetch all saved CRM leads from SQLite
    POST /api/django/leads/ - Save or create lead in CRM
    """
    def get(self, request):
        leads = Lead.objects.filter(is_saved=True)
        category = request.query_params.get('category')
        crm_status_filter = request.query_params.get('status')

        if category and category != 'Todas':
            leads = leads.filter(category=category)
        if crm_status_filter:
            leads = leads.filter(crm_status=crm_status_filter)

        serializer = LeadSerializer(leads, many=True)
        return Response({'success': True, 'leads': serializer.data})

    def post(self, request):
        lead_data = request.data
        lead_id = lead_data.get('id') or lead_data.get('lead_id')
        if not lead_id:
            lead_id = f"manual_{int(datetime.datetime.now().timestamp())}"

        dh = lead_data.get('digitalHealth', {})
        sr = lead_data.get('scoreResult', {})
        coords = lead_data.get('coordinates', {})

        initial_timeline = [{
            'date': datetime.datetime.now().strftime('%d/%m/%Y %H:%M'),
            'event': 'Lead adicionado ao CRM',
            'status': lead_data.get('crmStatus', 'Novo')
        }]

        lead_obj, created = Lead.objects.update_or_create(
            lead_id=lead_id,
            defaults={
                'display_name': lead_data.get('displayName') or lead_data.get('display_name', 'Novo Cliente'),
                'contact_name': lead_data.get('contactName') or lead_data.get('contact_name', ''),
                'category': lead_data.get('category', 'Geral'),
                'formatted_address': lead_data.get('formattedAddress') or lead_data.get('formatted_address', ''),
                'neighborhood': lead_data.get('neighborhood', ''),
                'city': lead_data.get('city', ''),
                'latitude': coords.get('lat') or lead_data.get('latitude', 0.0),
                'longitude': coords.get('lng') or lead_data.get('longitude', 0.0),
                'has_website': dh.get('hasWebsite', lead_data.get('has_website', False)),
                'website_url': dh.get('websiteUrl') or lead_data.get('website_url'),
                'has_whatsapp': dh.get('hasWhatsApp', lead_data.get('has_whatsapp', True)),
                'phone': dh.get('formattedPhone') or lead_data.get('phone'),
                'raw_phone': dh.get('rawPhone') or lead_data.get('raw_phone'),
                'rating': dh.get('rating', lead_data.get('rating', 4.5)),
                'reviews_count': dh.get('reviewsCount', lead_data.get('reviews_count', 0)),
                'google_maps_uri': dh.get('googleMapsUri') or lead_data.get('google_maps_uri', ''),
                'photo_url': dh.get('photoUrl') or lead_data.get('photo_url'),
                'score_percentage': sr.get('leadScorePercentage', lead_data.get('score_percentage', 80)),
                'classification': sr.get('classification', lead_data.get('classification', 'Alta Prioridade')),
                'rationale': sr.get('rationale', lead_data.get('rationale', '')),
                'custom_pitch': sr.get('customPitch', lead_data.get('custom_pitch', '')),
                'crm_status': lead_data.get('crmStatus', lead_data.get('crm_status', 'Novo')),
                'monthly_fee': float(lead_data.get('monthlyFee', lead_data.get('monthly_fee', 150.0))),
                'setup_fee': float(lead_data.get('setupFee', lead_data.get('setup_fee', 400.0))),
                'is_saved': True,
                'notes': lead_data.get('notes', ''),
                'timeline_logs': initial_timeline,
            }
        )

        serializer = LeadSerializer(lead_obj)
        return Response({'success': True, 'lead': serializer.data}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class LeadDetailView(APIView):
    """
    PATCH /api/django/leads/<lead_id>/ - Update status/pitch/deal/notes
    DELETE /api/django/leads/<lead_id>/ - Unsave lead
    """
    def patch(self, request, lead_id):
        lead = get_object_or_404(Lead, lead_id=lead_id)
        
        if 'crmStatus' in request.data or 'crm_status' in request.data:
            new_status = request.data.get('crmStatus') or request.data.get('crm_status')
            if new_status != lead.crm_status:
                lead.crm_status = new_status
                logs = lead.timeline_logs or []
                logs.append({
                    'date': datetime.datetime.now().strftime('%d/%m/%Y %H:%M'),
                    'event': f'Status alterado para "{new_status}"',
                    'status': new_status
                })
                lead.timeline_logs = logs

        if 'monthlyFee' in request.data or 'monthly_fee' in request.data:
            lead.monthly_fee = float(request.data.get('monthlyFee') or request.data.get('monthly_fee', 150.0))
        if 'setupFee' in request.data or 'setup_fee' in request.data:
            lead.setup_fee = float(request.data.get('setupFee') or request.data.get('setup_fee', 400.0))
        if 'contactName' in request.data or 'contact_name' in request.data:
            lead.contact_name = request.data.get('contactName') or request.data.get('contact_name')
        if 'customPitch' in request.data or 'custom_pitch' in request.data:
            lead.custom_pitch = request.data.get('customPitch') or request.data.get('custom_pitch')
        if 'notes' in request.data:
            lead.notes = request.data['notes']
        if 'isSaved' in request.data or 'is_saved' in request.data:
            lead.is_saved = request.data.get('isSaved', request.data.get('is_saved', True))
            
        lead.save()
        serializer = LeadSerializer(lead)
        return Response({'success': True, 'lead': serializer.data})

    def delete(self, request, lead_id):
        lead = get_object_or_404(Lead, lead_id=lead_id)
        lead.is_saved = False
        lead.save()
        return Response({'success': True, 'message': 'Lead removido do CRM.'})


class CRMStatsView(APIView):
    """
    GET /api/django/crm/stats/
    Calculates REAL sales pipeline statistics from Django SQLite database.
    Zero mock data.
    """
    def get(self, request):
        saved_leads = Lead.objects.filter(is_saved=True)
        total_leads = saved_leads.count()

        closed_leads = saved_leads.filter(crm_status='Fechado')
        in_demo = saved_leads.filter(crm_status='Demonstracao')
        contacted = saved_leads.filter(crm_status='Contatado')
        new_leads = saved_leads.filter(crm_status='Novo')
        lost_leads = saved_leads.filter(crm_status='Perdido')

        closed_count = closed_leads.count()
        conversion_rate = round((closed_count / total_leads * 100), 1) if total_leads > 0 else 0.0

        total_mrr = closed_leads.aggregate(total=Sum('monthly_fee'))['total'] or 0.0
        total_setup = closed_leads.aggregate(total=Sum('setup_fee'))['total'] or 0.0

        active_pipeline = saved_leads.exclude(crm_status__in=['Fechado', 'Perdido'])
        pipeline_value = sum((l.monthly_fee * 12 + l.setup_fee) for l in active_pipeline)

        niche_stats = []
        categories = saved_leads.values('category').annotate(count=Count('id')).order_by('-count')
        for cat in categories:
            cat_name = cat['category']
            cat_leads = saved_leads.filter(category=cat_name)
            cat_closed = cat_leads.filter(crm_status='Fechado').count()
            cat_mrr = cat_leads.filter(crm_status='Fechado').aggregate(total=Sum('monthly_fee'))['total'] or 0.0
            niche_stats.append({
                'category': cat_name,
                'count': cat['count'],
                'closed': cat_closed,
                'mrr': round(cat_mrr, 2)
            })

        return Response({
            'success': True,
            'stats': {
                'totalLeads': total_leads,
                'closedCount': closed_count,
                'inNegotiationCount': contacted.count() + in_demo.count(),
                'newCount': new_leads.count(),
                'lostCount': lost_leads.count(),
                'conversionRate': conversion_rate,
                'totalMrr': round(total_mrr, 2),
                'totalSetupRevenue': round(total_setup, 2),
                'pipelineValue': round(pipeline_value, 2),
                'stageCounts': {
                    'Novo': new_leads.count(),
                    'Contatado': contacted.count(),
                    'Demonstracao': in_demo.count(),
                    'Fechado': closed_count,
                    'Perdido': lost_leads.count(),
                },
                'nicheBreakdown': niche_stats,
            }
        })


class LocationAutocompleteView(APIView):
    """
    GET /api/django/locations/autocomplete/?q=moema
    Returns real-time map location suggestions from OSM & SQLite database as the user types.
    """
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query or len(query) < 2:
            return Response({'success': True, 'suggestions': []})

        suggestions = []

        local_matches = TargetLocation.objects.filter(name__icontains=query)[:3]
        for loc in local_matches:
            suggestions.append({
                'name': loc.name,
                'city': loc.city,
                'state': loc.state,
                'center': {'lat': loc.latitude, 'lng': loc.longitude},
                'zoom': loc.zoom,
                'source': 'saved_db'
            })

        try:
            import requests
            res = requests.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "format": "json",
                    "q": query,
                    "addressdetails": 1,
                    "limit": 6,
                    "countrycodes": "br"
                },
                headers={"User-Agent": "LeadPulse-B2B-Prospector/1.0"},
                timeout=4
            )
            if res.status_code == 200:
                data = res.json()
                for item in data:
                    addr = item.get("address", {})
                    city = addr.get("city") or addr.get("town") or addr.get("municipality") or addr.get("village") or addr.get("state_district") or ""
                    state = addr.get("state") or ""
                    suburb = addr.get("suburb") or addr.get("neighbourhood") or ""

                    if suburb and city:
                        display = f"{suburb} - {city}, {state}"
                    elif city and state:
                        display = f"{city}, {state}"
                    else:
                        display = item.get("display_name", "").split(",")[0] + (f" - {city}" if city else "")

                    if not any(s['name'].lower() == display.lower() for s in suggestions):
                        suggestions.append({
                            'name': display,
                            'city': city or display,
                            'state': state or 'BR',
                            'center': {
                                'lat': float(item['lat']),
                                'lng': float(item['lon'])
                            },
                            'zoom': 14,
                            'source': 'osm_maps'
                        })
        except Exception as e:
            print(f"Autocomplete error: {e}")

        return Response({'success': True, 'suggestions': suggestions[:8]})
