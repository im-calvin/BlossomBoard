from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import json
import random
import string

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Global state to store drawings for each room
drawings = {}

@app.route("/")
def hello_world():
    return "Hello, World!"

@app.route('/api/rooms/verify/<room_code>', methods=['GET'])
def verify_room(room_code):
    print(f"Verifying room {room_code}")
    exists = room_code in drawings
    return jsonify({'exists': exists})

@app.route('/api/rooms/create', methods=['POST'])
def create_room():
    print("Creating room")
    room_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    drawings[room_code] = []  # Initialize empty drawings list for the room
    return jsonify({'roomCode': room_code})

@socketio.on("connect")
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on("disconnect")
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")

@socketio.on("join")
def on_join(data):
    username = data["username"]
    room = data["room"]
    join_room(room)

    print(f"{username} has joined room {room}")

    if room in drawings:
        emit("current_drawing", {"shapes": drawings[room]}, to=request.sid)
    emit("join_announcement", {"username": username, "message": f"{username} has joined room {room}"}, to=room, include_self=False)

@socketio.on("leave")
def on_leave(data):
    username = data["username"]
    room = data["room"]
    leave_room(room)
    print(f"{username} has left room {room}")

@socketio.on("draw")
def handle_draw(data):
    username = data["username"]
    room = data["room"]
    shape = data["shape"]
    if room not in drawings:
        drawings[room] = []
    drawings[room].append(shape)

    print(f"Received shape: {shape} from {username} in room {room}")
    emit("draw", {"shape": shape, "username": username}, to=room, include_self=False, json=True)

if __name__ == "__main__":
    socketio.run(app=app, debug=True, host="0.0.0.0", port=8080)
