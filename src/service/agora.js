let sdkPromise = null;

export const loadAgora = () => {
    if (!sdkPromise) {
        sdkPromise = import('agora-rtc-sdk-ng').then((module) => {
            const AgoraRTC = module.default;
            AgoraRTC.setLogLevel(3);
            return AgoraRTC;
        });
    }
    return sdkPromise;
};

export const createLiveClient = async () => {
    const AgoraRTC = await loadAgora();
    return AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
};

export const createCameraAndMic = async () => {
    const AgoraRTC = await loadAgora();
    return AgoraRTC.createMicrophoneAndCameraTracks({ AEC: true, ANS: true }, { encoderConfig: '720p_2', facingMode: 'user' });
};

export const closeTracks = (tracks) => {
    (tracks || []).forEach((track) => {
        try {
            track?.stop();
            track?.close();
        } catch {
            // track already released
        }
    });
};

export const mediaErrorMessage = (error) => {
    const code = error?.code || error?.name || '';
    if (String(code).includes('PERMISSION_DENIED') || code === 'NotAllowedError') {
        return 'Permite o acesso à câmara e ao microfone no navegador.';
    }
    if (String(code).includes('DEVICE_NOT_FOUND') || code === 'NotFoundError') {
        return 'Não encontrámos câmara ou microfone neste dispositivo.';
    }
    return error?.message || 'Não foi possível aceder à câmara.';
};
