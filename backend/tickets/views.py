import logging

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .classifier import classify_ticket
from .models import Ticket
from .serializers import ClassifySerializer, TicketPatchSerializer, TicketSerializer

logger = logging.getLogger(__name__)


@api_view(["GET", "POST"])
def ticket_list(request):
    """
    GET  - list tickets with optional filters
    POST - create a new ticket
    """
    if request.method == "POST":
        serializer = TicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    qs = Ticket.objects.all()

    if cat := request.query_params.get("category"):
        qs = qs.filter(category=cat)
    if pri := request.query_params.get("priority"):
        qs = qs.filter(priority=pri)
    if st := request.query_params.get("status"):
        qs = qs.filter(status=st)
    if search := request.query_params.get("search"):
        qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))

    return Response(TicketSerializer(qs, many=True).data)


@api_view(["PATCH"])
def ticket_detail(request, pk):
    """Partial update — status changes, category/priority overrides, etc."""
    try:
        ticket = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = TicketPatchSerializer(ticket, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["GET"])
def ticket_stats(request):
    """
    Aggregated stats — all computed at the DB level via aggregate/annotate.
    No Python-level loops over individual rows.
    """
    totals = Ticket.objects.aggregate(
        total=Count("id"),
        open_count=Count("id", filter=Q(status="open")),
    )

    total = totals["total"]
    open_count = totals["open_count"]

    if total == 0:
        avg_per_day = 0.0
    else:
        first_ticket = Ticket.objects.earliest("created_at")
        days_elapsed = (timezone.now() - first_ticket.created_at).days + 1
        avg_per_day = round(total / days_elapsed, 1)

    priority_rows = Ticket.objects.values("priority").annotate(count=Count("id"))
    priority_breakdown = {p: 0 for p in ["low", "medium", "high", "critical"]}
    for row in priority_rows:
        priority_breakdown[row["priority"]] = row["count"]

    category_rows = Ticket.objects.values("category").annotate(count=Count("id"))
    category_breakdown = {c: 0 for c in ["billing", "technical", "account", "general"]}
    for row in category_rows:
        category_breakdown[row["category"]] = row["count"]

    return Response({
        "total_tickets": total,
        "open_tickets": open_count,
        "avg_tickets_per_day": avg_per_day,
        "priority_breakdown": priority_breakdown,
        "category_breakdown": category_breakdown,
    })


@api_view(["POST"])
def classify_view(request):
    """Send description to LLM, return suggested category + priority."""
    serializer = ClassifySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        result = classify_ticket(serializer.validated_data["description"])
        return Response(result)
    except (ValueError, ConnectionError) as e:
        logger.warning("Classify failed: %s", e)
        return Response(
            {"detail": str(e)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
