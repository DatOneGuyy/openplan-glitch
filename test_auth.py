import unittest
from server import app
from models import db, User
import json

class AuthTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_register_login(self):
        # 1. Register
        print("\nTesting Registration...")
        resp = self.client.post('/api/register', json={
            "username": "testuser",
            "password": "password123"
        })
        self.assertEqual(resp.status_code, 201)
        print("  [SUCCESS] Registration passed.")

        # 2. Login
        print("Testing Login...")
        resp = self.client.post('/api/login', json={
            "username": "testuser",
            "password": "password123"
        })
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertEqual(data['user']['username'], 'testuser')
        print("  [SUCCESS] Login passed.")

        # 3. Status
        print("Testing Status...")
        resp = self.client.get('/api/user_status')
        data = json.loads(resp.data)
        self.assertTrue(data['is_logged_in'])
        print("  [SUCCESS] Status check passed.")

        # 4. Logout
        print("Testing Logout...")
        resp = self.client.post('/api/logout')
        self.assertEqual(resp.status_code, 200)
        print("  [SUCCESS] Logout passed.")

        # 5. Status After Logout
        resp = self.client.get('/api/user_status')
        data = json.loads(resp.data)
        self.assertFalse(data['is_logged_in'])
        print("  [SUCCESS] Final status check passed.")

if __name__ == '__main__':
    unittest.main()
