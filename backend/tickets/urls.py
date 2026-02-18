from django.urls import path

from . import views

urlpatterns = [
    path("tickets/", views.ticket_list, name="ticket-list"),
    path("tickets/<int:pk>/", views.ticket_detail, name="ticket-detail"),
    path("tickets/stats/", views.ticket_stats, name="ticket-stats"),
    path("tickets/classify/", views.classify_view, name="ticket-classify"),
]
