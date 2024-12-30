export interface News {
  $id?: string;
  title: string;
  content: string;
  summary: string;
  imageId?: string;
  publishDate: string;
  author: string;
  tags: string[];
  featured: boolean;
  active: boolean;
  slug: string;
}


