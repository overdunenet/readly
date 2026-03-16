// Node.js 18+ 내장 fetch API 타입 선언
// @types/node 버전이 낮아 global fetch 타입이 없어 별도 선언
declare function fetch(
  input: string | URL,
  init?: RequestInit
): Promise<Response>;
