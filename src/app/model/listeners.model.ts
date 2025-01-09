// src/app/model/listeners.model.ts

export interface Listener {
  ip: string;
  user_agent: string;
  hash: string;
  mount_is_local: boolean;
  mount_name: string;
  connected_on: number;
  connected_until: number;
  connected_time: number;
  device: {
    is_browser: boolean;
    is_mobile: boolean;
    is_bot: boolean;
    client: string;
    browser_family: string;
    os_family: string;
  };
  location: {
    city: string;
    region: string;
    country: string;
    description: string;
    lat: number;
    lon: number;
  };
}

// Optional: Add some helper interfaces for nested objects
export interface ListenerDevice {
  is_browser: boolean;
  is_mobile: boolean;
  is_bot: boolean;
  client: string;
  browser_family: string;
  os_family: string;
}

export interface ListenerLocation {
  city: string;
  region: string;
  country: string;
  description: string;
  lat: number;
  lon: number;
}
