release: cd backend && python manage.py migrate
web: cd backend && gunicorn core.wsgi:application --timeout 120 --workers 4 --worker-class sync --bind 0.0.0.0:$PORT
