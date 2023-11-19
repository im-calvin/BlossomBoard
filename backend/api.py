from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room, send, rooms
import json

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000, http://localhost:3001"])
socketio = SocketIO(app, cors_allowed_origins="*")


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
    join_room(
        room
    )  # user joined is based on sessionId inherent to websocket request (request.sid)

    print(f"{username} has joined room {room}")
    print(f"Rooms: {rooms(request.sid)}")
    send(
        message={
            "username": username,
            "room": room,
            "message": f"{username} has joined room {room}",
        },
        to=room,
        include_self=False,
        json=True,
    )


@socketio.on("leave")
def on_leave(data):
    username = data["username"]
    room = data["room"]
    leave_room(room)
    print(f"{username} has left room {room}")
    print(f"Rooms: {rooms(request.sid)}")
    send(
        {
            "username": username,
            "room": room,
            "message": f"{username} has left room {room}",
        },
        to=room,
        include_self=False,
        json=True,
    )


@socketio.on("draw")
def handle_draw(data):
    username = data["username"]  # original user who drew the shape
    room = data["room"]  # room where the shape was drawn
    shape = data["shape"]  # shape to be drawn
    print(shape)
    print(f"Received shape: {shape} from {username} in room {room}")
    print(f"Rooms: {rooms(request.sid)}")
    emit(
        "draw",
        {"shape": shape, "username": username},
        to=room,
        include_self=False,
        json=True,
        broadcast=True,
        callback=lambda: print("Message sent!"),
    )


if __name__ == "__main__":
    socketio.run(app=app, debug=True, host="0.0.0.0", port=8080)
