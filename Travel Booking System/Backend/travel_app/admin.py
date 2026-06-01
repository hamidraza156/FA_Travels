from django.contrib import admin
from .models import User, Destination, Booking

admin.site.register(User)
admin.site.register(Destination)
admin.site.register(Booking)