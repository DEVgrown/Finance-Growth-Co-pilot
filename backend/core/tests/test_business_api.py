from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import Business, UserProfile
import json


class BusinessAPITest(APITestCase):
    """Test business API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        
        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        self.business = Business.objects.create(
            owner=self.user,
            legal_name='Test Business',
            dba_name='Test DBA',
            website='https://test.com',
            year_founded=2020,
            employee_count=10
        )
        
        self.business_list_url = reverse('business-list')
        self.business_detail_url = reverse('business-detail', kwargs={'pk': self.business.pk})
    
    def test_create_business_success(self):
        """Test creating a new business"""
        data = {
            'legal_name': 'New Business',
            'dba_name': 'New DBA',
            'website': 'https://newbusiness.com',
            'year_founded': 2021,
            'employee_count': 5,
            'hq_country': 'US',
            'hq_city': 'NYC',
            'business_model': 'B2B',
            'sales_motion': 'self-serve',
            'revenue_band': '1M-10M'
        }
        
        response = self.client.post(self.business_list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['legal_name'], 'New Business')
        self.assertEqual(response.data['owner']['username'], 'testuser')
        
        # Check business was created
        self.assertTrue(Business.objects.filter(legal_name='New Business').exists())
    
    def test_get_business_list(self):
        """Test getting business list"""
        response = self.client.get(self.business_list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['legal_name'], 'Test Business')
    
    def test_get_business_detail(self):
        """Test getting business detail"""
        response = self.client.get(self.business_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['legal_name'], 'Test Business')
        self.assertEqual(response.data['dba_name'], 'Test DBA')
    
    def test_update_business_success(self):
        """Test updating business"""
        data = {
            'legal_name': 'Updated Business',
            'dba_name': 'Updated DBA',
            'website': 'https://updated.com',
            'year_founded': 2022,
            'employee_count': 15
        }
        
        response = self.client.put(self.business_detail_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['legal_name'], 'Updated Business')
        
        # Check database was updated
        self.business.refresh_from_db()
        self.assertEqual(self.business.legal_name, 'Updated Business')
    
    def test_delete_business_success(self):
        """Test deleting business"""
        response = self.client.delete(self.business_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Business.objects.filter(pk=self.business.pk).exists())
    
    def test_business_unauthorized_access(self):
        """Test business access without authentication"""
        self.client.credentials()  # Remove auth
        
        response = self.client.get(self.business_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_business_owner_only_access(self):
        """Test that users can only access their own businesses"""
        # Create another user and business
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        other_business = Business.objects.create(
            owner=other_user,
            legal_name='Other Business'
        )
        
        other_business_url = reverse('business-detail', kwargs={'pk': other_business.pk})
        response = self.client.get(other_business_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)