// interfaces/settings.model.ts
export interface SiteSettings {
  stationName: string;
  stationSlogan: string;
  streamUrl: string;
  heroImage?: string;

  // Contact Information
  phone: string;
  email: string;
  address: string;

  // Social Media Links

    facebookUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;


  // Additional Settings
  organizerName?: string;
  supportEmail?: string;
  businessHours?: string;
}


export interface NotificationSetting {
  id: number;
  label: string;
  description: string;
  enabled: boolean;
}

export interface InitialValues {
  station: {
    stationName: string;
    stationSlogan: string;
    streamUrl: string;
  };
  design: {
    heroImage: string | null;
  };
  notifications: NotificationSetting[];
}
