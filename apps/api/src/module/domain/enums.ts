// 서점 언어 코드
export enum Language {
  KO = 'ko',
  EN = 'en',
}

// 발행 디폴트용 접근 레벨 (private 제외)
export enum PublishAccessLevel {
  PUBLIC = 'public',
  SUBSCRIBER = 'subscriber',
  PURCHASER = 'purchaser',
}

// 연령 등급
export enum AgeRating {
  ALL = 'all',
  ADULT = 'adult',
}
