# Information Architecture Table

> 자동 생성 문서 - 직접 수정 금지
> 원본: screen-index.yml

| Feature | 화면 ID | 화면명             | Route                           | 설명                                                                            |
| ------- | ------- | ------------------ | ------------------------------- | ------------------------------------------------------------------------------- |
| auth    | SCR-001 | 로그인             | `/login`                        | 한국(🇰🇷)/외국인(🌏) 국가 선택 → 소셜 로그인 버튼(국가별) + 전화번호 로그인 선택 |
| auth    | SCR-002 | 전화번호 인증      | `/login/phone`                  | 국가코드 + 전화번호 입력 → SMS 발송                                             |
| auth    | SCR-003 | OTP 입력           | `/login/phone/verify`           | SMS 인증코드 6자리 입력, 유효시간 3분, 최대 5회 시도, 재발송(60초 쿨다운)       |
| auth    | SCR-004 | 닉네임 설정        | `/onboarding/nickname`          | 최초 가입 시 닉네임 + 프로필 이미지 설정                                        |
| auth    | SCR-005 | 프로필 편집        | `/settings/profile`             | 닉네임/이미지 수정                                                              |
| auth    | SCR-006 | 성인 인증 안내     | (모달)                          | 성인 콘텐츠 접근 시 인증 필요 안내                                              |
| auth    | SCR-007 | 성인 인증 - 한국   | `/settings/adult-verify/kr`     | NICE/KCB 통신사 본인확인 (만 19세 이상, 유효기간 1년)                           |
| auth    | SCR-008 | 성인 인증 - 글로벌 | `/settings/adult-verify/global` | 여권 촬영/업로드 → AWS Textract AnalyzeID (Bytes direct) → 만 20세 이상 판정    |
| auth    | SCR-009 | 회원 탈퇴          | `/settings/withdrawal`          | 탈퇴 사유 선택 → 탈퇴 요청 제출 → 즉시 로그아웃                                 |
| auth    | SCR-010 | 설정 메인          | `/settings`                     | 프로필/성인인증/탈퇴 등 진입점                                                  |
