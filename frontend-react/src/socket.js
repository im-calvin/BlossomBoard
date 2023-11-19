import { io } from "socket.io-client";

const URL = process.env.REACT_APP_PUBLIC_NODE_ENV === "production"
    ? process.env.REACT_APP_PUBLIC_API_ENDPOINT_PROD
    : process.env.REACT_APP_PUBLIC_API_ENDPOINT_DEV;

const socket = io(URL);

socket.on("connect", () => {
    console.log("Connected to socket server");
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
});

export { socket };