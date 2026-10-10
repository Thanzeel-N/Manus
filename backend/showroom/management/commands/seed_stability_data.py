"""Management command to seed nearly 100 realistic cars, test drive slots,
multiple customer enquiries, and test drive bookings to test backend stability."""

from datetime import datetime, time, timedelta
import random
import uuid

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model

from inventory.models import Car, CarImage
from bookings.models import Booking, TestDriveSlot
from enquiries.models import Enquiry


CAR_CATALOG = [
    # Mercedes-Benz
    {
        "slug": "mercedes-e220d-exclusive-2022",
        "brand": "Mercedes-Benz",
        "name": "Mercedes-Benz E-Class",
        "variant": "E 220d Exclusive",
        "year": 2022,
        "mileage": 28500,
        "price": 62.50,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Exquisite chauffeur-driven E-Class with rear reclining executive seats, panoramic dual sunroof, and Burmester surround sound. Impeccable company service record with valid warranty.",
        "features": "Rear Executive Reclining Seats\nBurmester Surround Sound\nPanoramic Dual Sunroof\n64-Color Ambient Lighting\nAir Suspension",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "mercedes-c200-progressive-2021",
        "brand": "Mercedes-Benz",
        "name": "Mercedes-Benz C-Class",
        "variant": "C 200 Progressive",
        "year": 2021,
        "mileage": 31000,
        "price": 44.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Mint condition C 200 with turbocharged petrol refinement, MBUX portrait display, digital driver cluster, and memory seats. Single owner, zero insurance claims.",
        "features": "11.9-inch Portrait MBUX Display\nMemory Package for Front Seats\nLED High Performance Headlamps\nActive Brake Assist\nWireless Phone Charging",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "mercedes-s350d-limousine-2020",
        "brand": "Mercedes-Benz",
        "name": "Mercedes-Benz S-Class",
        "variant": "S 350d Limousine",
        "year": 2020,
        "mileage": 39000,
        "price": 115.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "The pinnacle of luxury. S-Class long wheelbase with massage seats, rear seat entertainment, active scent fragrance system, and magic body control.",
        "features": "Rear Hot-Stone Massage Seats\nDual Rear Entertainment Screens\nAirmatic Adaptive Air Suspension\nBurmester 3D Surround Sound\nSoft-Close Doors",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "mercedes-glc220d-4matic-2022",
        "brand": "Mercedes-Benz",
        "name": "Mercedes-Benz GLC",
        "variant": "GLC 220d 4MATIC",
        "year": 2022,
        "mileage": 26000,
        "price": 58.50,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Dynamic compact luxury SUV equipped with intelligent all-wheel drive, panoramic sunroof, off-road drive modes, and automated parking assistant.",
        "features": "4MATIC All-Wheel Drive\nPanoramic Sliding Sunroof\nParktronic with 360-Degree Camera\nElectrically Folding Mirrors\nDigital Cockpit",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "mercedes-gle300d-4matic-2021",
        "brand": "Mercedes-Benz",
        "name": "Mercedes-Benz GLE",
        "variant": "GLE 300d 4MATIC",
        "year": 2021,
        "mileage": 42000,
        "price": 76.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Commanding road presence with air suspension, spacious 5-seater luxury, powered tailgate, and dual 12.3-inch widescreen cockpit.",
        "features": "Dual 12.3-inch Widescreen Displays\nAir Suspension with Height Adjustment\nElectrically Adjustable 2nd Row Seats\nBlind Spot Assist\nMultibeam LED Headlights",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "mercedes-gla200-progressive-2023",
        "brand": "Mercedes-Benz",
        "name": "Mercedes-Benz GLA",
        "variant": "GLA 200 Progressive",
        "year": 2023,
        "mileage": 14000,
        "price": 42.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Sporty urban luxury crossover with low miles, pristine interior, twin 10.25-inch displays, panoramic glass roof, and ambient lighting.",
        "features": "Twin 10.25-inch MBUX Screens\nPanoramic Sunroof\nSports Seats with Lumbar Support\nReverse Camera with Active Guidelines\nApple CarPlay & Android Auto",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "mercedes-a200-limousine-2022",
        "brand": "Mercedes-Benz",
        "name": "Mercedes-Benz A-Class",
        "variant": "A 200 Limousine",
        "year": 2022,
        "mileage": 22000,
        "price": 38.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Sleek and efficient executive compact saloon with impressive technology package, high fuel economy, and factory Mercedes warranty.",
        "features": "MBUX Voice Control with 'Hey Mercedes'\nDigital Instrument Cluster\nElectrically Adjustable Memory Seats\nPanoramic Glass Roof\nActive Parking Assist",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "mercedes-gls400d-4matic-2021",
        "brand": "Mercedes-Benz",
        "name": "Mercedes-Benz GLS",
        "variant": "GLS 400d 4MATIC",
        "year": 2021,
        "mileage": 36000,
        "price": 110.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "The S-Class of SUVs. Three rows of first-class power-folding seating, 330 hp twin-turbo diesel, and five-zone climate control.",
        "features": "7 Electrically Folding Seats\n5-Zone Automatic Climate Control\nAirmatic Suspension\nSoft Close Doors\nPanoramic Sliding Sunroof",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "mercedes-eqs580-4matic-2023",
        "brand": "Mercedes-Benz",
        "name": "Mercedes-Benz EQS",
        "variant": "EQS 580 4MATIC",
        "year": 2023,
        "mileage": 9500,
        "price": 145.00,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Ultra-luxury electric flagship with revolutionary 56-inch curved MBUX Hyperscreen, 857 km claimed range, and rear-axle steering.",
        "features": "56-inch Curved MBUX Hyperscreen\nRear-Axle Steering (10 degrees)\nBurmester 3D Surround Sound with EV Soundscapes\nLevel 2 ADAS Driving Assistant\nHEPA Air Filtration System",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "mercedes-amg-g63-2021",
        "brand": "Mercedes-Benz",
        "name": "Mercedes-Benz G-Class",
        "variant": "AMG G 63",
        "year": 2021,
        "mileage": 21000,
        "price": 245.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "reserved",
        "description": "Iconic G-Wagon featuring handcrafted 4.0L V8 Biturbo producing 585 hp, AMG side-exit exhaust, triple locking differentials, and carbon fiber trim.",
        "features": "Handcrafted 585 hp AMG V8 Biturbo\nAMG Performance Exhaust System\nTriple Differential Locks\nNappa Leather Diamond Quilted Interior\n22-inch Forged AMG Wheels",
        "image": "cars/photos/mercedes.jpg"
    },

    # BMW
    {
        "slug": "bmw-330li-m-sport-2023",
        "brand": "BMW",
        "name": "BMW 3 Series Gran Limousine",
        "variant": "330Li M Sport",
        "year": 2023,
        "mileage": 16000,
        "price": 54.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Extended wheelbase 3 Series offering incredible rear legroom, BMW Curved Display with OS 8, panoramic sunroof, and M aerodynamic kit.",
        "features": "BMW Curved Display (14.9-inch + 12.3-inch)\nHarman Kardon 16-Speaker Audio\nPanoramic Sunroof\nM Sport Leather Steering Wheel\nComfort Access with Kick-to-Open Tailgate",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "bmw-520d-luxury-line-2021",
        "brand": "BMW",
        "name": "BMW 5 Series",
        "variant": "520d Luxury Line",
        "year": 2021,
        "mileage": 37000,
        "price": 52.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Executive class luxury sedan with unmatched driving dynamics, refined 2.0L TwinPower Turbo diesel, Dakota leather seats, and gesture control.",
        "features": "BMW Gesture Control\nHarman Kardon Surround Sound\nRemote Control Parking\nAdaptive LED Headlamps\nWireless Apple CarPlay",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "bmw-530i-m-sport-2022",
        "brand": "BMW",
        "name": "BMW 5 Series",
        "variant": "530i M Sport",
        "year": 2022,
        "mileage": 25000,
        "price": 57.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Enthusiast-favourite 252 hp petrol sedan with M aerodynamic body package, blue M Sport brakes, head-up display, and ambient light bar.",
        "features": "BMW Head-Up Display\nM Sport Suspension & Brakes\nHarman Kardon Audio\nAdaptive Suspension with Comfort/Sport Modes\nReversing Assistant",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "bmw-730ld-m-sport-2020",
        "brand": "BMW",
        "name": "BMW 7 Series",
        "variant": "730Ld M Sport",
        "year": 2020,
        "mileage": 41000,
        "price": 89.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Ultra-luxurious flagship limousine with executive lounge rear seating, touch command tablet, Sky Lounge panoramic sunroof, and carbon core chassis.",
        "features": "Executive Lounge Rear Seating\nBMW Touch Command Tablet\nSky Lounge Panoramic Glass Roof\nLaserlight Headlamps\nTwo-Axle Air Suspension",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "bmw-x1-s-drive-18d-2023",
        "brand": "BMW",
        "name": "BMW X1",
        "variant": "sDrive18d xLine",
        "year": 2023,
        "mileage": 12500,
        "price": 46.50,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "New-generation X1 with bolder stance, minimalist floating center console, dual curved displays, and ultra-efficient diesel powertrain.",
        "features": "Floating Center Console with Gear Selector\nCurved Display with iDrive 9\nPanoramic Glass Roof\nActive Sports Seats\nPark Assist with Auto Reversing",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "bmw-x3-xdrive20d-luxury-2022",
        "brand": "BMW",
        "name": "BMW X3",
        "variant": "xDrive20d Luxury Edition",
        "year": 2022,
        "mileage": 29000,
        "price": 59.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Versatile all-wheel-drive luxury SUV in pristine Phytonic Blue with panoramic sunroof, 3-zone climate control, and Vernasca leather upholstery.",
        "features": "BMW xDrive Intelligent AWD\nPanoramic Glass Roof\nVernasca Leather Upholstery\nAdaptive Suspension\n12.3-inch Digital Cockpit",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "bmw-x5-xdrive40i-m-sport-2022",
        "brand": "BMW",
        "name": "BMW X5",
        "variant": "xDrive40i M Sport",
        "year": 2022,
        "mileage": 27000,
        "price": 85.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Smooth and thunderous 3.0L inline-six petrol producing 340 hp. Features air suspension, 20-inch M light alloy wheels, and gesture control.",
        "features": "340 hp 3.0L Inline-6 TwinPower Turbo\nTwo-Axle Adaptive Air Suspension\nM Sport Exhaust System\nPanoramic Sky Lounge Roof\nWireless Apple CarPlay & Android Auto",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "bmw-x7-xdrive40d-m-sport-2021",
        "brand": "BMW",
        "name": "BMW X7",
        "variant": "xDrive40d M Sport",
        "year": 2021,
        "mileage": 35000,
        "price": 108.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Three-row presidential SUV with 6 captain seats, Sky Lounge LED starlight panoramic roof, five-zone climate control, and soft-close doors.",
        "features": "6 Captain Seat Configuration\nSky Lounge LED Starlight Roof\nHarman Kardon Surround System\nBMW Laserlight Technology\nSelf-Leveling Air Suspension",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "bmw-i4-edrive40-m-sport-2023",
        "brand": "BMW",
        "name": "BMW i4",
        "variant": "eDrive40 M Sport",
        "year": 2023,
        "mileage": 8500,
        "price": 69.90,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "All-electric 4-door Gran Coupe delivering 340 hp and 590 km range. Instant electric torque, M aerodynamic package, and low center of gravity.",
        "features": "83.9 kWh Battery with 590 km Range\nBMW Curved Cockpit Display\nHans Zimmer Electric Soundscapes\nM Sport Aerodynamic Package\nHigh-Speed DC Fast Charging",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "bmw-ix-xdrive40-2023",
        "brand": "BMW",
        "name": "BMW iX",
        "variant": "xDrive40",
        "year": 2023,
        "mileage": 11000,
        "price": 92.50,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Futuristic electric SAV built with carbon cage architecture, hexagonal steering wheel, electrochromic panoramic glass roof, and crystal controls.",
        "features": "Electrochromic Sky Lounge Glass Roof\nClear & Bold Crystal Glass Controls\nBowers & Wilkins Diamond Surround Sound\nSelf-Healing Kidney Grille\nDual Motor Electric All-Wheel Drive",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "bmw-m340i-xdrive-2023",
        "brand": "BMW",
        "name": "BMW M340i",
        "variant": "xDrive",
        "year": 2023,
        "mileage": 14000,
        "price": 66.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Pure performance saloon delivering 387 hp from a 3.0L B58 turbocharged inline-six, achieving 0-100 km/h in just 4.4 seconds with M Sport differential.",
        "features": "387 hp 3.0L B58 Inline-6 Engine\nM Sport Differential & Exhaust\nAdaptive M Suspension\nxDrive Intelligent All-Wheel Drive\nLaunch Control",
        "image": "cars/photos/bmw.jpg"
    },

    # Audi
    {
        "slug": "audi-a4-40-tfsi-technology-2022",
        "brand": "Audi",
        "name": "Audi A4",
        "variant": "40 TFSI Technology",
        "year": 2022,
        "mileage": 24000,
        "price": 41.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Refined German executive sedan with Audi Virtual Cockpit Plus, 10.1-inch MMI touch screen, ambient lighting with 30 colors, and wireless phone box.",
        "features": "Audi Virtual Cockpit Plus\nBang & Olufsen 3D Premium Sound\n10.1-inch MMI Touch Infotainment\nMatrix LED Headlights\nComfort Key with Gesture Boot Lid",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "audi-a6-45-tfsi-technology-2021",
        "brand": "Audi",
        "name": "Audi A6",
        "variant": "45 TFSI Technology",
        "year": 2021,
        "mileage": 33000,
        "price": 54.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Progressive luxury sedan featuring dual MMI touch response screens, mild-hybrid technology, Valcona leather seats, and matrix headlights.",
        "features": "Dual MMI Touchscreens with Haptic Feedback\nBang & Olufsen Premium Audio\nMatrix LED Headlights with Dynamic Indicators\nPanoramic Sunroof\n4-Zone Automatic Climate Control",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "audi-a8l-55-tfsi-quattro-2021",
        "brand": "Audi",
        "name": "Audi A8L",
        "variant": "55 TFSI Quattro",
        "year": 2021,
        "mileage": 28000,
        "price": 98.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Long-wheelbase presidential flagship with rear foot-massage relaxation seats, active air suspension, HD Matrix LED headlights with laser light, and Bang & Olufsen 3D sound.",
        "features": "Rear Relaxation Seat with Foot Massage\nHD Matrix LED with Laser Light\nBang & Olufsen 23-Speaker 3D Advanced Sound\nPredictive Active Air Suspension\nQuattro Permanent All-Wheel Drive",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "audi-q3-40-tfsi-premium-plus-2023",
        "brand": "Audi",
        "name": "Audi Q3",
        "variant": "40 TFSI Quattro Premium Plus",
        "year": 2023,
        "mileage": 15000,
        "price": 43.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Compact premium SUV with standard Quattro AWD, sharp styling, panoramic sunroof, digital instrument cluster, and progressive steering.",
        "features": "Quattro Permanent All-Wheel Drive\nPanoramic Glass Sunroof\nAudi Virtual Cockpit\nWireless Charging with Phone Booster\nComfort Keyless Access",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "audi-q7-55-tfsi-technology-2022",
        "brand": "Audi",
        "name": "Audi Q7",
        "variant": "55 TFSI Quattro Technology",
        "year": 2022,
        "mileage": 27000,
        "price": 79.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Spacious 7-seater luxury SUV powered by 340 hp 3.0L V6 turbo petrol, featuring adaptive air suspension, matrix LED headlamps, and park assist plus.",
        "features": "340 hp 3.0L Turbo V6 with 48V Mild-Hybrid\nAdaptive Air Suspension\n7-Seater Cabin with Electric 3rd Row\nBang & Olufsen 3D Sound System\nMatrix LED Headlamps",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "audi-q8-55-tfsi-celebration-2021",
        "brand": "Audi",
        "name": "Audi Q8",
        "variant": "55 TFSI Quattro Celebration",
        "year": 2021,
        "mileage": 31000,
        "price": 95.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Head-turning flagship coupe-SUV with frameless doors, wide stance, dual MMI touch displays, 3.0L V6 power, and 21-inch alloy wheels.",
        "features": "Frameless Door Windows\nAudi Virtual Cockpit Plus\nAdaptive Air Suspension\nHD Matrix LED Headlamps\nQuattro All-Wheel Drive with Sport Differential",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "audi-etron-55-quattro-2022",
        "brand": "Audi",
        "name": "Audi e-tron",
        "variant": "55 Quattro",
        "year": 2022,
        "mileage": 18000,
        "price": 88.00,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Silent and refined electric luxury SUV with 95 kWh battery, dual motor electric Quattro, air suspension, and fast DC charging support.",
        "features": "95 kWh Battery Pack with Electric Quattro\nAdaptive Air Suspension\nDual MMI Touchscreens\n360-Degree Camera with 3D View\nBang & Olufsen 3D Sound",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "audi-rs5-sportback-2021",
        "brand": "Audi",
        "name": "Audi RS5",
        "variant": "Sportback 2.9 TFSI",
        "year": 2021,
        "mileage": 19500,
        "price": 92.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Coupe",
        "condition": "Used",
        "status": "available",
        "description": "450 hp twin-turbo V6 powerhouse with 0-100 km/h in 3.9 seconds. RS sport exhaust, Quattro with sport differential, and carbon fiber roof package.",
        "features": "450 hp 2.9L Twin-Turbo V6\nRS Sport Exhaust System\nRS Matrix LED Headlights\nRS Sport Seats in Fine Nappa Leather\nQuattro with Sport Differential",
        "image": "cars/photos/audi.jpg"
    },

    # Porsche
    {
        "slug": "porsche-macan-2022",
        "brand": "Porsche",
        "name": "Porsche Macan",
        "variant": "Base 2.0T",
        "year": 2022,
        "mileage": 21000,
        "price": 78.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Sports car DNA in an agile SUV. Features 265 hp turbo petrol, Porsche Doppelkupplung (PDK) 7-speed transmission, PASM, and 20-inch Macan S wheels.",
        "features": "7-Speed PDK Transmission\nPorsche Active Suspension Management (PASM)\nSport Chrono Package with Mode Switch\nBose Surround Sound System\n10.9-inch Full HD Porsche Communication Management",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "porsche-macan-gts-2021",
        "brand": "Porsche",
        "name": "Porsche Macan",
        "variant": "GTS 2.9 V6",
        "year": 2021,
        "mileage": 23000,
        "price": 112.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Top-tier 440 hp twin-turbo performance SUV. Lowered sports air suspension, GTS sports exhaust, Sport Chrono package, and Alcantara interior.",
        "features": "440 hp 2.9L Twin-Turbo V6\nGTS Sports Exhaust System with Black Tailpipes\nAdaptive Sports Air Suspension\nSport Chrono Package\nBose High-End Sound System",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "porsche-cayenne-base-2020",
        "brand": "Porsche",
        "name": "Porsche Cayenne",
        "variant": "Base 3.0 V6",
        "year": 2020,
        "mileage": 36000,
        "price": 96.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Full-size Porsche SUV engineered for driving excitement and long-distance luxury. 340 hp V6 turbo, air suspension, panoramic roof, and soft-close doors.",
        "features": "340 hp 3.0L V6 Turbo\nAdaptive Air Suspension with PASM\nPanoramic Fixed Glass Roof\n14-Way Power Seats with Memory\nMatrix LED Headlights with PDLS Plus",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "porsche-panamera-4-2021",
        "brand": "Porsche",
        "name": "Porsche Panamera",
        "variant": "Panamera 4 2.9 V6",
        "year": 2021,
        "mileage": 26000,
        "price": 128.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Stunning luxury sports saloon combining executive comfort with track-honed precision. All-wheel drive, air suspension, and Sport Chrono package.",
        "features": "Porsche Traction Management (PTM) AWD\nAdaptive Air Suspension\nBose Surround Sound System\nComfort Access & Soft Close\nSport Chrono with Launch Control",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "porsche-taycan-4s-2022",
        "brand": "Porsche",
        "name": "Porsche Taycan",
        "variant": "Taycan 4S Performance Plus",
        "year": 2022,
        "mileage": 14000,
        "price": 135.00,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Electrifying performance with 530 hp overboost, 93.4 kWh Performance Battery Plus, curved 16.8-inch driver display, and 800V charging system.",
        "features": "93.4 kWh Performance Battery Plus\n800-Volt Architecture for Rapid Charging\nPorsche Electric Sport Sound\nCurved 16.8-inch Driver Instrument Cluster\nPorsche Torque Vectoring Plus (PTV Plus)",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "porsche-718-cayman-2020",
        "brand": "Porsche",
        "name": "Porsche 718",
        "variant": "Cayman 2.0T",
        "year": 2020,
        "mileage": 18000,
        "price": 85.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Coupe",
        "condition": "Used",
        "status": "available",
        "description": "Mid-engine sports car perfection. 300 hp turbocharged boxer engine, razor-sharp handling, sports exhaust with dual central tailpipes, and Guards Red finish.",
        "features": "Mid-Engine Boxer Turbocharged Powertrain\nSports Exhaust System\nPDK Dual-Clutch Transmission\nSport Chrono Package\nPASM Sport Suspension",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "porsche-911-carrera-2021",
        "brand": "Porsche",
        "name": "Porsche 911",
        "variant": "Carrera 992",
        "year": 2021,
        "mileage": 12000,
        "price": 165.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Coupe",
        "condition": "Used",
        "status": "available",
        "description": "The quintessential sports car. 385 hp 3.0L twin-turbo flat-six, 8-speed PDK, Sport Chrono package with wet mode, and Bose surround sound.",
        "features": "385 hp 3.0L Twin-Turbo Flat-Six\n8-Speed PDK Transmission\nSport Chrono Package with Wet Mode\nBose Surround Sound System\n20/21-inch Carrera S Wheels",
        "image": "cars/photos/audi.jpg"
    },

    # Land Rover & Range Rover
    {
        "slug": "land-rover-defender-110-hse-2022",
        "brand": "Land Rover",
        "name": "Land Rover Defender",
        "variant": "110 2.0 Petrol HSE",
        "year": 2022,
        "mileage": 27000,
        "price": 92.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Unstoppable modern icon. Features 5-door long-wheelbase body, electronic air suspension, ClearSight ground view camera, and Meridian audio.",
        "features": "Electronic Air Suspension with Adaptive Dynamics\nClearSight Ground View & Rear Camera\nMeridian 3D Surround Sound\nTerrain Response 2 with Configurable Off-Road\nPanoramic Sunroof",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "land-rover-defender-90-se-2023",
        "brand": "Land Rover",
        "name": "Land Rover Defender",
        "variant": "90 3.0 Diesel SE",
        "year": 2023,
        "mileage": 13000,
        "price": 98.50,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Short-wheelbase 3-door Defender with 300 hp 3.0L inline-6 diesel, off-road geometry, air suspension, and rugged Gondwana Stone finish.",
        "features": "300 hp 3.0L Inline-6 Turbo Diesel\n3-Door Short Wheelbase Agility\nElectronic Air Suspension\nTerrain Response 2\nPivi Pro 11.4-inch Touchscreen",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "range-rover-velar-rdynamic-2021",
        "brand": "Land Rover",
        "name": "Range Rover Velar",
        "variant": "2.0 Diesel R-Dynamic S",
        "year": 2021,
        "mileage": 34000,
        "price": 72.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Avant-garde luxury SUV design with flush deployable door handles, dual touchscreen Touch Pro Duo, meridian sound, and sliding panoramic roof.",
        "features": "Flush Deployable Door Handles\nTouch Pro Duo Dual Screens\nSliding Panoramic Roof\nMeridian Sound System\nElectronic Air Suspension",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "range-rover-evoque-se-2022",
        "brand": "Land Rover",
        "name": "Range Rover Evoque",
        "variant": "2.0 Petrol SE",
        "year": 2022,
        "mileage": 22000,
        "price": 61.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Sophisticated compact luxury SUV with coupe-like silhouette, Windsor leather interior, clear-view interior mirror, and all-wheel drive.",
        "features": "Windsor Leather Upholstery\nPanoramic Sunroof\nClearSight Rear-View Mirror\nAll-Wheel Drive with Driveline Disconnect\n3D Surround Camera",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "range-rover-sport-hse-2021",
        "brand": "Land Rover",
        "name": "Range Rover Sport",
        "variant": "3.0 Diesel Dynamic HSE",
        "year": 2021,
        "mileage": 38000,
        "price": 125.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Muscular performance luxury SUV. 300 hp 3.0L twin-turbo diesel, dynamic response air suspension, soft-close doors, and cooled front & rear seats.",
        "features": "Dynamic Response Air Suspension\nMeridian Surround Audio System\nHeated & Cooled Semi-Aniline Leather Seats\nSoft Close Doors\nPixel LED Headlights",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "land-rover-discovery-2020",
        "brand": "Land Rover",
        "name": "Land Rover Discovery",
        "variant": "2.0 Petrol S",
        "year": 2020,
        "mileage": 45000,
        "price": 68.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Full-size 7-seater family expedition SUV with cavernous interior space, 3500 kg towing capacity, air suspension, and dual sunroofs.",
        "features": "Full 7-Seater Configuration\nDual Panoramic Glass Roofs\nElectronic Air Suspension\nTerrain Response System\nPowered Tailgate",
        "image": "cars/photos/download_1.jpg"
    },

    # Jaguar
    {
        "slug": "jaguar-f-pace-rdynamic-2022",
        "brand": "Jaguar",
        "name": "Jaguar F-Pace",
        "variant": "2.0 Diesel R-Dynamic S",
        "year": 2022,
        "mileage": 25000,
        "price": 64.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "British performance SUV with sculpted bonnet, 11.4-inch curved Pivi Pro screen, Meridian sound system, and sports suspension.",
        "features": "11.4-inch Curved Glass Pivi Pro Screen\nMeridian Sound System with Active Noise Cancellation\nPanoramic Fixed Glass Roof\nAll-Surface Progress Control\nAdaptive LED Headlights",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "jaguar-xf-prestige-2020",
        "brand": "Jaguar",
        "name": "Jaguar XF",
        "variant": "2.0 Petrol Prestige",
        "year": 2020,
        "mileage": 39000,
        "price": 42.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Graceful executive saloon with aluminium-intensive architecture, supple ride comfort, rotary gear selector, and Meridian premium sound.",
        "features": "Aluminium-Intensive Monocoque Architecture\nMeridian 380W Sound System\nSunroof\nSoft-Grain Taurus Leather Seats\nBi-Function Xenon Headlamps",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "jaguar-i-pace-hse-2022",
        "brand": "Jaguar",
        "name": "Jaguar I-Pace",
        "variant": "EV400 HSE",
        "year": 2022,
        "mileage": 16000,
        "price": 82.50,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Award-winning all-electric performance SUV with 400 hp dual-motor AWD, 0-100 km/h in 4.8 seconds, air suspension, and Windsor leather.",
        "features": "400 hp Dual Motor Electric AWD\n90 kWh Battery Pack\nAir Suspension with Adaptive Dynamics\nWindsor Leather Performance Seats\nMeridian 3D Sound System",
        "image": "cars/photos/mercedes.jpg"
    },

    # Volvo
    {
        "slug": "volvo-xc40-recharge-ultimate-2023",
        "brand": "Volvo",
        "name": "Volvo XC40 Recharge",
        "variant": "Ultimate Twin Motor AWD",
        "year": 2023,
        "mileage": 12000,
        "price": 51.50,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Scandinavian luxury meets 408 hp dual-motor electric acceleration (0-100 in 4.9s). Google built-in infotainment, Harman Kardon sound, and ADAS.",
        "features": "408 hp Twin Motor All-Wheel Drive\nGoogle Built-In (Maps, Assistant, Play Store)\nHarman Kardon Premium Sound\nPilot Assist Level 2 ADAS\n360-Degree Camera",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "volvo-xc60-b5-inscription-2022",
        "brand": "Volvo",
        "name": "Volvo XC60",
        "variant": "B5 Inscription Mild-Hybrid",
        "year": 2022,
        "mileage": 28000,
        "price": 56.00,
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Serene and safe luxury midsize SUV. Orrefors crystal gear shifter, Nappa leather with front seat ventilation & massage, and Bowers & Wilkins audio.",
        "features": "Orrefors Crystal Glass Gear Selector\nFront Seats with Ventilation & Massage\nBowers & Wilkins High-Fidelity Audio\nPilot Assist with Adaptive Cruise Control\nAir Purifier with PM2.5 Sensor",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "volvo-xc90-b6-inscription-2021",
        "brand": "Volvo",
        "name": "Volvo XC90",
        "variant": "B6 Inscription 7-Seater",
        "year": 2021,
        "mileage": 37000,
        "price": 78.00,
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Flagship 7-seater SUV loaded with world-class safety features, air suspension, four-zone climate control, and Bowers & Wilkins 19-speaker sound.",
        "features": "Full 7-Seater Luxury Cabin\nBowers & Wilkins 19-Speaker Audio System\nFour-Corner Air Suspension\nOrrefors Swedish Crystal Shifter\nIntelliSafe ADAS Safety Suite",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "volvo-s90-d4-inscription-2020",
        "brand": "Volvo",
        "name": "Volvo S90",
        "variant": "D4 Inscription",
        "year": 2020,
        "mileage": 43000,
        "price": 45.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Elegant Scandinavian flagship saloon with class-leading rear legroom, rear sunblinds, Bowers & Wilkins sound system, and pilot assist.",
        "features": "Bowers & Wilkins Sound System\nRear Sunblinds & Rear Controls\nNappa Leather Seats with Ventilation\nAdaptive Cruise Control & Lane Keep\nPanoramic Sunroof",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "volvo-c40-recharge-2023",
        "brand": "Volvo",
        "name": "Volvo C40 Recharge",
        "variant": "Twin Motor Ultimate",
        "year": 2023,
        "mileage": 9000,
        "price": 55.00,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Pure electric crossover coupe with 408 hp, leather-free interior with backlit topographic decor, fixed panoramic glass roof, and pixel LED headlamps.",
        "features": "408 hp Dual Motor Electric Powertrain\nBacklit Topographic Dashboard Decor\nFixed Panoramic Glass Roof\nPixel LED Headlight Technology\nHarman Kardon Audio",
        "image": "cars/photos/audi.jpg"
    },

    # Lexus
    {
        "slug": "lexus-es300h-exquisite-2022",
        "brand": "Lexus",
        "name": "Lexus ES",
        "variant": "ES 300h Exquisite",
        "year": 2022,
        "mileage": 26000,
        "price": 55.50,
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Renowned Japanese craftsmanship and whisper-quiet self-charging hybrid refinement. Impressive 22 km/l fuel economy with zero plug-in required.",
        "features": "Self-Charging 4th Gen Lexus Hybrid\nUltra-Quiet Cabin Insulation\nShimamoku Wood Steering Wheel\nMark Levinson Audio Experience\nSunroof & Power Rear Sunshade",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "lexus-nx350h-fsport-2023",
        "brand": "Lexus",
        "name": "Lexus NX",
        "variant": "NX 350h F-Sport AWD",
        "year": 2023,
        "mileage": 14000,
        "price": 65.00,
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Aggressive F-Sport styling with spindle grille, 14-inch Lexus Interface touchscreen, E-Four electronic all-wheel drive, and adaptive variable suspension.",
        "features": "14-inch High-Definition Lexus Interface\nF-Sport Adaptive Variable Suspension\nE-Four Intelligent AWD\nMark Levinson 17-Speaker Audio\nHead-Up Display with Steering Touch Tracing",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "lexus-rx500h-fsport-2023",
        "brand": "Lexus",
        "name": "Lexus RX",
        "variant": "RX 500h F-Sport Performance",
        "year": 2023,
        "mileage": 11000,
        "price": 105.00,
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "High-performance hybrid SUV packing 371 hp turbo hybrid with DIRECT4 all-wheel drive and Dynamic Rear Steering (DRS) for uncanny handling.",
        "features": "371 hp Turbo Hybrid Powertrain\nDIRECT4 Intelligent AWD\nDynamic Rear Steering\nMark Levinson 21-Speaker Sound\nPanoramic Sunroof & 360 Camera",
        "image": "cars/photos/mercedes.jpg"
    },
    {
        "slug": "lexus-lx500d-2021",
        "brand": "Lexus",
        "name": "Lexus LX",
        "variant": "LX 500d Urban",
        "year": 2021,
        "mileage": 31000,
        "price": 185.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "reserved",
        "description": "The king of all terrains. Twin-turbo 3.3L V6 diesel producing 700 Nm torque, hydraulic height-adjustable suspension, Mark Levinson audio, and bulletproof reliability.",
        "features": "3.3L Twin-Turbo V6 Diesel (700 Nm Torque)\nMulti-Terrain Select with Crawl Control\nActive Height Control (AHC) Suspension\nMark Levinson 25-Speaker Reference Sound\nSoft Close Doors & Power Tailgate",
        "image": "cars/photos/download_1.jpg"
    },

    # Toyota
    {
        "slug": "toyota-fortuner-4x4-at-2022",
        "brand": "Toyota",
        "name": "Toyota Fortuner",
        "variant": "2.8 4x4 AT",
        "year": 2022,
        "mileage": 38000,
        "price": 38.50,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "India's favorite full-size SUV. 204 hp and 500 Nm torque, shift-on-the-fly 4WD with low-range transfer case, ventilated front seats, and JBL sound.",
        "features": "204 hp / 500 Nm 2.8L Turbo Diesel\nShift-on-the-Fly 4x4 with Differential Lock\nVentilated Front Seats\n11-Speaker JBL Audio System\nPowered Tailgate",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "toyota-fortuner-legender-2023",
        "brand": "Toyota",
        "name": "Toyota Fortuner Legender",
        "variant": "2.8 4x4 AT Legender",
        "year": 2023,
        "mileage": 21000,
        "price": 43.50,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Top-spec Legender in Dual Tone White & Black. Catamaran-style bumpers, sequential turn indicators, maroon-black two-tone leather, and wireless phone charger.",
        "features": "Legender Dual Tone Exterior Styling\nSequential LED Turn Indicators\nTwo-Tone Black & Maroon Leather\nWireless Smartphone Charging\nKick-Sensor Powered Tailgate",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "toyota-camry-hybrid-2022",
        "brand": "Toyota",
        "name": "Toyota Camry",
        "variant": "2.5 Hybrid",
        "year": 2022,
        "mileage": 29000,
        "price": 39.00,
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Lounge on wheels. Self-charging hybrid powertrain, electrically reclining rear seats with armrest touchpad, rear sunshades, and 3-zone climate control.",
        "features": "Power Reclining Rear Seats with Armrest Touchpad\n9-Speaker JBL Premium Sound\nHead-Up Display\nVentilated Front Seats with Memory\nSunroof",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "toyota-innova-hycross-zx-2023",
        "brand": "Toyota",
        "name": "Toyota Innova Hycross",
        "variant": "ZX (O) Strong Hybrid",
        "year": 2023,
        "mileage": 17000,
        "price": 30.50,
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "body": "MPV",
        "condition": "Used",
        "status": "available",
        "description": "Range-topping Hycross featuring powered second-row Ottoman captain seats with calf support, panoramic sunroof, Toyota Safety Sense ADAS, and 21 km/l efficiency.",
        "features": "Powered Ottoman Captain Seats with Calf Rest\nPanoramic Sunroof with Ambient Lighting\nToyota Safety Sense (Level 2 ADAS)\n9-Speaker JBL Audio\n360-Degree Camera",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "toyota-innova-crysta-zx-2021",
        "brand": "Toyota",
        "name": "Toyota Innova Crysta",
        "variant": "2.4 ZX 7-Seater",
        "year": 2021,
        "mileage": 48000,
        "price": 24.50,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "MPV",
        "condition": "Used",
        "status": "available",
        "description": "Unrivaled reliability. Rear captain seats, durable 2.4L GD diesel engine, automatic transmission, cruise control, and leather upholstery.",
        "features": "7-Seater Cabin with Middle Captain Seats\nLeather Upholstery with Wood-Grain Accents\nAutomatic Climate Control\nCruise Control\n7 Airbags Safety Package",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "toyota-hilux-high-at-2023",
        "brand": "Toyota",
        "name": "Toyota Hilux",
        "variant": "2.8 4x4 AT High",
        "year": 2023,
        "mileage": 14500,
        "price": 34.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Legendary indestructible lifestyle 4x4 pickup. 204 hp turbo diesel, 700 mm water wading capability, heavy duty suspension, and electronic differential lock.",
        "features": "Heavy-Duty 4x4 with Electronic Differential Lock\n700 mm Water Wading Depth\nLeather Upholstery & Power Driver Seat\nDual-Zone Climate Control\nTouchscreen with Apple CarPlay & Android Auto",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "toyota-vellfire-executive-2021",
        "brand": "Toyota",
        "name": "Toyota Vellfire",
        "variant": "Executive Lounge",
        "year": 2021,
        "mileage": 28000,
        "price": 92.00,
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "body": "MPV",
        "condition": "Used",
        "status": "available",
        "description": "Private jet for the road. First-class heated and ventilated Ottoman captain seats, power sliding doors, dual sunroofs, and 17-speaker JBL audio.",
        "features": "Executive Lounge Ottoman Seats with Heating & Cooling\nTwin Sunroofs\n17-Speaker JBL Audio System\n13-inch Rear Ceiling Entertainment Screen\nElectric Sliding Doors & Tailgate",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "toyota-hyryder-hybrid-v-2023",
        "brand": "Toyota",
        "name": "Toyota Urban Cruiser Hyryder",
        "variant": "Hybrid V",
        "year": 2023,
        "mileage": 16000,
        "price": 18.20,
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Top-variant strong hybrid compact SUV delivering nearly 28 km/l mileage, panoramic sunroof, ventilated front seats, and head-up display.",
        "features": "Strong Hybrid Powertrain with EV Mode\nPanoramic Sunroof\nVentilated Front Seats\nHead-Up Display\n360-Degree Camera",
        "image": "cars/photos/download_1.jpg"
    },

    # Hyundai
    {
        "slug": "hyundai-ioniq-5-2023",
        "brand": "Hyundai",
        "name": "Hyundai Ioniq 5",
        "variant": "Long Range RWD",
        "year": 2023,
        "mileage": 11500,
        "price": 44.50,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "World Car of the Year. Retro-futuristic parametric pixel design, 800V ultra-fast charging, sliding center console, and relaxation zero-gravity seats.",
        "features": "800V Ultra-Fast Architecture (10-80% in 18 mins)\nFront Relaxation Seats with Calf Support\nSliding Universal Island Console\nLevel 2 SmartSense ADAS\nBose 8-Speaker Audio",
        "image": "cars/photos/wallpaper.png"
    },
    {
        "slug": "hyundai-tucson-crdi-signature-2023",
        "brand": "Hyundai",
        "name": "Hyundai Tucson",
        "variant": "2.0 CRDi Signature AWD",
        "year": 2023,
        "mileage": 18000,
        "price": 32.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Premium midsize SUV loaded with HTRAC all-wheel drive, Level 2 ADAS with 19 autonomous safety features, panoramic sunroof, and ventilated memory seats.",
        "features": "HTRAC All-Wheel Drive System\nHyundai SmartSense Level 2 ADAS\nDual 10.25-inch Screens\nPanoramic Sunroof\nBose Premium Sound System",
        "image": "cars/photos/wallpaper.png"
    },
    {
        "slug": "hyundai-creta-sx-o-turbo-2023",
        "brand": "Hyundai",
        "name": "Hyundai Creta",
        "variant": "SX (O) Turbo Petrol DCT",
        "year": 2023,
        "mileage": 19000,
        "price": 18.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Segment leader Creta with punchy 1.4L Turbo GDi engine, 7-speed dual-clutch transmission, panoramic sunroof, ventilated seats, and Bose audio.",
        "features": "1.4L Turbo GDi with 7-Speed DCT\nPanoramic Sunroof\nVentilated Front Seats\nBose 8-Speaker Audio System\nAir Purifier with AQI Display",
        "image": "cars/photos/wallpaper.png"
    },
    {
        "slug": "hyundai-creta-diesel-sx-o-2022",
        "brand": "Hyundai",
        "name": "Hyundai Creta",
        "variant": "1.5 CRDi SX (O) AT",
        "year": 2022,
        "mileage": 32000,
        "price": 17.20,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "High-mileage highway cruiser with smooth 1.5L CRDi diesel automatic, panoramic sunroof, digital driver display, and wireless smartphone charger.",
        "features": "1.5L U2 CRDi Diesel with 6-Speed AT\nPanoramic Sunroof\nVentilated Front Seats\nElectronic Parking Brake with Auto Hold\nTyre Pressure Monitoring System (TPMS)",
        "image": "cars/photos/wallpaper.png"
    },
    {
        "slug": "hyundai-alcazar-signature-2022",
        "brand": "Hyundai",
        "name": "Hyundai Alcazar",
        "variant": "Signature 2.0 AT 6-Seater",
        "year": 2022,
        "mileage": 27000,
        "price": 19.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Three-row 6-seater premium SUV with dedicated second-row captain seats featuring central armrest and wireless charger, panoramic sunroof, and 360 camera.",
        "features": "2nd Row Captain Seats with Center Armrest & Wireless Charger\nPanoramic Sunroof\nBlind View Monitor in Instrument Cluster\nBose 8-Speaker Sound System\nFront Row Seatback Tables with IT Device Holder",
        "image": "cars/photos/wallpaper.png"
    },
    {
        "slug": "hyundai-verna-turbo-sx-o-2023",
        "brand": "Hyundai",
        "name": "Hyundai Verna",
        "variant": "1.5 Turbo DCT SX (O)",
        "year": 2023,
        "mileage": 14000,
        "price": 16.80,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Fast and futuristic fastback sedan delivering 160 hp and 253 Nm torque. Equipped with ADAS Level 2, switchable infotainment/climate control bar, and heated/cooled seats.",
        "features": "160 hp 1.5L Turbo GDi with 7-Speed DCT\nHyundai SmartSense Level 2 ADAS\nDual 10.25-inch Integrated Displays\nHeated and Ventilated Front Seats\nBose 8-Speaker Audio System",
        "image": "cars/photos/wallpaper.png"
    },

    # Kia
    {
        "slug": "kia-ev6-gt-line-awd-2023",
        "brand": "Kia",
        "name": "Kia EV6",
        "variant": "GT-Line AWD",
        "year": 2023,
        "mileage": 10500,
        "price": 58.00,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Electrifying 325 hp dual motor AWD accelerating from 0-100 in 5.2s. 77.4 kWh battery offering 708 km range, Augmented Reality HUD, and Meridian 14-speaker sound.",
        "features": "325 hp / 605 Nm Dual Motor AWD\n77.4 kWh Battery with 708 km ARAI Range\nAugmented Reality Head-Up Display\nMeridian 14-Speaker Surround Sound\nVehicle-to-Load (V2L) Power Outlet",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "kia-carnival-limousine-plus-2022",
        "brand": "Kia",
        "name": "Kia Carnival",
        "variant": "Limousine Plus 7-Seater",
        "year": 2022,
        "mileage": 34000,
        "price": 33.50,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "MPV",
        "condition": "Used",
        "status": "available",
        "description": "First-class family tourer with VIP Lounge captain seats, dual rear touchscreen entertainment system, dual power sunroofs, and smart power sliding doors.",
        "features": "VIP Lounge Reclining Captain Seats with Leg Support\nDual Touchscreen Rear Entertainment\nDual Electric Sunroofs\nSmart Power Sliding Doors & Tailgate\nHarman Kardon 8-Speaker Audio",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "kia-seltos-xline-turbo-2023",
        "brand": "Kia",
        "name": "Kia Seltos",
        "variant": "X-Line 1.5 Turbo DCT",
        "year": 2023,
        "mileage": 13500,
        "price": 19.80,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Exclusive Matte Graphite finish with 160 hp 1.5 Turbo petrol engine, panoramic sunroof, Level 2 ADAS with 17 features, and dual panoramic displays.",
        "features": "Exclusive Matte Graphite Exterior Paint\n160 hp 1.5L Turbo Petrol with 7-DCT\nDual Panoramic Curved Display (10.25-inch each)\nPanoramic Sunroof\nADAS Level 2 Autonomous Safety",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "kia-seltos-gtx-diesel-2022",
        "brand": "Kia",
        "name": "Kia Seltos",
        "variant": "GTX Plus 1.5 Diesel AT",
        "year": 2022,
        "mileage": 36000,
        "price": 18.20,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Sporty GT-Line trim with red accents, ventilated front seats, 8-inch head-up display, Bose 8-speaker audio, and electric sunroof.",
        "features": "GT-Line Sports Interior with Red Stitching\nBose 8-Speaker Premium Sound System\n8.0-inch Smart Head-Up Display\nVentilated Front Seats\n360-Degree Camera with Blind View Monitor",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "kia-carens-luxury-plus-2023",
        "brand": "Kia",
        "name": "Kia Carens",
        "variant": "Luxury Plus 1.4 Turbo DCT",
        "year": 2023,
        "mileage": 22000,
        "price": 17.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "MPV",
        "condition": "Used",
        "status": "available",
        "description": "Versatile 6-seater family recreational vehicle with one-touch electric tumble middle seats, ventilated front seats, Bose sound, and sunroof.",
        "features": "6-Seater with One-Touch Electric Tumble Seats\nVentilated Front Seats\nBose 8-Speaker Premium Audio\nSkyLight Sunroof\nRoof-Mounted AC Vents for 2nd and 3rd Row",
        "image": "cars/photos/download_1.jpg"
    },

    # Tata
    {
        "slug": "tata-safari-dark-accomplished-2023",
        "brand": "Tata",
        "name": "Tata Safari",
        "variant": "Accomplished Plus Dark Edition",
        "year": 2023,
        "mileage": 16000,
        "price": 24.80,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Menacing Dark Edition Safari with Oberon Black exterior, Blackstone interior, 12.3-inch Harman touchscreen, ADAS Level 2, and ventilated seats in first two rows.",
        "features": "Ventilated 1st and 2nd Row Captain Seats\n12.3-inch Cinematic Harman Touchscreen\nADAS Level 2 with Adaptive Cruise Control\nPanoramic Sunroof with Ambient Mood Lighting\n10-Speaker JBL Audio with Subwoofer",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "tata-harrier-fearless-plus-2023",
        "brand": "Tata",
        "name": "Tata Harrier",
        "variant": "Fearless Plus Dark AT",
        "year": 2023,
        "mileage": 18500,
        "price": 23.50,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Land Rover D8 platform-derived powerhouse. Features 170 hp Kryotec diesel, paddle shifters, panoramic sunroof, gesture-controlled powered tailgate, and 7 airbags.",
        "features": "170 hp Kryotec 2.0L Diesel with Paddle Shifters\nGesture-Controlled Powered Tailgate\nVoice-Assisted Panoramic Sunroof\nDual-Zone Fully Automatic Climate Control\n10.25-inch Digital Instrument Cluster",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "tata-nexon-ev-empowered-2024",
        "brand": "Tata",
        "name": "Tata Nexon EV",
        "variant": "Empowered Plus Long Range",
        "year": 2024,
        "mileage": 8000,
        "price": 17.20,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "India's bestselling EV in facelift guise. 40.5 kWh battery offering 465 km range, full-width LED lightbars, 12.3-inch touchscreen, and V2V/V2L charging.",
        "features": "40.5 kWh Battery Pack (465 km Range)\n12.3-inch Cinematic Touchscreen\nVehicle-to-Vehicle (V2V) & V2L Charging Capability\nVentilated Front Seats\nElectronic Parking Brake with Auto Hold",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "tata-punch-ev-empowered-2024",
        "brand": "Tata",
        "name": "Tata Punch EV",
        "variant": "Empowered Plus Long Range 7.2kW",
        "year": 2024,
        "mileage": 6500,
        "price": 14.50,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Built on pure EV acti.ev platform. 35 kWh battery delivering 421 km range, 360 camera, ventilated seats, frunk storage, and 7.2 kW fast home charger.",
        "features": "acti.ev Pure Electric Architecture\n360-Degree Camera with Blind Spot View\nFront Seat Ventilation\nFront Frunk Storage Compartment\nElectronic Parking Brake",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "tata-tiago-ev-xz-plus-2023",
        "brand": "Tata",
        "name": "Tata Tiago EV",
        "variant": "XZ Plus Tech LUX Long Range",
        "year": 2023,
        "mileage": 14000,
        "price": 11.20,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "Hatchback",
        "condition": "Used",
        "status": "available",
        "description": "Ultra-practical city commuter with 24 kWh battery, 315 km ARAI range, cruise control, multi-mode regenerative braking, and push-button start.",
        "features": "24 kWh Battery (315 km Range)\nMulti-Mode Regenerative Braking with Paddle Selectors\nAutomatic Climate Control\nPush Button Start/Stop\nHarman 8-Speaker Audio",
        "image": "cars/photos/download_1.jpg"
    },

    # Mahindra
    {
        "slug": "mahindra-xuv700-ax7l-awd-2023",
        "brand": "Mahindra",
        "name": "Mahindra XUV700",
        "variant": "AX7 Luxury AWD Diesel AT",
        "year": 2023,
        "mileage": 22000,
        "price": 24.50,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Flagship 7-seater with all-wheel drive, 185 hp mHawk diesel, panoramic skyroof, Level 2 ADAS, Sony 3D 12-speaker sound, and motorized flush door handles.",
        "features": "Intelligent All-Wheel Drive (AWD)\nADAS Level 2 Driving Assistance\nSony 3D 12-Speaker Immersive Audio with Roof Speakers\nPanoramic Skyroof\nSmart Flush Door Handles",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "mahindra-xuv700-ax7l-petrol-2022",
        "brand": "Mahindra",
        "name": "Mahindra XUV700",
        "variant": "AX7 Luxury Petrol AT",
        "year": 2022,
        "mileage": 25000,
        "price": 22.80,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Blistering 200 hp 2.0L mStallion turbo petrol engine, dual 10.25-inch superscreen cockpit, 360 camera with continuous blind-view monitoring, and ventilated seats.",
        "features": "200 hp / 380 Nm 2.0L mStallion Turbo Petrol\nDual 10.25-inch Integrated Displays\nBlind View Monitor with 360-Degree Camera\nWireless Apple CarPlay & Android Auto\nElectronic Parking Brake with Auto Hold",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "mahindra-scorpio-n-z8l-4x4-2023",
        "brand": "Mahindra",
        "name": "Mahindra Scorpio-N",
        "variant": "Z8L 4x4 Diesel AT",
        "year": 2023,
        "mileage": 19000,
        "price": 23.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "The Big Daddy of SUVs. Shift-on-the-fly 4XPLOR terrain response with mechanical and brake locking differentials, Sony 12-speaker audio, and sunroof.",
        "features": "4XPLOR Intelligent Terrain Management (Mud, Sand, Grass, Snow)\nMechanical Locking Rear Differential\nSony 12-Speaker 3D Audio\nSunroof\nPowered Driver Seat",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "mahindra-thar-lx-4x4-at-2023",
        "brand": "Mahindra",
        "name": "Mahindra Thar",
        "variant": "LX 4x4 Hard Top Diesel AT",
        "year": 2023,
        "mileage": 21000,
        "price": 16.50,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "India's off-road champion with factory hard top, 130 hp mHawk diesel, manual shift 4x4 low range transfer case, washable interior, and 18-inch alloy wheels.",
        "features": "Shift-on-the-Fly 4x4 with Low Range Transfer Case\nFactory Molded Hard Top\nRoll Cage with 4-Star Global NCAP Rating\nWater-Resistant Dashboard Controls\nTyre Direction Indicator",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "mahindra-thar-earth-edition-2024",
        "brand": "Mahindra",
        "name": "Mahindra Thar",
        "variant": "Earth Edition 4x4 Petrol AT",
        "year": 2024,
        "mileage": 5500,
        "price": 17.20,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Special Earth Edition in Desert Fury satin matte finish with dune-inspired beige leatherette seats, dark chrome badges, and 150 hp mStallion turbo petrol.",
        "features": "Exclusive Desert Fury Satin Matte Finish\nDune-Inspired Themed Upholstery\n150 hp mStallion Turbo Petrol Powertrain\nElectronic Brake Locking Differential\nAdventure Statistics Screen",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "mahindra-xuv400-el-pro-2024",
        "brand": "Mahindra",
        "name": "Mahindra XUV400",
        "variant": "EL Pro 39.4 kWh",
        "year": 2024,
        "mileage": 7000,
        "price": 16.90,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Quick electric SUV doing 0-100 in 8.3s with 39.4 kWh battery, dual 10.25-inch digital screens, dual-zone climate control, and copper styling elements.",
        "features": "39.4 kWh Battery Pack (456 km Range)\nDual 10.25-inch Digital Displays\nDual-Zone Automatic Climate Control\nElectric Sunroof\nCopper-Accented Exterior Trim",
        "image": "cars/photos/download_1.jpg"
    },

    # Volkswagen
    {
        "slug": "volkswagen-tiguan-elegance-2023",
        "brand": "Volkswagen",
        "name": "Volkswagen Tiguan",
        "variant": "2.0 TSI Elegance 4MOTION",
        "year": 2023,
        "mileage": 17000,
        "price": 33.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Pure German engineering. 190 hp 2.0L TSI turbo petrol with 4MOTION all-wheel drive, IQ.Light matrix LED headlights, panoramic sunroof, and Vienna leather seats.",
        "features": "4MOTION Intelligent All-Wheel Drive\nIQ.Light Matrix LED Headlights\nPanoramic Sunroof with Ambient Lighting\nVienna Leather Seats with Driver Memory\nDigital Cockpit Pro",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "volkswagen-taigun-gt-plus-2023",
        "brand": "Volkswagen",
        "name": "Volkswagen Taigun",
        "variant": "GT Plus 1.5 TSI DSG",
        "year": 2023,
        "mileage": 18000,
        "price": 18.20,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "5-star Global NCAP safety rating. Enthusiast-favorite 150 hp 1.5L TSI with Active Cylinder Technology, 7-speed DSG dual-clutch, and ventilated seats.",
        "features": "150 hp 1.5L TSI with Active Cylinder Deactivation\n7-Speed DSG Dual-Clutch Transmission\nVentilated Front Seats\n10-inch VW Play Touchscreen with Wireless CarPlay\nElectric Sunroof",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "volkswagen-virtus-gt-plus-2023",
        "brand": "Volkswagen",
        "name": "Volkswagen Virtus",
        "variant": "GT Plus 1.5 TSI DSG",
        "year": 2023,
        "mileage": 15000,
        "price": 17.80,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Exciting performance sedan in Wild Cherry Red with red brake calipers, GT badging, 521-liter boot, digital cockpit, and class-leading high-speed stability.",
        "features": "150 hp 1.5L TSI EVO Engine\nRed Ambient Lighting & Red Brake Calipers\n521-Litre Trunk Capacity\nElectric Sunroof\n5-Star Global NCAP Crash Safety",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "volkswagen-polo-gt-tsi-2021",
        "brand": "Volkswagen",
        "name": "Volkswagen Polo",
        "variant": "GT TSI 1.0 AT",
        "year": 2021,
        "mileage": 29000,
        "price": 9.80,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Hatchback",
        "condition": "Used",
        "status": "available",
        "description": "Cult classic hot hatchback. 110 hp 1.0L TSI turbo petrol, black rear spoiler, cruise control, leather-wrapped flat-bottom steering, and rock-solid build.",
        "features": "110 hp 1.0L Turbocharged TSI Engine\nFlat-Bottom Steering Wheel with Cruise Control\nBlack Roof and Rear Spoiler\nTouchscreen Infotainment with Apple CarPlay\nAuto Rain-Sensing Wipers",
        "image": "cars/photos/audi.jpg"
    },

    # Skoda
    {
        "slug": "skoda-superb-lk-2022",
        "brand": "Skoda",
        "name": "Skoda Superb",
        "variant": "Laurin & Klement 2.0 TSI",
        "year": 2022,
        "mileage": 26000,
        "price": 34.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Presidential legroom and unmatched ride quality. 190 hp 2.0L TSI, 11-speaker Canton sound system, ventilated front seats with massage, and panoramic sunroof.",
        "features": "Canton 11-Speaker 610W Premium Audio System\nFront Seats with Ventilation & Driver Massage\nPanoramic Sunroof\nVirtual Cockpit Instrument Cluster\nBoss Button Rear Seat Adjustment",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "skoda-kodiaq-lk-2023",
        "brand": "Skoda",
        "name": "Skoda Kodiaq",
        "variant": "Laurin & Klement 2.0 TSI 4x4",
        "year": 2023,
        "mileage": 19000,
        "price": 39.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "7-seater luxury European SUV equipped with Dynamic Chassis Control (DCC), 4x4 all-wheel drive, Canton sound system, and panoramic sunroof.",
        "features": "Dynamic Chassis Control (DCC) Adaptive Dampers\nIntelligent 4x4 All-Wheel Drive\nCanton 12-Speaker Sound System\nPanoramic Sunroof\n360-Degree Area View Camera",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "skoda-octavia-tsi-style-2021",
        "brand": "Skoda",
        "name": "Skoda Octavia",
        "variant": "2.0 TSI Style",
        "year": 2021,
        "mileage": 32000,
        "price": 26.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Executive notchback saloon with shift-by-wire gear selector, 600-liter electric tailgate boot, bi-LED headlamps, and 190 hp turbo petrol power.",
        "features": "190 hp 2.0L TSI with Shift-By-Wire 7-DSG\n600-Litre Electric Liftback Boot\nVirtual Cockpit Digital Display\nTwo-Zone Climatronic AC\nPush Button Start/Stop",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "skoda-slavia-style-15-2023",
        "brand": "Skoda",
        "name": "Skoda Slavia",
        "variant": "Style 1.5 TSI DSG",
        "year": 2023,
        "mileage": 16500,
        "price": 17.20,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Elegance meets thrilling performance. 150 hp 1.5L TSI with cylinder deactivation, ventilated front seats, electric sunroof, and 5-star adult crash safety.",
        "features": "150 hp 1.5L TSI Engine with ACT\nVentilated Front Seats\nElectric Sunroof\nSubwoofer Audio System\n5-Star Global NCAP Safety Rating",
        "image": "cars/photos/audi.jpg"
    },
    {
        "slug": "skoda-kushaq-monte-carlo-2023",
        "brand": "Skoda",
        "name": "Skoda Kushaq",
        "variant": "Monte Carlo 1.5 TSI DSG",
        "year": 2023,
        "mileage": 17500,
        "price": 18.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Motorsport-inspired Monte Carlo edition with gloss black grille, red interior cabin trim, dual-tone leatherette seats, and electric sunroof.",
        "features": "Monte Carlo Black Styling Package\nRed Ambient Cabin Lighting\nVentilated Front Seats\nElectric Sunroof\nSubwoofer Sound System",
        "image": "cars/photos/audi.jpg"
    },

    # Mini
    {
        "slug": "mini-cooper-s-3door-2022",
        "brand": "Mini",
        "name": "Mini Cooper S",
        "variant": "3-Door Hatch 2.0T",
        "year": 2022,
        "mileage": 15000,
        "price": 38.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Hatchback",
        "condition": "Used",
        "status": "available",
        "description": "Go-kart handling legend. 192 hp 2.0L TwinPower Turbo petrol, central twin exhaust pipes, Union Jack LED taillights, and panoramic sunroof.",
        "features": "192 hp 2.0L TwinPower Turbocharged Petrol\nGo-Kart Drive Modes (Sport, Mid, Green)\nUnion Jack Design LED Taillights\nHarman Kardon Hi-Fi Sound System\nPanoramic Dual Glass Sunroof",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "mini-countryman-jcw-2023",
        "brand": "Mini",
        "name": "Mini Countryman",
        "variant": "Cooper S JCW Inspired",
        "year": 2023,
        "mileage": 14000,
        "price": 44.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Hatchback",
        "condition": "Used",
        "status": "available",
        "description": "The practical Mini with family space. John Cooper Works aerodynamic kit, picnic bench fold-out boot seat, Harman Kardon audio, and head-up display.",
        "features": "JCW Aerodynamic Kit & Sports Seats\nPicnic Bench Fold-Out Cushion in Boot\nHarman Kardon Audio System\nMini Head-Up Display\nPanoramic Sunroof",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "mini-cooper-se-electric-2023",
        "brand": "Mini",
        "name": "Mini Cooper SE",
        "variant": "Electric 3-Door",
        "year": 2023,
        "mileage": 8500,
        "price": 49.50,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "Hatchback",
        "condition": "Used",
        "status": "available",
        "description": "Zero-emissions urban fun. 184 hp electric motor with instant torque, aerodynamic asymmetric wheels, yellow Energetic accents, and Harman Kardon audio.",
        "features": "184 hp Electric Powertrain with Instant Torque\nUnique 17-inch Power Spoke Alloy Wheels\nHarman Kardon Surround Sound\nPanoramic Sunroof\nDigital Cockpit with EV Power Meter",
        "image": "cars/photos/bmw.jpg"
    },

    # Jeep
    {
        "slug": "jeep-grand-cherokee-limited-2023",
        "brand": "Jeep",
        "name": "Jeep Grand Cherokee",
        "variant": "Limited (O) 4x4",
        "year": 2023,
        "mileage": 15000,
        "price": 76.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "American luxury flagship with legendary Quadra-Trac I 4x4, Selec-Terrain drive modes, 10.1-inch Uconnect touchscreen, and Capri leather upholstery.",
        "features": "Quadra-Trac I 4x4 with Selec-Terrain Management\n10.1-inch Uconnect Infotainment with Navigation\nDual-Pane Panoramic Sunroof\nCapri Leather Seats with Ventilation\nLevel 2 ADAS Safety Suite",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "jeep-compass-model-s-2022",
        "brand": "Jeep",
        "name": "Jeep Compass",
        "variant": "Model S 2.0 Diesel 4x4 AT",
        "year": 2022,
        "mileage": 31000,
        "price": 29.50,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Top-tier Compass with 4x4 Jeep Active Drive, Selec-Terrain, 360-degree camera, wireless charger, dual-pane panoramic sunroof, and ventilated front seats.",
        "features": "Jeep Active Drive 4x4 with Selec-Terrain\nDual-Pane Panoramic Sunroof\nVentilated Front Seats with Memory\n360-Degree Surround View Camera\nAlpine 9-Speaker Audio System",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "jeep-wrangler-rubicon-2022",
        "brand": "Jeep",
        "name": "Jeep Wrangler",
        "variant": "Rubicon 2.0 Turbo 4x4",
        "year": 2022,
        "mileage": 18000,
        "price": 65.00,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "The ultimate trail-rated off-roader. Rock-Trac 4x4 with 4:1 low gear ratio, front and rear Tru-Lok locking differentials, electronic sway bar disconnect, and removable roof/doors.",
        "features": "Rock-Trac Heavy Duty 4x4 System\nTru-Lok Front and Rear Locking Differentials\nElectronic Front Sway Bar Disconnect\nRemovable 3-Piece Freedom Top & Doors\nDana 44 Heavy Duty Solid Axles",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "jeep-meridian-limited-4x4-2023",
        "brand": "Jeep",
        "name": "Jeep Meridian",
        "variant": "Limited (O) 4x4 AT 7-Seater",
        "year": 2023,
        "mileage": 21000,
        "price": 36.50,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Three-row 7-seater luxury SUV engineered on Jeep DNA. Features 4x4 all-wheel drive, dual-pane sunroof, brown leather interior, and 360 camera.",
        "features": "7-Seater Cabin with Reclining Rows\nJeep 4x4 Selec-Terrain System\nDual-Pane Panoramic Sunroof\nAlpine 9-Speaker Audio\n360-Degree Surround Camera",
        "image": "cars/photos/download_1.jpg"
    },

    # MG
    {
        "slug": "mg-gloster-savvy-4x4-2022",
        "brand": "MG",
        "name": "MG Gloster",
        "variant": "Savvy 4x4 6-Seater",
        "year": 2022,
        "mileage": 31000,
        "price": 37.00,
        "fuel": "Diesel",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Full-size flagship SUV with twin-turbo 2.0L diesel (215 hp / 480 Nm), Level 1 ADAS with autonomous emergency braking, captain seats with massage, and panoramic sunroof.",
        "features": "Twin-Turbo 2.0L Diesel (215 hp / 480 Nm)\nDriver Seat with Massage, Ventilation & Heating\nLevel 1 ADAS Safety Package\nPanoramic Dual-Pane Sunroof\nIntelligent 4WD with BorgWarner Transfer Case",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "mg-zs-ev-exclusive-pro-2023",
        "brand": "MG",
        "name": "MG ZS EV",
        "variant": "Exclusive Pro 50.3 kWh",
        "year": 2023,
        "mileage": 14000,
        "price": 23.50,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "High-tech electric SUV with 50.3 kWh battery, 461 km certified range, Level 2 ADAS, panoramic skyroof, and 360-degree camera.",
        "features": "50.3 kWh Prismatic Battery (461 km Range)\nLevel 2 ADAS (Traffic Jam Assist, Lane Keep)\nDual-Pane Panoramic Skyroof\n360-Degree Camera with Transparent Chassis\ni-SMART Connected Car Tech with 75+ Features",
        "image": "cars/photos/wallpaper.png"
    },
    {
        "slug": "mg-hector-plus-sharp-pro-2023",
        "brand": "MG",
        "name": "MG Hector Plus",
        "variant": "Sharp Pro 2.0 Diesel 6-Seater",
        "year": 2023,
        "mileage": 22000,
        "price": 21.00,
        "fuel": "Diesel",
        "transmission": "Manual",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Massive 14-inch HD portrait touchscreen, voice-enabled panoramic sunroof, ventilated front seats, powered tailgate, and infinity sound system.",
        "features": "14-inch HD Portrait Touchscreen\nVoice-Operated Dual-Pane Panoramic Sunroof\nVentilated Front Seats\nInfinity by Harman 8-Speaker Audio\nSmart Powered Tailgate",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "mg-comet-ev-plush-2024",
        "brand": "MG",
        "name": "MG Comet EV",
        "variant": "Plush Top Model",
        "year": 2024,
        "mileage": 4500,
        "price": 8.50,
        "fuel": "Electric",
        "transmission": "Automatic",
        "body": "Hatchback",
        "condition": "Used",
        "status": "available",
        "description": "Trendy ultra-compact city electric car. 17.3 kWh battery with 230 km range, dual 10.25-inch floating screens, wireless smartphone connectivity, and tight turning radius.",
        "features": "17.3 kWh Battery (230 km Range)\nDual 10.25-inch Floating Screen Cockpit\nKeyless Smart Entry with Walk-Away Lock\nWireless Apple CarPlay & Android Auto\nCompact 4.2m Turning Radius",
        "image": "cars/photos/wallpaper.png"
    },

    # Honda
    {
        "slug": "honda-city-ehev-zx-2023",
        "brand": "Honda",
        "name": "Honda City",
        "variant": "1.5 ZX e:HEV Hybrid",
        "year": 2023,
        "mileage": 16000,
        "price": 18.50,
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Self-charging strong hybrid executive sedan delivering 27.13 km/l. Equipped with Honda Sensing ADAS, electric parking brake, sunroof, and lane watch camera.",
        "features": "e:HEV Twin Motor Strong Hybrid (27+ km/l)\nHonda Sensing Level 2 ADAS\nElectric Parking Brake with Auto Hold\nHonda LaneWatch Blind Spot Camera\nElectric Sunroof",
        "image": "cars/photos/bmw.jpg"
    },
    {
        "slug": "honda-elevate-zx-cvt-2024",
        "brand": "Honda",
        "name": "Honda Elevate",
        "variant": "ZX 1.5 CVT",
        "year": 2024,
        "mileage": 7500,
        "price": 15.80,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Robust midsize SUV with class-leading 220 mm ground clearance, 458-liter boot, Honda Sensing ADAS, 10.25-inch touchscreen, and tan leatherette upholstery.",
        "features": "220 mm High Ground Clearance\nHonda Sensing ADAS with Collision Mitigation\n10.25-inch HD Touchscreen with Wireless CarPlay\nElectric Sunroof\nHonda LaneWatch Camera",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "honda-civic-zx-petrol-2020",
        "brand": "Honda",
        "name": "Honda Civic",
        "variant": "1.8 i-VTEC ZX CVT",
        "year": 2020,
        "mileage": 36000,
        "price": 17.50,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "Sedan",
        "condition": "Used",
        "status": "available",
        "description": "Low-slung aggressive fastback styling with 1.8L i-VTEC engine, full LED headlights, sunroof, digital instrument cluster, and Honda LaneWatch.",
        "features": "Fastback Aerodynamic Styling\nFull LED Headlights with DRLs\nElectric Sunroof\nLaneWatch Blind Spot Monitoring\n8-Way Power Adjustable Driver Seat",
        "image": "cars/photos/bmw.jpg"
    },

    # Maruti Suzuki (Nexa)
    {
        "slug": "maruti-grand-vitara-hybrid-alpha-2023",
        "brand": "Maruti Suzuki",
        "name": "Maruti Suzuki Grand Vitara",
        "variant": "Alpha Plus Strong Hybrid",
        "year": 2023,
        "mileage": 18000,
        "price": 18.90,
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Flagship Nexa strong hybrid SUV delivering 27.97 km/l fuel economy, panoramic sunroof, ventilated front seats, head-up display, and 360 camera.",
        "features": "Intelligent Electric Strong Hybrid Powertrain\nDouble Sliding Panoramic Sunroof\nVentilated Front Seats\nHead-Up Display (HUD)\n360-Degree View Camera",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "maruti-invicto-alpha-plus-2023",
        "brand": "Maruti Suzuki",
        "name": "Maruti Suzuki Invicto",
        "variant": "Alpha Plus 7-Seater Strong Hybrid",
        "year": 2023,
        "mileage": 14000,
        "price": 27.50,
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "body": "MPV",
        "condition": "Used",
        "status": "available",
        "description": "Premium 7-seater MPV with 2.0L hybrid engine (21.19 km/l), panoramic sunroof, captain seats, powered tailgate, and electronic parking brake.",
        "features": "2.0L Strong Hybrid Powertrain with e-CVT\nPanoramic Sunroof with Ambient Lighting\nVentilated Front Seats with Driver Memory\nPowered Tailgate\nElectronic Parking Brake with Auto Hold",
        "image": "cars/photos/download_1.jpg"
    },
    {
        "slug": "maruti-jimny-alpha-at-2023",
        "brand": "Maruti Suzuki",
        "name": "Maruti Suzuki Jimny",
        "variant": "Alpha 4x4 AT",
        "year": 2023,
        "mileage": 12000,
        "price": 14.20,
        "fuel": "Petrol",
        "transmission": "Automatic",
        "body": "SUV",
        "condition": "Used",
        "status": "available",
        "description": "Authentic lightweight 5-door off-roader with ladder-frame chassis, ALLGRIP PRO 4WD with low range, rigid solid axles, and Kinetic Yellow finish.",
        "features": "ALLGRIP PRO 4WD with Low Range Transfer Gear\nLadder Frame Chassis with 3-Link Rigid Axle Suspension\nBrake Limited Slip Differential (LSD)\n9-inch SmartPlay Pro Plus Touchscreen\nLED Headlamps with Washers",
        "image": "cars/photos/download_1.jpg"
    },
]


ENQUIRY_TEMPLATES = [
    ("Exchange: Trade-in 2018 Honda City for {car}", "Looking to trade in my well-maintained single-owner 2018 Honda City ZX. Could you please share the exchange evaluation process and estimated difference amount for the {car}?"),
    ("Financing & EMI Options for {car}", "Interested in purchasing the {car}. Could you send the detailed loan breakup, interest rates from partner banks, and minimum down payment requirements?"),
    ("Corporate Lease Inquiry for {car}", "Our organization is exploring a corporate lease program for senior management. Please share quotation and documentation requirements for {car}."),
    ("In-Person Inspection & Detailed History for {car}", "I would like to schedule an in-person physical inspection of {car} with my mechanic this weekend. Please confirm availability and service history records."),
    ("Sell / Consignment: Exploring valuation against {car}", "I currently own a 2021 vehicle and want to explore either direct sale to your showroom or an upgrade to {car}. Please get in touch."),
    ("Warranty & Extended Coverage for {car}", "Does the {car} come with active manufacturer warranty or certified showroom warranty? What components are covered and can it be extended for 2 years?"),
    ("Outstation Delivery & Registration for {car}", "I reside in a neighboring state and want to know if you handle NOC, interstate transport, and re-registration assistance for {car}."),
    ("Availability & Final On-Road Pricing for {car}", "Is the {car} still available for immediate handover? Please share the all-inclusive on-road price including transfer charges and taxes.")
]

CUSTOMER_NAMES = [
    ("Aarav Sharma", "+919811223344", "aarav.sharma@example.com"),
    ("Priya Patel", "+919822334455", "priya.patel@example.com"),
    ("Rohan Mehta", "+919833445566", "rohan.mehta@example.com"),
    ("Vikram Singh", "+919844556677", "vikram.singh@example.com"),
    ("Ananya Deshmukh", "+919855667788", "ananya.deshmukh@example.com"),
    ("Kabir Malhotra", "+919866778899", "kabir.malhotra@example.com"),
    ("Sneha Reddy", "+919877889900", "sneha.reddy@example.com"),
    ("Amit Verma", "+919888990011", "amit.verma@example.com"),
    ("Divya Nair", "+919899001122", "divya.nair@example.com"),
    ("Siddharth Kapoor", "+919700112233", "siddharth.kapoor@example.com"),
    ("Neha Joshi", "+919711223344", "neha.joshi@example.com"),
    ("Tariq Khan", "+919722334455", "tariq.khan@example.com"),
    ("Sunita Pillai", "+919733445566", "sunita.pillai@example.com"),
    ("Karan Oberoi", "+919744556677", "karan.oberoi@example.com"),
    ("Meera Kulkarni", "+919755667788", "meera.kulkarni@example.com"),
    ("Aditya Chawla", "+919766778899", "aditya.chawla@example.com"),
    ("Pooja Hegde", "+919777889900", "pooja.hegde@example.com"),
    ("Gautam Gambhir", "+919788990011", "gautam.gambhir@example.com"),
    ("Isha Roy", "+919799001122", "isha.roy@example.com"),
    ("Manish Tiwari", "+919600112233", "manish.tiwari@example.com"),
    ("Ritu Sen", "+919611223344", "ritu.sen@example.com"),
    ("Rajesh Bansal", "+919622334455", "rajesh.bansal@example.com"),
    ("Sangeeta Rao", "+919633445566", "sangeeta.rao@example.com"),
    ("Naveen Chandra", "+919644556677", "naveen.chandra@example.com"),
    ("Bhavna Gupta", "+919655667788", "bhavna.gupta@example.com"),
]


class Command(BaseCommand):
    help = "Seed nearly 100 realistic cars, test drive slots, enquiries, and test drive bookings."

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=14, help='Number of days of test drive slots to generate')
        parser.add_argument('--enquiries', type=int, default=75, help='Number of enquiries to seed')
        parser.add_argument('--bookings', type=int, default=75, help='Number of test drive bookings to seed')

    def handle(self, *args, **options):
        self.stdout.write("--- Starting Showroom Stability Data Seeding ---")

        # 1. Seed Cars
        cars_created = 0
        images_created = 0

        for car_data in CAR_CATALOG:
            slug = car_data["slug"]
            image_path = car_data.get("image", "cars/photos/audi.jpg")

            car, created = Car.objects.get_or_create(
                slug=slug,
                defaults=dict(
                    brand=car_data["brand"],
                    name=car_data["name"],
                    variant=car_data.get("variant", ""),
                    year=car_data["year"],
                    mileage=car_data["mileage"],
                    price=car_data["price"],
                    fuel=car_data["fuel"],
                    transmission=car_data["transmission"],
                    body=car_data["body"],
                    condition=car_data["condition"],
                    status=car_data["status"],
                    description=car_data["description"],
                    features=car_data["features"],
                    is_sample=False,
                )
            )

            if created:
                cars_created += 1
                # Attach primary photo
                CarImage.objects.create(
                    car=car,
                    image=image_path,
                    caption=f"{car.name} - Front Angle",
                    position=0
                )
                images_created += 1

                # Attach secondary photo if available
                secondary_image = "cars/photos/wallpaper.png" if "Electric" in car.fuel else "cars/photos/download_1.jpg"
                CarImage.objects.create(
                    car=car,
                    image=secondary_image,
                    caption=f"{car.name} - Interior & Cockpit",
                    position=1
                )
                images_created += 1

        total_cars = Car.objects.count()
        self.stdout.write(self.style.SUCCESS(f"[1/4] Cars ready: {total_cars} total ({cars_created} newly created, {images_created} images linked)."))

        # 2. Seed Test Drive Slots for all available cars
        days = options['days']
        available_cars = Car.objects.filter(status='available')
        slots_created = 0

        now_local = timezone.localdate()
        for car in available_cars:
            for day_offset in range(1, days + 1):
                slot_date = now_local + timedelta(days=day_offset)
                for hour in [10, 11, 12, 14, 15, 16, 17]:
                    starts_at = timezone.make_aware(datetime.combine(slot_date, time(hour)))
                    _, created = TestDriveSlot.objects.get_or_create(
                        car=car,
                        starts_at=starts_at,
                        defaults={'blocked': False}
                    )
                    if created:
                        slots_created += 1

        total_slots = TestDriveSlot.objects.count()
        self.stdout.write(self.style.SUCCESS(f"[2/4] Test drive slots ready: {total_slots} total ({slots_created} newly created for {available_cars.count()} available cars)."))

        # 3. Seed Enquiries
        target_enquiries = options['enquiries']
        enquiries_created = 0
        current_enquiries = Enquiry.objects.count()

        if current_enquiries < target_enquiries:
            num_to_create = target_enquiries - current_enquiries
            statuses = ['new', 'new', 'contacted', 'contacted', 'closed']
            all_cars = list(Car.objects.all())

            for i in range(num_to_create):
                name, phone, email = CUSTOMER_NAMES[i % len(CUSTOMER_NAMES)]
                # Add index variation to avoid exact duplicate identities
                var_email = email.replace('@', f'+eq{i+1}@')
                var_phone = f"+9198{i:04d}{random.randint(1000, 9999)}"[:14]

                car = random.choice(all_cars)
                title_template, msg_template = random.choice(ENQUIRY_TEMPLATES)
                interest = title_template.format(car=car.name)[:180]
                message = msg_template.format(car=f"{car.year} {car.name} {car.variant}".strip())
                status = random.choice(statuses)

                notes = ""
                if status == 'contacted':
                    notes = f"Spoke with customer on {now_local}. Sent vehicle inspection report and financing details via email."
                elif status == 'closed':
                    notes = f"Customer closed discussion. Scheduled showroom visit for test drive on upcoming weekend."

                Enquiry.objects.create(
                    name=name,
                    phone=var_phone,
                    email=var_email,
                    interest=interest,
                    date=now_local + timedelta(days=random.randint(1, 10)),
                    message=message,
                    status=status,
                    notes=notes
                )
                enquiries_created += 1

        total_enquiries = Enquiry.objects.count()
        self.stdout.write(self.style.SUCCESS(f"[3/4] Enquiries ready: {total_enquiries} total ({enquiries_created} newly created)."))

        # 4. Seed Test Drive Bookings
        target_bookings = options['bookings']
        bookings_created = 0
        current_bookings = Booking.objects.count()

        if current_bookings < target_bookings:
            num_bookings_to_create = target_bookings - current_bookings

            # Find upcoming available slots that don't already have an active booking
            active_booked_slot_ids = set(
                Booking.objects.filter(status__in=['pending', 'confirmed']).values_list('slot_id', flat=True)
            )

            available_slots = list(
                TestDriveSlot.objects.filter(
                    starts_at__gt=timezone.now(),
                    blocked=False,
                    car__status='available'
                ).exclude(id__in=active_booked_slot_ids).select_related('car')[:num_bookings_to_create * 2]
            )

            random.shuffle(available_slots)

            booking_statuses = ['pending', 'pending', 'confirmed', 'confirmed', 'cancelled']
            users = list(get_user_model().objects.filter(is_staff=False))

            for i in range(min(num_bookings_to_create, len(available_slots))):
                slot = available_slots[i]
                name, phone, email = CUSTOMER_NAMES[i % len(CUSTOMER_NAMES)]
                var_email = email.replace('@', f'+drive{i+1}@')
                var_phone = f"+9199{i:04d}{random.randint(1000, 9999)}"[:14]

                status = random.choice(booking_statuses)
                customer_user = random.choice(users) if users and random.random() > 0.5 else None

                Booking.objects.create(
                    slot=slot,
                    name=name,
                    email=var_email,
                    phone=var_phone,
                    status=status,
                    customer=customer_user,
                    email_verified_at=timezone.now() if status in ['confirmed', 'pending'] else None
                )
                bookings_created += 1

        total_bookings = Booking.objects.count()
        self.stdout.write(self.style.SUCCESS(f"[4/4] Test drive bookings ready: {total_bookings} total ({bookings_created} newly created)."))

        self.stdout.write(self.style.SUCCESS(
            f"\n=== BACKEND SEEDING COMPLETE ===\n"
            f"Total Cars:      {Car.objects.count()}\n"
            f"Total Slots:     {TestDriveSlot.objects.count()}\n"
            f"Total Enquiries: {Enquiry.objects.count()}\n"
            f"Total Bookings:  {Booking.objects.count()}\n"
        ))
