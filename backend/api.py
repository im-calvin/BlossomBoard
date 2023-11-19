from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import json

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])
socketio = SocketIO(app, cors_allowed_origins="*")

# Global state to store drawings for each room
drawings = {}

@app.route("/")
def hello_world():
    return "Hello, World!"

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
