from django.http import JsonResponse

def home_view(request):
    return JsonResponse({
        "status": "ok",
        "message": "Job Board API is running successfully 🚀"
    })
