import { z } from 'zod';

export const nicknameSchema = z
  .string()
  .trim()
  .min(1, '닉네임을 입력해주세요')
  .max(30, '닉네임은 30자 이내로 입력해주세요')
  .regex(/^[가-힣a-zA-Z0-9_]+$/, '한글, 영문, 숫자, 밑줄만 사용 가능합니다');
