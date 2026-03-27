import { z } from 'zod';

// Form validation schema
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이하로 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  accessLevel: z.enum(['public', 'subscriber', 'purchaser', 'private'], {
    required_error: '접근 권한을 선택해주세요',
  }),
  price: z.number().min(0, '가격은 0원 이상이어야 합니다').optional(),
});

export type CreatePostForm = z.infer<typeof createPostSchema>;
