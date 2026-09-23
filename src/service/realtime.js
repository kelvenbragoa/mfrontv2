import axios from 'axios';
import { baseURL, baseURL2, reverbAppKey } from '@/service/ApiConstant';

let echoPromise = null;

const socketConfig = () => {
    const url = new URL(baseURL2);
    const secure = url.protocol === 'https:';
    return {
        host: url.hostname,
        port: secure ? 443 : 8080,
        secure
    };
};

export const getEcho = () => {
    if (!echoPromise) {
        echoPromise = Promise.all([import('laravel-echo'), import('pusher-js')]).then(([echoModule, pusherModule]) => {
            window.Pusher = pusherModule.default;
            const { host, port, secure } = socketConfig();

            return new echoModule.default({
                broadcaster: 'reverb',
                key: reverbAppKey,
                wsHost: host,
                wsPort: port,
                wssPort: port,
                forceTLS: secure,
                enabledTransports: ['ws', 'wss'],
                authorizer: (channel) => ({
                    authorize: (socketId, callback) => {
                        axios
                            .post(`${baseURL}/broadcasting/auth`, { socket_id: socketId, channel_name: channel.name })
                            .then((response) => callback(null, response.data))
                            .catch((error) => callback(error, null));
                    }
                })
            });
        });
    }
    return echoPromise;
};

export const currentUserId = () => {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null')?.id ?? null;
    } catch {
        return null;
    }
};
