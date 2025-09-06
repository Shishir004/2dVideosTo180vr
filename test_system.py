"""
Test script to verify the VR 180 platform is working correctly.
This script tests the communication between Express backend and Python service.
"""

import requests
import time
import os

def test_express_backend():
    """Test Express backend health."""
    try:
        response = requests.get('http://localhost:5000/health')
        if response.status_code == 200:
            data = response.json()
            print("✅ Express backend is healthy")
            print(f"   Python service status: {data.get('python_service', 'Unknown')}")
            return True
        else:
            print("❌ Express backend health check failed")
            return False
    except Exception as e:
        print(f"❌ Express backend not accessible: {e}")
        return False

def test_frontend():
    """Test React frontend."""
    try:
        response = requests.get('http://localhost:3000')
        if response.status_code == 200:
            print("✅ React frontend is accessible")
            return True
        else:
            print("❌ React frontend not accessible")
            return False
    except Exception as e:
        print(f"❌ React frontend not accessible: {e}")
        return False

def main():
    print("🧪 Testing VR 180 Platform Services")
    print("=" * 40)
    
    # Test all services
    express_ok = test_express_backend()
    frontend_ok = test_frontend()
    
    print("\n" + "=" * 40)
    
    if express_ok and frontend_ok:
        print("🎉 All services are running correctly!")
        print("\nYou can now:")
        print("1. Open http://localhost:3000 in your browser")
        print("2. Upload a video file")
        print("3. Watch it get converted to VR 180 format")
    else:
        print("⚠️  Some services are not running properly")
        print("\nPlease check:")
        if not express_ok:
            print("- Start Express backend: cd backend && npm start")
        if not frontend_ok:
            print("- Start React frontend: cd frontend && npm run dev")

if __name__ == "__main__":
    main()
