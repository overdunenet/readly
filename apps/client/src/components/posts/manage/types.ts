export type PostStatus = 'draft' | 'published' | 'scheduled';
export type PostAccessLevel = 'public' | 'subscriber' | 'purchaser' | 'private';

export interface PostItem {
  id: string;
  title: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  accessLevel: PostAccessLevel;
  status: PostStatus;
  price: number;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  createdAt: Date | string;
}
