from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    def __str__(self):
        return f"{self.username} ({self.role})"


class Destination(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    photo_url = models.URLField(blank=True, null=True)  # add photo url

    def __str__(self):
        return self.name


class Hotel(models.Model):
    name = models.CharField(max_length=100)
    destination = models.ForeignKey(Destination, related_name='hotels', on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    price_per_night = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.destination.name})"


class Transport(models.Model):
    TRANSPORT_TYPES = [
        ('Car', 'Car'),
        ('Van', 'Van'),
        ('Jeep', 'Jeep'),
        ('Bus', 'Bus'),
        ('Bike', 'Bike'),
    ]
    type = models.CharField(max_length=20, choices=TRANSPORT_TYPES)
    description = models.TextField()
    destination = models.ForeignKey(Destination, related_name='transports', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.type} - {self.destination.name}"


class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='bookings')
    hotel = models.ForeignKey(Hotel, on_delete=models.SET_NULL, null=True, blank=True)
    transport = models.ForeignKey(Transport, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateField()
    guests = models.IntegerField()

    def __str__(self):
        return f"{self.user.username} booked {self.destination.name}"
