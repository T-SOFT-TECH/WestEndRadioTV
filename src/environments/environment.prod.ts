export const environment = {
    production: true,
    pocketbase: {
        // Update this to your production PocketBase URL
        url: process.env['POCKETBASE_URL'] || 'https://api.yourdomain.com'
    },
    azuracast: {
        url: 'https://tsoft.stream',
        stationId: 'westend_radio_tv',
        wsUrl: 'wss://tsoft.stream/api/live/nowplaying/websocket',
        // IMPORTANT: Move this to backend environment variable in production
        apiKey: process.env['AZURACAST_API_KEY'] || '8fe3697a1e1fa55b:ae3c046191c39f0260307692a17554a7'
    }
};
