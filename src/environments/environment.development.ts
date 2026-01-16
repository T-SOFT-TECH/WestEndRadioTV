export const environment = {
    production: false,
    pocketbase: {
        url: 'http://127.0.0.1:8090',
        browserUrl: 'http://127.0.0.1:8090',
        serverUrl: 'http://127.0.0.1:8090'
    },
    azuracast: {
        url: 'https://tsoft.stream',
        stationId: 'westend_radio_tv',
        wsUrl: 'wss://tsoft.stream/api/live/nowplaying/websocket',
        apiKey: '8fe3697a1e1fa55b:ae3c046191c39f0260307692a17554a7'
    }
};
