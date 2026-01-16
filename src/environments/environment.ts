
export const environment = {
  production: true,
  pocketbase: {
    url: ''  // Empty = use same origin (window.location.origin)
  },
  azuracast: {
    url: 'https://tsoft.stream',
    stationId: 'westend_radio_tv',
    wsUrl: 'wss://tsoft.stream/api/live/nowplaying/websocket',
    apiKey: '8fe3697a1e1fa55b:ae3c046191c39f0260307692a17554a7'
  }
};
