from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit

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


@socketio.on("join_room")
def handle_join_room(data):
    roomId = data["roomId"]
    userId = data["userId"]
    if roomId and userId:
        if roomId in rooms:
            rooms[roomId].append(userId)
        else:
            rooms[roomId] = [userId]
    elif not roomId and userId:
        # assign a random roomId
        pass

    print(f"Client {request.sid} joined room {room}")


@socketio.on("leave_room")
def handle_leave_room(data):
    roomId = data["roomId"]
    userId = data["userId"]
    if roomId in rooms:
        rooms[roomId].remove(userId)
    print(f"Client {request.sid} left room {room}")


@socketio.on("draw")
def handle_draw(data):
    roomId = data["roomId"]  # room where the shape was drawn
    userId = data["userId"]  # original user who drew the shape
    shape = data["shape"]  # shape to be drawn
    emit("draw", {"shape": shape, "user": userId}, room=roomId)


rooms = {
    "1234": ["1", "2"],  # users 1 and 2 are in room 1234
}

if __name__ == "__main__":
    socketio.run(app=app, debug=True, host="0.0.0.0", port=8080)
