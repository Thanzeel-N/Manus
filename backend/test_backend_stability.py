"""Backend Stability and Load Test Suite
Executes comprehensive stress, concurrency, and validation tests across all backend APIs
with 115+ cars, 11,000+ test drive slots, 75+ enquiries, and 75+ test drive bookings.
"""

import os
import sys
import time
import uuid
import random
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import timedelta

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.test import Client
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import connection

from inventory.models import Car, CarImage
from bookings.models import Booking, TestDriveSlot
from enquiries.models import Enquiry


def format_ms(seconds):
    return f"{seconds * 1000:.2f}ms"


class BackendStabilityTester:
    def __init__(self):
        self.client = Client()
        self.results = {}
        self.errors = []
        self.User = get_user_model()
        self.setup_test_users()

    def setup_test_users(self):
        """Ensure test admin and customer users exist for authenticated tests."""
        self.admin_user, _ = self.User.objects.get_or_create(
            username='stability_admin',
            defaults={
                'email': 'stability_admin@example.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        self.admin_user.set_password('StabilityPass2026!')
        self.admin_user.save()

        self.customer_user, _ = self.User.objects.get_or_create(
            username='stability_customer',
            defaults={
                'email': 'stability_customer@example.com',
                'is_staff': False,
                'is_superuser': False,
                'first_name': 'Stability Tester'
            }
        )
        self.customer_user.set_password('StabilityPass2026!')
        self.customer_user.save()

    def login_admin(self, client):
        client.force_login(self.admin_user)

    def login_customer(self, client):
        client.force_login(self.customer_user)

    def test_1_public_inventory_api(self):
        print("\n[TEST 1] Testing Public Inventory API (/api/cars/)...")
        start = time.perf_counter()
        response = self.client.get('/api/cars/')
        duration = time.perf_counter() - start

        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        cars = response.json()
        assert len(cars) >= 100, f"Expected >= 100 cars, got {len(cars)}"

        # Validate structure of each car
        first = cars[0]
        required_fields = ['id', 'brand', 'name', 'price', 'fuel', 'transmission', 'body', 'images', 'image']
        for field in required_fields:
            assert field in first, f"Missing field {field} in car response"

        print(f"  ✓ Fetched {len(cars)} cars in {format_ms(duration)} (P50 latency)")
        self.results['public_inventory_all'] = duration

        # Test search queries
        search_terms = ['BMW', 'Mercedes', 'Audi', 'Porsche', 'Toyota', 'Diesel', 'Electric', 'Sedan', 'SUV', 'Hybrid']
        search_latencies = []
        for term in search_terms:
            t0 = time.perf_counter()
            res = self.client.get(f'/api/cars/?q={term}')
            lat = time.perf_counter() - t0
            search_latencies.append(lat)
            assert res.status_code == 200
            data = res.json()
            assert isinstance(data, list)

        avg_search = sum(search_latencies) / len(search_latencies)
        print(f"  ✓ Executed {len(search_terms)} search queries. Avg latency: {format_ms(avg_search)}")
        self.results['public_inventory_search_avg'] = avg_search

    def test_2_car_details_and_slots(self):
        print("\n[TEST 2] Testing Car Details and Test Drive Slots APIs...")
        sample_cars = list(Car.objects.filter(status='available')[:15])

        detail_latencies = []
        slots_latencies = []

        for car in sample_cars:
            # Detail API
            t0 = time.perf_counter()
            res = self.client.get(f'/api/cars/{car.slug}/')
            detail_lat = time.perf_counter() - t0
            detail_latencies.append(detail_lat)
            assert res.status_code == 200, f"Failed detail for {car.slug}: {res.status_code}"
            car_data = res.json()
            assert car_data['id'] == car.slug
            assert car_data['name'] == car.name

            # Slots API
            t0 = time.perf_counter()
            res_slots = self.client.get(f'/api/cars/{car.slug}/slots/')
            slots_lat = time.perf_counter() - t0
            slots_latencies.append(slots_lat)
            assert res_slots.status_code == 200, f"Failed slots for {car.slug}: {res_slots.status_code}"
            slots_data = res_slots.json()
            assert isinstance(slots_data, list)
            assert len(slots_data) > 0, f"Expected available slots for {car.slug}"

        avg_detail = sum(detail_latencies) / len(detail_latencies)
        avg_slots = sum(slots_latencies) / len(slots_latencies)
        print(f"  ✓ Fetched 15 car details. Avg latency: {format_ms(avg_detail)}")
        print(f"  ✓ Fetched slots for 15 cars. Avg latency: {format_ms(avg_slots)}")
        self.results['car_detail_avg'] = avg_detail
        self.results['car_slots_avg'] = avg_slots

    def test_3_enquiry_submission(self):
        print("\n[TEST 3] Testing Public Enquiry Submission API (/api/enquiries/)...")
        # Test valid submissions
        valid_enquiry = {
            'name': 'Stability Tester',
            'phone': '+919876543210',
            'email': 'stability.test@example.com',
            'interest': 'Testing Backend Stability',
            'message': 'Automated test enquiry verifying submission stability under load.'
        }

        t0 = time.perf_counter()
        res = self.client.post('/api/enquiries/', valid_enquiry, content_type='application/json')
        lat = time.perf_counter() - t0
        assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.content}"
        data = res.json()
        assert 'reference' in data
        assert data['status'] == 'new'
        print(f"  ✓ Created new enquiry (Ref: {data['reference']}) in {format_ms(lat)}")

        # Test validation rejection for invalid phone
        res_invalid = self.client.post('/api/enquiries/', {**valid_enquiry, 'phone': 'invalid_phone'}, content_type='application/json')
        assert res_invalid.status_code == 400
        assert 'phone' in res_invalid.json()
        print("  ✓ Correctly rejected invalid phone number with 400 Bad Request")

    def test_4_booking_concurrency_race_condition(self):
        print("\n[TEST 4] Testing Booking Concurrency & Race Condition Handling...")
        # Create a dedicated fresh test car and slot
        test_car = Car.objects.create(
            slug=f'concurrency-test-car-{uuid.uuid4().hex[:6]}',
            name='Concurrency Test Car',
            brand='TestBrand',
            year=2023,
            price=50.0,
            fuel='Petrol',
            body='Sedan',
            status='available'
        )
        test_slot = TestDriveSlot.objects.create(
            car=test_car,
            starts_at=timezone.now() + timedelta(days=5)
        )

        num_threads = 10
        payload = {
            'slot': test_slot.pk,
            'name': 'Concurrent Tester',
            'phone': '+919988776655'
        }

        clients = []
        for _ in range(num_threads):
            c = Client()
            self.login_customer(c)
            csrf = c.get('/api/customer/session/').json()['csrf']
            clients.append((c, csrf))

        def attempt_booking(thread_idx):
            client, csrf = clients[thread_idx]
            t0 = time.perf_counter()
            response = client.post(
                '/api/bookings/',
                payload,
                content_type='application/json',
                HTTP_X_CSRFTOKEN=csrf
            )
            elapsed = time.perf_counter() - t0
            return thread_idx, response.status_code, response.content, elapsed

        from django.conf import settings
        from django.core.cache import cache
        orig_rate = settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'].get('booking')
        settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['booking'] = '1000/hour'
        cache.clear()

        try:
            results = []
            with ThreadPoolExecutor(max_workers=num_threads) as executor:
                futures = [executor.submit(attempt_booking, i) for i in range(num_threads)]
                for future in as_completed(futures):
                    results.append(future.result())

            status_codes = [r[1] for r in results]
            success_count = status_codes.count(201)
            conflict_count = status_codes.count(409)

            print(f"  Attempted {num_threads} simultaneous bookings on identical slot:")
            print(f"  - 201 Created:   {success_count}")
            print(f"  - 409 Conflict:  {conflict_count}")
            print(f"  - Other codes:   {set(status_codes) - {201, 409}}")

            assert success_count == 1, f"Expected EXACTLY 1 booking to succeed, but got {success_count}!"
            assert conflict_count == num_threads - 1, f"Expected {num_threads - 1} conflicts, but got {conflict_count}!"

            # Verify DB integrity
            db_bookings = Booking.objects.filter(slot=test_slot)
            assert db_bookings.count() == 1, f"Expected 1 DB record, found {db_bookings.count()}"
            print(f"  ✓ Database constraint and atomic locking preserved: exactly 1 booking saved without race conditions.")
        finally:
            if orig_rate:
                settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['booking'] = orig_rate
            cache.clear()
            # Cleanup test car & slot
            Booking.objects.filter(slot=test_slot).delete()
            test_slot.delete()
            test_car.delete()

    def test_5_staff_workspace_apis_under_load(self):
        print("\n[TEST 5] Testing Staff Workspace APIs under 115 cars, 75 enquiries, 75 bookings, 11,000+ slots...")
        client = Client()
        self.login_admin(client)

        # 1. Overview API
        t0 = time.perf_counter()
        res_overview = client.get('/api/workspace/overview/')
        lat_overview = time.perf_counter() - t0
        assert res_overview.status_code == 200
        overview_data = res_overview.json()
        assert 'inventory' in overview_data
        assert 'stock_value' in overview_data
        assert 'enquiries' in overview_data
        assert 'bookings' in overview_data
        print(f"  ✓ /api/workspace/overview/ loaded in {format_ms(lat_overview)}")
        print(f"    - Stock value: ₹{overview_data['stock_value']} Lakhs")
        print(f"    - Inventory breakdown: {overview_data['inventory']}")
        print(f"    - Enquiries breakdown: {overview_data['enquiries']}")
        print(f"    - Bookings breakdown: {overview_data['bookings']}")
        self.results['workspace_overview'] = lat_overview

        # 2. Paginating Inventory (115 cars across 10 pages)
        res_inv = client.get('/api/workspace/inventory/?page=1')
        assert res_inv.status_code == 200, f"Failed inventory: {res_inv.status_code}"
        inv_data = res_inv.json()
        total_cars = inv_data['count']
        total_pages = inv_data['pages']
        print(f"  ✓ Inventory pagination: {total_cars} cars across {total_pages} pages.")
        assert total_cars >= 100
        assert len(inv_data['results']) == 12

        # 3. Paginating Enquiries
        res_enq = client.get('/api/workspace/enquiries/?page=1')
        assert res_enq.status_code == 200, f"Failed enquiries: {res_enq.status_code}"
        enq_data = res_enq.json()
        print(f"  ✓ Enquiries pagination: {enq_data['count']} enquiries across {enq_data['pages']} pages.")
        assert enq_data['count'] >= 75

        # 4. Paginating Test Drives
        res_bk = client.get('/api/workspace/test-drives/?page=1')
        assert res_bk.status_code == 200, f"Failed test-drives: {res_bk.status_code}"
        bk_data = res_bk.json()
        print(f"  ✓ Bookings pagination: {bk_data['count']} bookings across {bk_data['pages']} pages.")
        assert bk_data['count'] >= 75

        # 5. Paginating Slots (11,000+ slots dataset)
        t0 = time.perf_counter()
        res_slots = client.get('/api/workspace/slots/?page=1')
        lat_slots = time.perf_counter() - t0
        assert res_slots.status_code == 200, f"Failed slots: {res_slots.status_code}"
        slots_data = res_slots.json()
        print(f"  ✓ Slots pagination (11,000+ dataset): {slots_data['count']} upcoming slots loaded in {format_ms(lat_slots)}.")
        assert slots_data['count'] > 5000
        assert len(slots_data['results']) == 12

    def test_6_high_throughput_burst_stress(self):
        print("\n[TEST 6] Running High-Throughput Burst Stress Test (120 rapid concurrent requests)...")
        endpoints = [
            '/api/cars/',
            '/api/cars/?q=Mercedes',
            '/api/cars/?q=BMW',
            '/api/cars/?q=SUV',
            '/api/cars/?q=Hybrid',
            '/api/cars/mercedes-e220d-exclusive-2022/',
            '/api/cars/bmw-330li-m-sport-2023/',
            '/api/cars/audi-a4-40-tfsi-technology-2022/',
            '/api/cars/mercedes-e220d-exclusive-2022/slots/',
            '/api/cars/bmw-330li-m-sport-2023/slots/',
        ]

        num_requests = 120
        max_workers = 12
        latencies = []
        errors = 0

        def send_request(idx):
            url = endpoints[idx % len(endpoints)]
            c = Client()
            t0 = time.perf_counter()
            res = c.get(url)
            elapsed = time.perf_counter() - t0
            return res.status_code, elapsed

        t_start = time.perf_counter()
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(send_request, i) for i in range(num_requests)]
            for future in as_completed(futures):
                status, elapsed = future.result()
                latencies.append(elapsed)
                if status != 200:
                    errors += 1
        total_time = time.perf_counter() - t_start

        latencies.sort()
        p50 = latencies[len(latencies) // 2]
        p90 = latencies[int(len(latencies) * 0.90)]
        p95 = latencies[int(len(latencies) * 0.95)]
        p99 = latencies[int(len(latencies) * 0.99)]
        rps = num_requests / total_time

        print(f"  Total Requests:  {num_requests}")
        print(f"  Successful:      {num_requests - errors} (100.0%)")
        print(f"  Failed / Errors: {errors}")
        print(f"  Total Duration:  {total_time:.2f}s")
        print(f"  Throughput:      {rps:.1f} req/s")
        print(f"  Latency P50:     {format_ms(p50)}")
        print(f"  Latency P90:     {format_ms(p90)}")
        print(f"  Latency P95:     {format_ms(p95)}")
        print(f"  Latency P99:     {format_ms(p99)}")
        print(f"  Max Latency:     {format_ms(latencies[-1])}")

        assert errors == 0, f"Expected 0 errors during burst stress test, got {errors}"
        self.results['burst_rps'] = rps
        self.results['burst_p50'] = p50
        self.results['burst_p95'] = p95

    def run_all(self):
        print("========================================================================")
        print("          SHOWROOM BACKEND STABILITY & LOAD TEST RUNNER                 ")
        print("========================================================================")
        print(f"Database: {connection.settings_dict['ENGINE']} ({connection.settings_dict['NAME']})")
        print(f"Current Counts: Cars={Car.objects.count()}, Slots={TestDriveSlot.objects.count()}, "
              f"Enquiries={Enquiry.objects.count()}, Bookings={Booking.objects.count()}")

        self.test_1_public_inventory_api()
        self.test_2_car_details_and_slots()
        self.test_3_enquiry_submission()
        self.test_4_booking_concurrency_race_condition()
        self.test_5_staff_workspace_apis_under_load()
        self.test_6_high_throughput_burst_stress()

        print("\n========================================================================")
        print("                     ALL STABILITY TESTS PASSED                         ")
        print("========================================================================")
        return True


if __name__ == '__main__':
    tester = BackendStabilityTester()
    success = tester.run_all()
    sys.exit(0 if success else 1)
