from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from django.conf import settings

import requests
import traceback

from .models import Destination, Booking, Hotel, Transport, User
from .serializers import (
    DestinationSerializer, BookingSerializer,
    HotelSerializer, TransportSerializer, UserSerializer
)

User = get_user_model()

# --- Custom Permission ---

from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', '') == 'admin'
        )

# --- Destinations and Hotels/Transports ---

class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [AllowAny]

class HotelViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HotelSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        dest_id = self.request.query_params.get('destination')
        return Hotel.objects.filter(destination_id=dest_id) if dest_id else Hotel.objects.none()

class TransportViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransportSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        dest_id = self.request.query_params.get('destination')
        return Transport.objects.filter(destination_id=dest_id) if dest_id else Transport.objects.none()

# --- Bookings ---

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Booking.objects.all() if getattr(user, 'role', '') == 'admin' else Booking.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- Travel Suggestions via Gemini ---

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def travel_suggestions(request):
    budget = request.data.get('budget')
    if not budget:
        return Response({'error': 'Budget is required.'}, status=status.HTTP_400_BAD_REQUEST)

    prompt = (
        f"Act as a travel agent. A user has a budget of {budget} PKR. "
        "Suggest 3 travel destinations within Pakistan that they can afford. "
        "For each destination, give a brief name and a one-line reason why it is suitable for that budget."
    )

    try:
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}',
            json={"contents": [{"parts": [{"text": prompt}]}]}
        )
        data = response.json()
        candidates = data.get("candidates", [])
        if not candidates:
            return Response({'error': 'Gemini returned no candidates.'}, status=500)

        content = candidates[0].get("content", {})
        parts = content.get("parts", [])
        suggestions = parts[0].get('text') if parts and 'text' in parts[0] else None

        if not suggestions:
            return Response({'error': 'Gemini returned no suggestions text.'}, status=500)

        return Response({'suggestions': suggestions})
    except Exception as e:
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)

# --- Auth: Register / Login / Logout ---

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name', '')
        role = request.data.get('role', 'user')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'User already exists.'}, status=400)

        user = User.objects.create_user(
            username=email, email=email, password=password, first_name=name
        )
        user.role = role
        user.save()

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'User registered successfully.',
            'token': token.key,
            'role': user.role,
        }, status=201)

    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=400)

    user = authenticate(username=email, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        response = Response({'token': token.key, 'role': user.role}, status=200)
        response.set_cookie('token', token.key, httponly=True, samesite='Lax')
        response.set_cookie('userEmail', user.email)
        return response

    return Response({'error': 'Invalid credentials'}, status=401)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    response = Response({"message": "Logged out"}, status=200)
    try:
        request.user.auth_token.delete()
    except:
        pass
    response.delete_cookie('token')
    response.delete_cookie('userEmail')
    return response

# --- Admin: Users and Bookings ---

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def users_with_bookings(request):
    if getattr(request.user, 'role', '') != 'admin':
        return Response({'error': 'Not authorized'}, status=403)

    users = User.objects.all()
    result = []
    for user in users:
        user_data = {
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'bookings': BookingSerializer(Booking.objects.filter(user=user), many=True).data
        }
        result.append(user_data)

    return Response(result, status=200)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminRole])  # Changed here
def delete_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        if user.role == 'admin':
            return Response({'error': 'Cannot delete admin users.'}, status=403)
        user.delete()
        return Response({'message': 'User deleted successfully.'}, status=200)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

# --- Admin: Manage Destinations ---

@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminRole])  # Changed here
def manage_locations(request):
    if request.method == 'GET':
        destinations = Destination.objects.all()
        return Response(DestinationSerializer(destinations, many=True).data)

    elif request.method == 'POST':
        serializer = DestinationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminRole])  # Changed here
def delete_location(request, location_id):
    try:
        destination = Destination.objects.get(id=location_id)
        destination.delete()
        return Response({'message': 'Location deleted successfully.'}, status=200)
    except Destination.DoesNotExist:
        return Response({'error': 'Location not found.'}, status=404)

# --- Booking Details by ID ---

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def booking_detail(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({'detail': 'Booking not found.'}, status=404)

    if request.user != booking.user and getattr(request.user, 'role', '') != 'admin':
        return Response({'detail': 'Not authorized.'}, status=403)

    if request.method == 'GET':
        return Response(BookingSerializer(booking).data)

    elif request.method == 'PUT':
        serializer = BookingSerializer(booking, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        booking.delete()
        return Response(status=204)

# --- List Bookings for Current User or Admin ---

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def bookings_list(request):
    if getattr(request.user, 'role', '') == 'admin':
        bookings = Booking.objects.all()
    else:
        bookings = Booking.objects.filter(user=request.user)

    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)
