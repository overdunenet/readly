export const ACCESS_LEVEL_OPTIONS = [
  { value: 'public', label: '전체 공개', description: '누구나 볼 수 있습니다' },
  {
    value: 'subscriber',
    label: '구독자 전용',
    description: '구독자만 볼 수 있습니다',
  },
  {
    value: 'purchaser',
    label: '구매자 전용',
    description: '개별 구매한 사람만 볼 수 있습니다',
  },
  { value: 'private', label: '비공개', description: '작성자만 볼 수 있습니다' },
] as const;

// 발행 기본 설정용 (private 제외 — 발행 기본값으로 비공개는 부적절)
export const PUBLISH_ACCESS_LEVEL_OPTIONS = ACCESS_LEVEL_OPTIONS.filter(
  (o) => o.value !== 'private',
);

export type AccessLevelOption = (typeof ACCESS_LEVEL_OPTIONS)[number];
