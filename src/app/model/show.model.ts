export interface Show {
  $id?: string;
  title: string;
  host: string;
  description: string;
  startTime: string;
  endTime: string;
  days: string[];
  imageId?: string;
  active: boolean;
  featured: boolean;
  slug?: string;
  hostImages?: string
}
