from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import UserProfile
import json


class UserRegistrationAPITest(APITestCase):
    """Test user registration API"""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.valid_payload = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
    
    def test_user_registration_success(self):
        """Test successful user registration"""
        response = self.client.post(self.register_url, self.valid_payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
        
        # Check user was created
        self.assertTrue(User.objects.filter(username='testuser').exists())
        
        # Check profile was created
        user = User.objects.get(username='testuser')
        self.assertTrue(UserProfile.objects.filter(user=user).exists())
    
    def test_user_registration_invalid_data(self):
        """Test registration with invalid data"""
        invalid_payload = {
            'username': 'test',
            'email': 'invalid-email',
            'password': '123'  # Too short
        }
        
        response = self.client.post(self.register_url, invalid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_user_registration_duplicate_username(self):
        """Test registration with duplicate username"""
        User.objects.create_user(username='testuser', email='existing@example.com', password='testpass123')
        
        response = self.client.post(self.register_url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserProfileAPITest(APITestCase):
    """Test user profile API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            bio='Test bio',
            job_title='Developer',
            company='Test Corp'
        )
        
        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        self.profile_detail_url = reverse('profile_detail')
        self.profile_update_url = reverse('profile_update')
        self.profile_create_url = reverse('profile_create')
    
    def test_get_profile_success(self):
        """Test getting user profile"""
        response = self.client.get(self.profile_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bio'], 'Test bio')
        self.assertEqual(response.data['job_title'], 'Developer')
        self.assertEqual(response.data['company'], 'Test Corp')
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')
    
    def test_get_profile_unauthorized(self):
        """Test getting profile without authentication"""
        self.client.credentials()  # Remove auth
        response = self.client.get(self.profile_detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_get_profile_creates_if_missing(self):
        """Test that GET creates profile if it doesn't exist"""
        # Delete existing profile
        self.profile.delete()
        
        response = self.client.get(self.profile_detail_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(UserProfile.objects.filter(user=self.user).exists())
    
    def test_patch_profile_success(self):
        """Test partial profile update"""
        update_data = {
            'bio': 'Updated bio',
            'job_title': 'Senior Developer',
            'risk_tolerance': 'aggressive'
        }
        
        response = self.client.patch(self.profile_update_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bio'], 'Updated bio')
        self.assertEqual(response.data['job_title'], 'Senior Developer')
        self.assertEqual(response.data['risk_tolerance'], 'aggressive')
        
        # Check database was updated
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.bio, 'Updated bio')
        self.assertEqual(self.profile.job_title, 'Senior Developer')
    
    def test_patch_profile_with_user_fields(self):
        """Test updating user fields through profile"""
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'bio': 'New bio'
        }
        
        response = self.client.patch(self.profile_update_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['first_name'], 'Updated')
        self.assertEqual(response.data['user']['last_name'], 'Name')
        self.assertEqual(response.data['bio'], 'New bio')
        
        # Check user was updated
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')
    
    def test_put_profile_success(self):
        """Test full profile update"""
        update_data = {
            'phone_number': '+1234567890',
            'date_of_birth': '1990-01-01',
            'bio': 'Complete bio',
            'job_title': 'CTO',
            'company': 'New Corp',
            'industry': 'Technology',
            'experience_years': 10,
            'country': 'US',
            'city': 'NYC',
            'timezone': 'UTC',
            'language': 'en',
            'currency': 'USD',
            'notification_preferences': {'email': True},
            'risk_tolerance': 'moderate'
        }
        
        response = self.client.put(self.profile_update_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['phone_number'], '+1234567890')
        self.assertEqual(response.data['job_title'], 'CTO')
        self.assertEqual(response.data['company'], 'New Corp')
        self.assertEqual(response.data['experience_years'], 10)
    
    def test_profile_update_unauthorized(self):
        """Test profile update without authentication"""
        self.client.credentials()  # Remove auth
        update_data = {'bio': 'Unauthorized update'}
        
        response = self.client.patch(self.profile_update_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_profile_create_success(self):
        """Test creating profile with initial data"""
        # Delete existing profile
        self.profile.delete()
        
        create_data = {
            'bio': 'New profile',
            'country': 'US',
            'language': 'en',
            'currency': 'USD'
        }
        
        response = self.client.post(self.profile_create_url, create_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['bio'], 'New profile')
        self.assertEqual(response.data['country'], 'US')
        self.assertEqual(response.data['language'], 'en')
    
    def test_profile_create_already_exists(self):
        """Test creating profile when one already exists"""
        create_data = {'bio': 'Duplicate profile'}
        
        response = self.client.post(self.profile_create_url, create_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bio'], 'Test bio')  # Should return existing profile
    
    def test_profile_invalid_data(self):
        """Test profile update with invalid data"""
        invalid_data = {
            'risk_tolerance': 'invalid_choice',
            'experience_years': -5
        }
        
        response = self.client.patch(self.profile_update_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserAuthenticationAPITest(APITestCase):
    """Test JWT authentication endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.token_url = reverse('token_obtain_pair')
        self.refresh_url = reverse('token_refresh')
    
    def test_token_obtain_success(self):
        """Test successful token obtain"""
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.token_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_token_obtain_invalid_credentials(self):
        """Test token obtain with invalid credentials"""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(self.token_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_token_refresh_success(self):
        """Test successful token refresh"""
        refresh = RefreshToken.for_user(self.user)
        refresh_token = str(refresh)
        
        data = {'refresh': refresh_token}
        response = self.client.post(self.refresh_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)