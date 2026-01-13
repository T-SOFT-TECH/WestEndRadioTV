export interface Events {
  id?: string;
  collectionId?: string;
  collectionName?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  image?: string;
  featured: boolean;
  active: boolean;
  slug: string;
  category: string;
  ticketLink?: string;
  organizer: string;
}