export interface Show {
  id?: string;
  collectionId?: string;
  collectionName?: string;
  title: string;
  host: string;
  description: string;
  startTime: string;
  endTime: string;
  days: string[];
  image?: string;
  active: boolean;
  featured: boolean;
  slug?: string;
  hostImages?: string
}