from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from travel_app.views import (
    DestinationViewSet, BookingViewSet, HotelViewSet, TransportViewSet,
    travel_suggestions, register, login_view, logout_view,
    users_with_bookings, booking_detail, bookings_list,
    delete_user, manage_locations, delete_location
)

# Routers for public viewsets
router = DefaultRouter()
router.register(r'destinations', DestinationViewSet, basename='destinations')
router.register(r'hotels', HotelViewSet, basename='hotels')
router.register(r'transports', TransportViewSet, basename='transports')
router.register(r'bookings', BookingViewSet, basename='bookings')

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # Public API endpoints (bookings, destinations, etc.)
    path('api/', include(router.urls)),

    # --- Authentication ---
    path('api/auth/register/', register, name='register'),
    path('api/auth/login/', login_view, name='login'),
    path('api/auth/logout/', logout_view, name='logout'),
    path('api/auth/', include('rest_framework.urls')),  # For browsable API login/logout

    # Aliases
    path('api/signup/', register),
    path('api/login/', login_view),

    # --- AI Travel Suggestions ---
    path('api/suggestions/', travel_suggestions, name='travel_suggestions'),

    # --- Bookings ---
    path('bookings/<int:booking_id>/', booking_detail, name='booking_detail'),
    path('bookings/', bookings_list, name='bookings_list'),

    # --- Admin APIs ---
    path('api/admin/users-with-bookings/', users_with_bookings, name='users_with_bookings'),
    path('api/admin/delete-user/<int:user_id>/', delete_user, name='delete_user'),
    path('api/admin/locations/', manage_locations, name='manage_locations'),
    path('api/admin/delete-destination/<int:destination_id>/', delete_location, name='delete_location'),
]
