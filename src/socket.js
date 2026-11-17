import { io } from 'socket.io-client';
import { API_URL } from './api';

// One shared real-time connection for the whole app
export const socket = io(API_URL);
