export interface IPost {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt?: Date;
}
