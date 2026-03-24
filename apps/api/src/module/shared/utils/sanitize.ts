/**
 * HTML 태그를 제거하고 공백을 정리합니다.
 * XSS 방어를 위한 서버 사이드 입력 정제 유틸.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}
