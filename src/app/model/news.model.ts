export interface News {
  id?: string;
  collectionId?: string;
  collectionName?: string;
  title: string;
  content: string;
  summary: string;
  image?: string;
  publishDate: string;
  author: string;
  tags: string[];
  featured: boolean;
  active: boolean;
  slug: string;
}