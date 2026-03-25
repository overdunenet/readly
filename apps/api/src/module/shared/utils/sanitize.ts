import DOMPurify from 'isomorphic-dompurify';

/**
 * HTML 태그를 제거하고 공백을 정리합니다.
 * DOMPurify 기반 서버 사이드 입력 정제 유틸 (XSS 방어).
 */
export function stripHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}
