export const environment = {
    production: true,
    pocketbase: {
        // Use same origin - PocketBase is proxied at the same domain by VPS Panel
        url: ''
    },
    azuracast: {
        url: 'https://tsoft.stream',
        stationId: 'westend_radio_tv',
        wsUrl: 'wss://tsoft.stream/api/live/nowplaying/websocket',
        // IMPORTANT: Move this to backend environment variable in production
        apiKey: process.env['AZURACAST_API_KEY'] || '8fe3697a1e1fa55b:ae3c046191c39f0260307692a17554a7'
    }
};
