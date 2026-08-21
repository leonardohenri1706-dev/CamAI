from django.urls import path
from .views import (
    AnalyzeRepoView,
    SearchPlacesView,
    ScoreLeadsView,
    LocationListCreateView,
    LocationDeleteView,
    LeadListCreateView,
    LeadDetailView,
    LocationAutocompleteView,
    CRMStatsView,
    StartEnrichmentView,
    TaskStatusView
)

urlpatterns = [
    path('analyze-repo/', AnalyzeRepoView.as_view(), name='analyze-repo'),
    path('search-places/', SearchPlacesView.as_view(), name='search-places'),
    path('score-lead/', ScoreLeadsView.as_view(), name='score-lead'),
    path('locations/autocomplete/', LocationAutocompleteView.as_view(), name='locations-autocomplete'),
    path('locations/', LocationListCreateView.as_view(), name='locations'),
    path('locations/<int:pk>/', LocationDeleteView.as_view(), name='location-detail'),
    path('crm/stats/', CRMStatsView.as_view(), name='crm-stats'),
    path('leads/enrich/', StartEnrichmentView.as_view(), name='start-enrichment'),
    path('leads/task/<str:task_id>/', TaskStatusView.as_view(), name='task-status'),
    path('leads/', LeadListCreateView.as_view(), name='leads'),
    path('leads/<str:lead_id>/', LeadDetailView.as_view(), name='lead-detail'),
]

