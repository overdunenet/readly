---
name: wireframe
description: PRD screens.yml 기반 HTML 화면 구조도(와이어프레임) 자동 생성. 뷰포트 선택, 디자인 원칙, 컴포넌트 패턴 제공.
keywords: [wireframe, 와이어프레임, 화면구조도, 목업, screens, HTML, 디자인, UI]
estimated_tokens: ~1500
---

# 와이어프레임 생성 Skill

> PRD Phase C에서 screens.yml 작성 후, 화면 구조도(wireframes.html)를 자동 생성한다.
> pm-planner Agent가 PRD 워크플로우 중 이 Skill을 참조한다.

## 생성 트리거

<rules>

| 조건                              | 동작                               |
| --------------------------------- | ---------------------------------- |
| Phase C에서 screens.yml 작성 완료 | 뷰포트 선택 → wireframes.html 생성 |
| screens.yml 수정 (Edit Task)      | wireframes.html 재생성 여부 확인   |
| screens.yml이 없는 Feature        | 와이어프레임 생성 건너뛰기         |

</rules>

## 뷰포트 선택 프로세스

<instructions>

screens.yml 작성 완료 후, 와이어프레임 생성 전에 PM에게 뷰포트를 선택받는다.

### Step 1: 뷰포트 선택 질문

AskUserQuestion으로 아래 선택지를 제시한다:

```
이 Feature의 화면들을 어떤 뷰포트로 보시겠어요?

1. 모바일 전용 (Phone 375px)
2. PC 전용 (Desktop 1280px)
3. 모바일 + PC 둘 다
4. 화면별로 개별 선택
```

### Step 2: 화면별 개별 선택 (4번 선택 시)

각 화면에 대해 뷰포트를 개별 선택받는다:

```
SCR-001 로그인       → [모바일 / PC / 둘 다]?
SCR-002 전화번호 인증 → [모바일 / PC / 둘 다]?
...
```

### Step 3: 선택 결과 기록

뷰포트 선택 결과는 wireframes.html 내부 주석에 기록한다:

```html
<!-- viewport-config: { default: "mobile", overrides: { "SCR-003": "desktop" } } -->
```

screens.yml은 수정하지 않는다. 뷰포트는 화면 정의가 아니라 표현 방식의 문제이다.

</instructions>

## HTML 구조 규칙

<instructions>

### 파일 구조

wireframes.html은 외부 의존성 없는 단일 HTML 파일이다:

```
Feature_PRD/feature#{N}_{name}/
├── PRD.md
├── screens.yml
├── events.yml
└── wireframes.html  ← 이 파일
```

### 나래비 레이아웃

화면들을 CSS Grid로 나란히 배치한다:

- 모바일 프레임: 약 260px 너비 (실제 375px의 ~70% 축소)
- PC 프레임: 약 480px 너비 (실제 1280px의 ~37% 축소)
- 카드 간 간격: 24px
- 그리드: auto-fill, 뷰포트에 맞게 자동 줄바꿈

### Phone Frame

모바일 화면을 실제 스마트폰처럼 감싼다:

- 둥근 모서리 (border-radius: 24px)
- 상단 노치/상태바 표현 (시간, 배터리 등)
- 하단 홈 인디케이터
- 그림자 (box-shadow)

### Desktop Frame

PC 화면을 브라우저 창처럼 감싼다:

- 브라우저 상단바 (주소창, 탭)
- 직각 또는 약간 둥근 모서리

### 화면 상태 표현

같은 화면의 상태들은 나란히 배치한다:

- 각 상태가 별도 카드로 표시
- 상태명을 카드 상단에 라벨로 표시
- 같은 화면의 상태들은 시각적으로 그룹핑 (배경색 또는 테두리)

### 화면 메타 정보

각 프레임 아래에 표시:

- 화면 ID (SCR-001)
- 화면명
- Route (/login)
- 상태명 (기본, 에러, 로딩 등)

### 공통 영역 섹션

wireframes.html 상단에 공통 UI 요소를 별도로 정의:

- Header (네비게이션 바)
- 모달 기본 형태
- 각 화면에서는 이 공통 영역을 포함하여 표시

### 공통 패턴 섹션

wireframes.html 하단에 반복 사용되는 패턴을 별도로 정의:

- 에러 토스트/배너
- 빈 상태 (Empty State) 기본형
- 리스트 스크롤 힌트

</instructions>

## Readly 비주얼 디자인 원칙

<rules>

와이어프레임 생성 시 아래 원칙을 적용하여 일관되고 감각적인 화면을 구성한다.

### 1. 여백이 콘텐츠를 말한다 (Breathing Space)

- 요소 사이에 충분한 여백을 두어 시각적 피로를 줄인다
- 여백은 "빈 공간"이 아니라 콘텐츠에 집중하게 하는 장치
- 섹션 간 간격 > 요소 간 간격 > 줄 간격 (계층적 여백)

### 2. 하나의 화면, 하나의 집중 (Single Focus)

- 각 화면에는 사용자가 "가장 먼저 해야 할 것"이 하나 있다
- 그것을 가장 눈에 띄게, 나머지는 조용하게
- CTA 위치는 맥락에 따라 유연하게:
  - 짧은 화면: 콘텐츠 흐름 끝에 자연스럽게
  - 긴 폼: 필요시 하단 고정
  - 콘텐츠 상세: 인라인으로 흐름 속에 배치
  - 탐색 화면: 카드/아이템 내부에 포함

### 3. 시각적 위계로 안내한다 (Visual Hierarchy)

- 크기, 굵기, 색상으로 정보의 중요도를 표현
- 4단계 이내: 제목 → 부제 → 본문 → 보조텍스트
- 색상은 의미가 있을 때만 사용 (장식용 X)

### 4. 정렬이 신뢰를 만든다 (Alignment)

- 모든 요소는 보이지 않는 그리드에 맞춰 정렬
- 같은 유형의 요소 = 같은 크기, 같은 간격, 같은 스타일
- 예외는 "의도적 강조"일 때만

### 5. 색상은 절제한다 (Color Restraint)

- 기본: 흰색/회색 톤 + Primary 1색 (#2563eb, blue-600)
- 상태 표현에만 추가 색상: 성공(green), 위험(red)
- 배경은 중립적으로, 콘텐츠가 주인공

### 6. 자연스러운 시선 흐름 (Eye Flow)

- 위에서 아래로 자연스럽게 읽히는 구조
- 중요한 것은 스크롤 없이 보이는 영역에 배치
- 관련 정보끼리 근접 배치 (Proximity 원칙)

### 7. 글은 읽히게 (Typography Rhythm)

- 줄 간격은 넉넉하게, 한 줄은 너무 길지 않게
- 제목은 짧고 명확하게, 설명은 부드럽게
- 폰트 사이즈 변화로 정보의 깊이를 표현

</rules>

## 디자인 토큰

<rules>

wireframes.html의 CSS에 아래 토큰을 CSS 변수로 내장한다:

| 토큰                     | 값      | 용도                  |
| ------------------------ | ------- | --------------------- |
| `--color-primary`        | #2563eb | 주요 액션, 포커스     |
| `--color-primary-light`  | #eff6ff | 선택 상태 배경        |
| `--color-bg-page`        | #f9fafb | 페이지 배경           |
| `--color-bg-card`        | #ffffff | 카드/모달 배경        |
| `--color-border`         | #e5e7eb | 구분선, 테두리        |
| `--color-text-primary`   | #111827 | 제목, 강조 텍스트     |
| `--color-text-secondary` | #374151 | 본문 텍스트           |
| `--color-text-muted`     | #6b7280 | 보조 텍스트           |
| `--color-success`        | #16a34a | 성공 상태             |
| `--color-danger`         | #ef4444 | 위험/에러 상태        |
| `--space-xs`             | 4px     | 최소 간격             |
| `--space-sm`             | 8px     | 작은 간격             |
| `--space-md`             | 16px    | 기본 간격             |
| `--space-lg`             | 24px    | 큰 간격               |
| `--space-xl`             | 32px    | 섹션 간격             |
| `--header-height`        | 56px    | 헤더 높이             |
| `--radius-sm`            | 6px     | 작은 라운딩           |
| `--radius-md`            | 12px    | 기본 라운딩           |
| `--radius-lg`            | 24px    | 큰 라운딩 (폰 프레임) |

</rules>

## 컴포넌트 패턴

<rules>

와이어프레임에서 사용하는 UI 컴포넌트 기본 형태:

| 컴포넌트           | 스타일                                                 |
| ------------------ | ------------------------------------------------------ |
| Header             | 56px 높이, 흰색 배경, 하단 border, 로고/검색/유저 영역 |
| Button (Primary)   | primary색 배경, 흰색 텍스트, 라운딩                    |
| Button (Secondary) | 흰색 배경, gray border, 회색 텍스트                    |
| Button (Danger)    | 빨간색 텍스트 또는 배경                                |
| Input              | gray border, 라운딩, 포커스 시 primary ring            |
| Card               | 흰색 배경, 라운딩, 그림자 또는 border                  |
| Badge              | 작은 텍스트, 색상 배경 (상태별)                        |
| Modal              | 중앙 배치, 흰색 카드, 어두운 오버레이                  |
| List Item          | border-bottom 구분, 패딩 일정                          |
| Avatar             | 원형, gray 배경, 이니셜 또는 아이콘                    |

모달 화면은 나래비에서 독립 카드로 표시하되, "모달" 라벨을 붙인다.
리스트 화면은 3-4개 아이템만 표시하고, 하단에 스크롤 힌트(그라데이션 페이드)를 넣는다.

</rules>

## 체크리스트

<checklist>

### 생성 전

- [ ] screens.yml이 존재하는가?
- [ ] PM에게 뷰포트 선택을 받았는가?

### 생성 후

- [ ] wireframes.html이 외부 의존성 없이 단독으로 브라우저에서 열리는가?
- [ ] 모든 화면(SCR-\*)이 나래비에 포함되었는가?
- [ ] 각 화면의 기본 상태가 시각화되었는가?
- [ ] 주요 상태(에러, 빈 상태 등)도 포함되었는가?
- [ ] 화면 메타 정보(ID, 이름, Route)가 표시되었는가?
- [ ] 공통 영역(Header 등)이 일관되게 적용되었는가?
- [ ] 비주얼 디자인 원칙 7가지가 반영되었는가?

</checklist>

## 관련 문서

| 문서                                                 | 설명                               |
| ---------------------------------------------------- | ---------------------------------- |
| `planning/prd-workflow.md`                           | Phase C에서 와이어프레임 생성 호출 |
| `planning/SKILL.md`                                  | PM 워크플로우 진입점               |
| `PM-DOCS/Planning/templates/wireframe-template.html` | HTML 기본 골격                     |
