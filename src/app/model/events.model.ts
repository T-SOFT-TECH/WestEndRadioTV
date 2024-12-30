export interface Events {
  $id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  imageId?: string;
  featured: boolean;
  active: boolean;
  slug: string;
  category: string;
  ticketLink?: string;
  organizer: string;
}
