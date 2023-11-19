import { io } from "socket.io-client";

const URL = process.env.REACT_APP_PUBLIC_NODE_ENV === "production"
    ? process.env.REACT_APP_PUBLIC_API_ENDPOINT_PROD
    : process.env.REACT_APP_PUBLIC_API_ENDPOINT_DEV;

export const socket = io(URL);
