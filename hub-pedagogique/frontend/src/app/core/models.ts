export type Category = 'COURS' | 'TP' | 'PROJET';

export interface Ressource {
  id: string;
  title: string;
  description: string;
  category: Category;
  author: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  resourceId: string;
  author: string;
  content: string;
  createdAt: string;
}
