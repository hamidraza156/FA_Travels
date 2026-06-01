from rest_framework import serializers
from .models import User, Destination, Booking, Hotel, Transport

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role']

class DestinationSerializer(serializers.ModelSerializer):
    # Override photo_url to avoid strict URL validation errors
    photo_url = serializers.CharField(allow_blank=True, allow_null=True)

    class Meta:
        model = Destination
        fields = '__all__'

class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ['id', 'name', 'destination']

class TransportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transport
        fields = ['id', 'type', 'description', 'destination']

class BookingSerializer(serializers.ModelSerializer):
    # For writing (POST/PUT)
    destination = serializers.PrimaryKeyRelatedField(queryset=Destination.objects.all())
    hotel = serializers.PrimaryKeyRelatedField(queryset=Hotel.objects.all(), allow_null=True, required=False)
    transport = serializers.PrimaryKeyRelatedField(queryset=Transport.objects.all(), allow_null=True, required=False)

    # For reading (GET)
    destination_detail = DestinationSerializer(source='destination', read_only=True)
    hotel_detail = HotelSerializer(source='hotel', read_only=True)
    transport_detail = TransportSerializer(source='transport', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user',
            'destination', 'hotel', 'transport',  # For writing
            'destination_detail', 'hotel_detail', 'transport_detail',  # For reading
            'date', 'guests'
        ]
        read_only_fields = ['id', 'user', 'destination_detail', 'hotel_detail', 'transport_detail']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = request.user if request else None

        # Only allow update if user owns the booking or is admin
        if user != instance.user and user.role != 'admin':
            raise serializers.ValidationError("You do not have permission to update this booking.")

        # Partial update support: update only fields present in validated_data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
