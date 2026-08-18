from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import re
from datetime import datetime

app = Flask(__name__)

# Configure CORS to allow all origins - SIMPLE SOLUTION
CORS(app)

# MongoDB connection
try:
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
    # Test the connection
    client.admin.command('ping')
    db = client['agrismart']
    users_collection = db['users']
    print("✅ Connected to MongoDB successfully!")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    exit(1)

@app.route('/login', methods=['POST'])
def login():
    try:
        # Get JSON data from request
        data = request.get_json()
        print(f"📨 Received login request for: {data.get('username', 'unknown')}")
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data received'
            }), 400
        
        # Validate required fields
        required_fields = ['username', 'password']
        for field in required_fields:
            if not data.get(field):
                print(f"❌ Missing field: {field}")
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        username = data['username'].strip()
        password = data['password']
        
        print(f"🔍 Searching for user: {username}")
        
        # Find user by username or email
        user = users_collection.find_one({
            '$or': [
                {'username': username},
                {'email': username.lower()}
            ]
        })
        
        if not user:
            print(f"❌ User not found: {username}")
            return jsonify({
                'success': False,
                'message': 'Invalid username or password'
            }), 401
        
        print(f"✅ User found: {user['username']}")
        print(f"🔐 Checking password...")
        
        # Check password
        if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            print(f"✅ Password correct! Login successful for: {user['username']}")
            return jsonify({
                'success': True,
                'message': 'Login successful!',
                'user_id': str(user['_id']),
                'username': user['username'],
                'fullname': user['fullname'],
                'email': user['email']
            }), 200
        else:
            print(f"❌ Password incorrect for: {user['username']}")
            return jsonify({
                'success': False,
                'message': 'Invalid username or password'
            }), 401
        
    except Exception as e:
        print(f"❌ Server error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500
    

# @app.route('/register', methods=['POST'])
# def register():
#     try:
#         data = request.get_json()
#         print("📨 Registration request received:", data)

#         # Check if data exists
#         if not data:
#             return jsonify({"success": False, "message": "No data received"}), 400

#         fullname = data.get("fullname", "").strip()
#         email = data.get("email", "").strip().lower()
#         username = data.get("username", "").strip()
#         password = data.get("password", "")

#         # Validate fields
#         if not all([fullname, email, username, password]):
#             return jsonify({"success": False, "message": "All fields are required"}), 400

#         # Email format validation
#         email_pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
#         if not re.match(email_pattern, email):
#             return jsonify({"success": False, "message": "Invalid email format"}), 400

#         # Password strength validation
#         if len(password) < 8 or not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password) or not re.search(r"\d", password) or not re.search(r"[^A-Za-z0-9]", password):
#             return jsonify({"success": False, "message": "Weak password — must include uppercase, lowercase, number, and special character"}), 400

#         # Check duplicates
#         if users_collection.find_one({"$or": [{"email": email}, {"username": username}]}):
#             return jsonify({"success": False, "message": "Username or email already exists"}), 409

#         # Hash password using bcrypt
#         hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

#         # Insert into database
#         new_user = {
#             "fullname": fullname,
#             "email": email,
#             "username": username,
#             "password": hashed_password.decode("utf-8"),
#             "created_at": datetime.now()
#         }

#         result = users_collection.insert_one(new_user)

#         print(f"✅ New user created: {username} (ID: {result.inserted_id})")

#         return jsonify({
#             "success": True,
#             "message": "User registered successfully!",
#             "user_id": str(result.inserted_id)
#         }), 201

#     except Exception as e:
#         print(f"❌ Registration error: {e}")
#         return jsonify({"success": False, "message": f"Server error: {e}"}), 500




@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print(f"📨 Received registration request for: {data.get('email', 'unknown')}")
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data received'
            }), 400
        
        # Validate required fields
        required_fields = ['fullname', 'email', 'username', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        fullname = data['fullname'].strip()
        email = data['email'].strip().lower()
        username = data['username'].strip()
        password = data['password']
        
        # Validate email format
        if not is_valid_email(email):
            return jsonify({
                'success': False,
                'message': 'Please enter a valid email address'
            }), 400
        
        # Validate password strength
        if not is_strong_password(password):
            return jsonify({
                'success': False,
                'message': 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
            }), 400
        
        # Check if user already exists
        existing_user = users_collection.find_one({
            '$or': [
                {'email': email},
                {'username': username}
            ]
        })
        
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'User with this email or username already exists'
            }), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create user document
        user_data = {
            'fullname': fullname,
            'email': email,
            'username': username,
            'password': hashed_password,
            'created_at': datetime.utcnow()
        }
        
        # Insert user
        result = users_collection.insert_one(user_data)
        
        print(f"✅ User registered successfully! ID: {result.inserted_id}, Email: {email}")
        return jsonify({
            'success': True,
            'message': 'Registration successful!',
            'user_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"❌ Server error: {e}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_strong_password(password):
    """Check if password meets strength requirements"""
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    if not re.search(r'[^A-Za-z0-9]', password):
        return False
    return True

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        client.admin.command('ping')
        user_count = users_collection.count_documents({})
        return jsonify({
            'status': 'Healthy', 
            'database': 'Connected to MongoDB',
            'user_count': user_count,
            'service': 'AgriSmart Registration & Login API'
        })
    except Exception as e:
        return jsonify({
            'status': 'Unhealthy',
            'database': 'Disconnected',
            'service': 'AgriSmart Registration & Login API',
            'error': str(e)
        }), 500

@app.route('/users', methods=['GET'])
def get_users():
    """Get all users (for testing)"""
    try:
        users = list(users_collection.find({}, {'password': 0}))  # Exclude passwords
        for user in users:
            user['_id'] = str(user['_id'])
        return jsonify({
            'success': True,
            'users': users,
            'count': len(users)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching users: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🚀 Starting AgriSmart Registration & Login API...")
    print("📊 Database: MongoDB")
    print("🌐 Server running on: http://localhost:5000")
    print("🔗 Health check: http://localhost:5000/health")
    print("👥 View users: http://localhost:5000/users")
    print("🔐 Login endpoint: POST http://localhost:5000/login")
    print("📝 Register endpoint: POST http://localhost:5000/register")
    print("✅ CORS configured for all origins")
    app.run(debug=True, port=5000, use_reloader=False)  # Added use_reloader=False to fix socket issue