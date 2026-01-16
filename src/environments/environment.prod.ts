export const environment = {
    production: true,
    pocketbase: {
        // Browser uses same origin, SSR uses internal Docker network
        browserUrl: '',  // Same origin for browser
        serverUrl: 'http://pocketbase:8090'  // Internal Docker network for SSR
    },
    azuracast: {
        url: 'https://tsoft.stream',
        stationId: 'westend_radio_tv',
        wsUrl: 'wss://tsoft.stream/api/live/nowplaying/websocket',
        // IMPORTANT: Move this to backend environment variable in production
        apiKey: process.env['AZURACAST_API_KEY'] || '8fe3697a1e1fa55b:ae3c046191c39f0260307692a17554a7'
    }
};
