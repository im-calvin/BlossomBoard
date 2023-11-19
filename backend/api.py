from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import json
import random
import string
import logging

# logging.basicConfig(level=logging.WARNING)
# logging.getLogger('engineio').setLevel(logging.WARNING)
# logging.getLogger('socketio').setLevel(logging.WARNING)

app = Flask(__name__)
# app.logger.setLevel(logging.WARNING)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")


# Global state to store drawings and users for each room
drawings = {}
room_users = {}  # Structure: { 'roomCode': {'username1', 'username2', ...} }

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

@socketio.on("connect_error")
def handle_connect_error(err):
    print(f"Client connection error: {err}")

@socketio.on("disconnect")
def handle_disconnect():
    # Remove the user from their room if they're in any
    for room, users in room_users.items():
        users_to_remove = {username for username, sid in users.items() if sid == request.sid}
        for username in users_to_remove:
            users.pop(username)
            emit("leave_announcement", {"username": username, "message": f"{username} has disconnected from room {room}"}, to=room)

@socketio.on("join")
def on_join(data):
    username = data["username"]
    room = data["room"]
    print(f"{username} has joined room {room}")
    # print(f"Room users: {room_users}")
    # Check if the user is already in another room
    for current_room in room_users:
        if username in room_users[current_room]:
            if current_room != room:
                # User is in a different room, leave that room
                leave_room(current_room)
                del room_users[current_room][username]

                # Optionally, send a message to the old room
                emit("leave_announcement", {"username": username, "room": current_room}, to=current_room)

    # Join the new room
    join_room(room)

    # Add user to the room_users list
    if room not in room_users:
        room_users[room] = {}
    room_users[room][username] = request.sid
    
    # if nothing is in drawing for the room, initialize the room as empty list
    if room not in drawings:
        drawings[room] = []

    # Send current state of the room to the user
    if room in drawings:
        emit("current_drawing", {"shapes": drawings[room]}, to=request.sid)

    # Announce the user's arrival to the new room

    emit("join_announcement", {"username": username, "room": room}, to=room)


@socketio.on("draw")
def handle_draw(data):
    username = data["username"]
    room = data["room"]
    print(f"Received draw event from {username} in room {room}")
    shape = data["shape"]

    if room in drawings:
        drawings[room].append(shape)

    emit("draw", {"shape": shape, "username": username}, to=room, include_self=False)



@socketio.on("leave")
def on_leave(data):
    username = data["username"]
    room = data["room"]
    leave_room(room)

    if room in room_users and username in room_users[room]:
        del room_users[room][username]
        
    # delete empty rooms
    if room in room_users and len(room_users[room]) == 0:
        del room_users[room]
        del drawings[room]

    print(f"{username} has left room {room}")
    emit("leave_announcement", {"username": username, "message": f"{username} has left room {room}"}, to=room)

# Other event handlers remain the same

if __name__ == "__main__":
    socketio.run(app=app, debug=True, host="0.0.0.0", port=8080)