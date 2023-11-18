from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room, send

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)


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
    send(username + " has entered the room.", to=room)


@socketio.on("leave")
def on_leave(data):
    username = data["username"]
    room = data["room"]
    leave_room(room)
    send(username + " has left the room.", to=room)


@socketio.on("draw")
def handle_draw(data):
    username = data["username"]  # original user who drew the shape
    room = data["room"]  # room where the shape was drawn
    shape = data["shape"]  # shape to be drawn
    send({"shape": shape, "user": username}, to=room)


if __name__ == "__main__":
    socketio.run(app=app, debug=True, host="0.0.0.0", port=8080)
