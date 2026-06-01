from travel_app.models import Destination, Hotel, Transport

def run():
    destinations_data = [
        {"name": "Lahore", "description": "The heart of Pakistan", "price": 500.00},
        {"name": "Islamabad", "description": "The capital city", "price": 700.00},
        {"name": "Karachi", "description": "City of lights", "price": 800.00},
        {"name": "Murree", "description": "Hill station getaway", "price": 600.00},
        {"name": "Skardu", "description": "Gateway to the mountains", "price": 1000.00},
        {"name": "Hunza", "description": "Valley of peace", "price": 950.00},
        {"name": "Swat", "description": "Mini Switzerland of Pakistan", "price": 850.00},
    
    ]

    hotels_data = {
        "Lahore": ["Pearl Continental Lahore", "Avari Hotel", "Faletti's Hotel"],
        "Islamabad": ["Serena Hotel", "Ramada Islamabad", "Hotel One Super"],
        "Karachi": ["Mövenpick Karachi", "Marriott Hotel Karachi", "Beach Luxury Hotel"],
        "Murree": ["Shangrila Resort Murree", "Lockwood Hotel", "Hotel One Mall Road"],
        "Skardu": ["Serena Shigar Fort", "Hotel Himalaya Skardu", "Shangrila Resort Skardu"],
        "Hunza": ["Eagle's Nest Hotel", "Hunza Serena Inn", "Darbar Hotel Hunza"],
        "Swat": ["Swat Serena Hotel", "Rock City Resort", "Hotel Swat Regency"],
    }

    transport_data = {
        "Lahore": [("Car", "Toyota Corolla with AC"), ("Van", "Hiace 12-seater for groups")],
        "Islamabad": [("Car", "Honda Civic, private ride"), ("Bus", "Daewoo intercity service"),],
        "Karachi": [("Car", "Suzuki Cultus for local travel"), ("Van", "Hi-roof 8-seater")],
        "Murree": [("Jeep", "4x4 for mountain roads"), ("Car", "Suzuki Alto for budget travel")],
        "Skardu": [("Jeep", "Land Cruiser for off-road"), ("Van", "Toyota Hiace for families")],
        "Hunza": [("Jeep", "Mountain tour vehicle"), ("Car", "Comfortable ride for 4")],
        "Swat": [("Bus", "Swat Coach - daily departures"), ("Car", "Local rental with driver")],
    }

    # Clear existing data
    Destination.objects.all().delete()
    Hotel.objects.all().delete()
    Transport.objects.all().delete()

    for dest_data in destinations_data:
        dest = Destination.objects.create(
            name=dest_data["name"],
            description=dest_data["description"],
            price=dest_data["price"]
        )

        for hotel_name in hotels_data[dest.name]:
            Hotel.objects.create(name=hotel_name, destination=dest)

        for trans_type, desc in transport_data[dest.name]:
            Transport.objects.create(type=trans_type, description=desc, destination=dest)

    print("✅ Travel data seeded successfully.")
