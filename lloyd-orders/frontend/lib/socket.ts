import { io } from "socket.io-client";
import { backendUrl } from "./api";

export function createSocket() {
  return io(backendUrl, {
    transports: ["websocket", "polling"]
  });
}
