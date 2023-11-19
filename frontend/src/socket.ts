import { io } from "socket.io-client";
import { env } from "./env.mjs";

const URL =
  env.NEXT_PUBLIC_NODE_ENV === "production"
    ? env.NEXT_PUBLIC_API_ENDPOINT_PROD
    : env.NEXT_PUBLIC_API_ENDPOINT_DEV;

export const socket = io(URL);
