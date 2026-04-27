# Dart Finance — Execution Update v1.3

> **SUPERSEDED** — This document captured early decisions as of 2026-04-22. For current status see `50_Current_Status_2026-04-27.md`. Kept for historical reference.

Version 1.3 · 2026-04-22  
Owner: Seungjae  
Status: Pre-MVP execution lock (historical)

---

## 0. 이 문서는 무엇인가

이 문서는 기존 `00_Dart_Finance_Master_Report_v1_2.md`를 실제 실행 단계로 옮기기 위한 **결정 확정 + 범위 축소 + 실행 가이드 문서**다.

목적은 세 가지다.

1. 아직 열려 있던 핵심 의사결정을 확정한다.
2. MVP 범위를 1인 개발 가능한 수준으로 다시 잠근다.
3. 오늘부터 2주간 무엇을 해야 하는지 실행 순서로 정리한다.

이 문서는 기존 마스터 문서를 대체하지 않는다.  
대신 **v1.2의 실행 잠금판(execution lock)** 으로 사용한다.

---

## 1. 이번 버전에서 확정된 핵심 결정

| 항목 | 확정 결정 |
|---|---|
| 초기 1차 시장 | **네덜란드 고정** |
| 2차 확장 시장 | **영어권 EU 전체** |
| 초기 CSV 지원 | **ING + Trading 212만 지원** |
| Safe-to-spend 투자 보호 정책 | **planned investing 기본 보호** |
| 투자 보호 옵션 | **사용자 토글로 해제 가능** |
| Safe-to-spend 기준 모델 | **월말 기준이 아니라 payday 기준** |
| 개발 순서 | **출시는 web + mobile 동시 가능, 개발 순서는 web-first** |
| 첫 6주 우선순위 | **엔진 신뢰도 > import UX > 홈 화면** |

---

## 2. 제품 정의 — 실행 관점에서 다시 잠금

### 한 줄 정의

> **A calm money app that tells you what you can safely spend today — without ignoring your investments.**

### 내부 정의

> **An investor-aware cashflow confidence app for employed people in the Netherlands, built web-first and launched with manual + CSV workflows.**

### V1에서 절대 흔들리면 안 되는 핵심

1. 투자 이체가 일반 지출로 계산되지 않아야 한다.
2. safe-to-spend 숫자는 설명 가능해야 한다.
3. CSV import 이후 유저가 숫자를 직접 검토할 수 있어야 한다.
4. 모바일 홈에서는 안심하고 쓸 수 있는 금액이 가장 먼저 보여야 한다.
5. 웹에서는 그 숫자의 근거를 드릴다운으로 확인할 수 있어야 한다.

---

## 3. 시장 전략 수정본

### 3.1 초기 시장

초기 시장은 **네덜란드 단일 시장**으로 고정한다.

이유:
- 실제 사용자 문제와 CSV 포맷 가설을 가장 빨리 검증할 수 있음
- 현지 은행/투자 습관에 맞는 import UX를 좁게 설계 가능
- GDPR/결제/카피/브랜드 메시지의 초기 범위를 줄일 수 있음
- 제품 신뢰도 검증 전에 국가 범위를 넓히지 않아도 됨

### 3.2 확장 시장

네덜란드 private beta 및 초기 공개 출시 이후, 다음 확장 대상은 **영어권 EU 사용자**다.

우선순위:
1. Netherlands
2. English-speaking EU users living in NL or nearby EU markets
3. Full English-first EU rollout
4. Dutch/Korean localization expansion

### 3.3 언어 전략

- **V1**: 영어 기본
- **V1.5**: 네덜란드어 / 한국어 추가

---

## 4. MVP 범위 수정본

### 4.1 CSV 범위 축소

초기 CSV 지원은 아래 두 개만 한다.

- **ING**
- **Trading 212**

초기 제외:
- Rabobank
- DeGiro

이유:
- 생활비 계좌 + 투자 계좌라는 핵심 사용자 스토리를 가장 빨리 검증할 수 있음
- parser 수를 줄이면 import review UX와 dedup 품질에 더 집중 가능
- 1인 개발 기준으로 회귀 테스트 범위를 줄일 수 있음

### 4.2 핵심 화면 5개만 우선 확정

V1 설계에서 먼저 확정할 화면은 아래 5개뿐이다.

1. **모바일 홈** — Safe to spend today
2. **모바일 Quick Add Expense**
3. **웹 Transactions / Import Review**
4. **웹 CSV Field Mapping**
5. **웹 Why this number?**

초기에는 15개 전체를 확정하지 않는다.  
핵심 5개만 먼저 확정하고, 나머지는 엔진과 import UX가 안정화된 뒤 확장한다.

### 4.3 web-first 개발 원칙

출시 플랫폼은 web + mobile이지만, 개발 순서는 아래처럼 고정한다.

#### 먼저 만드는 것
- web onboarding
- web accounts setup
- web CSV import
- web transaction review
- web safe-to-spend drill-down

#### 나중에 붙이는 것
- mobile home
- mobile quick add
- mobile recent transactions
- mobile upcoming bills

이유:
- 엔진 검증이 웹에서 훨씬 빠름
- CSV mapping/review는 웹이 UX상 더 적합함
- 모바일을 먼저 만들면 예쁜 홈 화면만 있고 신뢰성은 비는 상태가 되기 쉬움

---

## 5. Safe-to-spend 정책 잠금

이 섹션은 v1.2에서 열려 있던 내용을 이번 버전에서 제품 정책으로 좁힌다.

### 5.1 기본 모델

**payday 기준 모델**을 기본으로 사용한다.

즉, safe-to-spend는 월말까지가 아니라 **다음 월급일까지 안전하게 쓸 수 있는 하루 예산 가이드**다.

### 5.2 planned investing 처리

planned investing은 기본적으로 **보호 항목**이다.

즉,
- 사용자가 월 투자 계획을 €800로 설정하면
- safe-to-spend 계산에서 이 금액은 기본적으로 보호된다.
- 단, 사용자가 설정에서 이 보호를 끄면 해제 가능하다.

### 5.3 정책 문장

앱 내 설명 문구는 아래 방향으로 간다.

> Safe to spend is a conservative daily guide based on your cash, upcoming obligations, and planned investing until payday.

중요:
- wealth guarantee처럼 들리면 안 됨
- “정확한 미래 보장”이 아니라 “보수적 cashflow confidence number”여야 함

### 5.4 포함/제외 기준

#### 기본 포함
- checking
- cash
- user-enabled accessible savings

#### 기본 보호
- upcoming recurring bills before next payday
- sinking fund allocation
- minimum cash buffer
- planned investing contribution
- unreviewed anomalies reserve

### 5.5 계산 원칙

1. **Trust over cleverness**
2. **Policy before math**
3. **Visible assumptions**
4. **User override where safe**
5. **First trusted number matters more than advanced optimization**

---

## 6. 이번 버전에서 문서 구조상 수정해야 할 것

기존 `00_Dart_Finance_Master_Report_v1_2.md`를 다음처럼 해석/수정한다.

### 수정 1 — 초기 진입 시장 문구
기존:
- 네덜란드를 테스트 마켓, 영어 기본 + 네덜란드어/한국어 V1.5

수정:
- **초기 1차 시장은 네덜란드로 고정**
- **2차 확장은 영어권 EU**
- 영어 기본, 네덜란드어/한국어는 V1.5

### 수정 2 — CSV 범위
기존:
- ING, Rabobank, T212, DeGiro 최소

수정:
- **ING + T212만 V1 지원**
- Rabobank, DeGiro는 V1.5 이후

### 수정 3 — 화면 범위
기존:
- 15개 핵심 화면 전체를 초기에 설계

수정:
- **핵심 화면 5개만 우선 확정**
- 나머지는 엔진/수입력 안정화 뒤 추가

### 수정 4 — 개발 순서
기존:
- web + mobile 동시 릴리즈

수정:
- **릴리즈 채널은 동시 가능**
- **개발은 web-first로 고정**

### 수정 5 — safe-to-spend 우선순위
기존:
- 중요한 항목이지만 next action 중 하나

수정:
- **`23_Safe_To_Spend_Engine_Spec.md`가 가장 먼저 와야 함**
- 디자인 탐색보다 먼저 정책 정의와 테스트 케이스를 작성

---

## 7. 오늘 해야 할 것 — 상세 가이드

오늘 목표는 “생각을 더 많이 하는 것”이 아니라 **실행 준비 문서 2개와 범위 잠금 3개를 끝내는 것**이다.

### 7.1 `01_Product_Brief.md` 작성

목표: 긴 마스터 문서를 1페이지짜리 제품 기준서로 압축

#### 포함할 항목
- 문제 정의 (2–3문장)
- 타깃 유저 (1문장)
- 포지셔닝 (1문장)
- 핵심 차별점 5개
- 6개월 목표
- V1 포함/제외
- 초기 시장/확장 시장
- 성공 지표 3개

#### 작성 원칙
- 마케팅 문구 말고 의사결정 문서처럼 쓸 것
- Lars 같은 primary persona가 이해되는 수준으로 구체적으로 쓸 것
- “무엇을 하지 않을지”도 반드시 포함할 것

#### 완료 기준
- 한 페이지 안에 읽힘
- 외부 협업자나 AI 에이전트가 읽고 제품을 오해하지 않음

---

### 7.2 `23_Safe_To_Spend_Engine_Spec.md` 초안 작성

목표: Dart Finance의 핵심 숫자가 어떤 정책으로 계산되는지 확정

#### 반드시 써야 하는 항목
1. 제품 정의
2. 입력 데이터 정의
3. payday 기준 계산 이유
4. planned investing 기본 보호 정책
5. accessible savings 포함 규칙
6. anomalies reserve 정의
7. reimbursement pending 처리 원칙
8. edge cases 목록
9. UI 드릴다운 구조
10. 테스트 시나리오 목록

#### 첫 초안에서 답해야 하는 질문
- 월급일이 여러 개인 경우는?
- 월급이 늦게 들어오면?
- savings를 100% 쓸 수 없는 경우는?
- planned investing 보호를 끄면 UI에 어떤 경고를 보여야 하나?
- 미분류 거래가 많으면 safe-to-spend를 줄일 것인가?

#### 완료 기준
- 수식보다 정책이 먼저 보임
- 어떤 거래가 왜 포함/제외되는지 설명 가능함
- 테스트 케이스로 바로 전환 가능함

---

### 7.3 CSV 범위 잠금

오늘 안에 아래를 확정 문장으로 문서에 넣는다.

> V1 CSV support is limited to ING and Trading 212 only.

#### 같이 정할 것
- ING에서 필수 컬럼
- T212에서 필수 컬럼
- import history 저장 여부
- duplicate detection 기준
- import review에서 수정 가능한 필드

---

### 7.4 핵심 화면 5개만 남기기

오늘 해야 할 일은 “모든 화면 그리기”가 아니다.  
문서에서 **핵심 화면 5개**를 별도 섹션으로 뽑아 확정하는 것이다.

#### 산출물 예시
- `12_Wireframes/Core_5_Screens.md`
- 또는 `11_User_Flows.md` 안에 우선순위 표시

---

### 7.5 web-first 문구 명시

오늘 안에 문서에 아래 문장을 명시한다.

> Web is the primary build surface for the first 6 weeks. Mobile is attached after the core engine and import review loop are trusted.

---

## 8. 이번 주 해야 할 것 — 상세 가이드

### 8.1 `21_Data_Model.md` 작성

목표: Drizzle 스키마 수준의 실무 설계로 바꾸기

#### 최소 포함 테이블
- users
- accounts
- transactions
- import_batches
- import_rows
- transfer_links
- reimbursement_links
- recurring_series
- categories
- rules
- budget_periods
- sinking_funds
- safe_to_spend_snapshots
- audit_logs

#### transactions에 최소 필요한 필드
- id
- user_id
- account_id
- source
- external_id
- occurred_at
- settled_at
- amount
- currency
- merchant_name
- raw_description
- normalized_description
- intent
- category_id
- import_batch_id
- review_status
- notes
- created_at
- updated_at

#### 완료 기준
- Drizzle schema로 옮길 수 있음
- RLS 정책 초안 작성이 가능함
- CSV parser와 연결되는 필드가 명확함

---

### 8.2 Lars 인터뷰 3명

목표: 문제의 진짜 강도와 숫자 신뢰 포인트 확인

#### 질문 예시
1. 지금 돈 관리는 뭘로 하나?
2. 투자 이체가 지출처럼 보이는 게 불편했던 적 있나?
3. CSV 업로드는 괜찮나?
4. “오늘 얼마 써도 되는지” 숫자 하나가 뜨면 믿을 것 같나?
5. 어떤 조건이면 그 숫자를 못 믿게 될 것 같나?
6. recurring bill 등록은 귀찮은가, 필요한가?
7. 지금 쓰는 앱의 제일 짜증나는 점은 뭔가?

#### 목표
- 인터뷰 후 safe-to-spend 정책을 더 보수적으로 할지 판단
- onboarding에서 꼭 필요한 입력만 남김

---

### 8.3 monorepo 초기 세팅

목표: 설계 문서가 아니라 실제 개발 가능한 뼈대 만들기

#### 작업 순서
1. GitHub repo 생성
2. Turborepo + pnpm 초기화
3. `apps/web` 생성
4. `apps/mobile` 생성
5. `packages/core` 생성
6. `packages/db` 생성
7. `packages/ui` 생성
8. `packages/csv-parsers` 생성
9. ESLint / TSConfig / Prettier / Tailwind 공유 설정
10. Supabase 프로젝트 생성

#### 완료 기준
- `pnpm install` 정상
- `pnpm build` 기본 통과
- web과 mobile 앱이 빈 화면으로라도 실행됨

---

### 8.4 safe-to-spend 테스트 케이스 30–50개 먼저 작성

목표: 구현 전에 실패 조건을 먼저 고정

#### 최소 테스트 묶음
- salary before/after payday
- transfer between checking and brokerage
- investment contribution protected by default
- planned investing toggle off
- dividend inflow handling
- refund handling
- reimbursement_out / reimbursement_in matching
- annual insurance sinking allocation
- missing recurring bill data
- negative cash scenario
- accessible savings included / excluded
- multiple accounts active
- unreviewed anomalies reserve applied

#### 원칙
- 테스트가 먼저
- 구현은 나중
- 수식이 아니라 사용자 신뢰가 깨지는 상황부터 테스트

---

## 9. 다음 2주 해야 할 것 — 상세 가이드

### 9.1 web onboarding + CSV import + why this number

#### 먼저 만들 기능
1. 회원가입 / 로그인
2. payday 설정
3. 월 수입 입력
4. 최소 cash buffer 입력
5. planned investing 입력
6. 계좌 추가
7. CSV 업로드
8. 필드 매핑
9. import review
10. safe-to-spend 계산
11. why this number 드릴다운

#### 여기서 중요한 것
- 예쁜 대시보드보다 import review와 drill-down이 먼저
- 분류 실패 거래를 숨기지 말고 needs attention으로 보여줄 것
- 첫 숫자가 왜 나왔는지 반드시 설명할 것

---

### 9.2 mobile home + quick add

목표: 모바일은 판단과 빠른 입력만 담당

#### V1 모바일 포함
- home
- quick add expense
- recent transactions
- upcoming bills

#### V1 모바일 제외
- 복잡한 analytics
- 깊은 투자 분석
- 세세한 import 관리

#### 완료 기준
- 사용자가 앱을 열고 3초 안에 오늘 사용 가능 금액을 볼 수 있음
- quick add가 5초 이내로 끝남

---

### 9.3 private beta 준비

#### 준비물
- beta signup form
- onboarding email
- feedback form
- support email
- PostHog 핵심 이벤트
- Sentry 연결
- privacy policy 초안
- terms 초안

#### beta 목표
- 사용자 수보다 **숫자 신뢰와 onboarding completion** 확인
- 첫 safe-to-spend 숫자에 대한 신뢰 피드백 수집

---

## 10. 첫 6주 우선순위

### 우선순위 순서
1. **Safe-to-spend engine spec**
2. **테스트 케이스**
3. **웹 onboarding**
4. **CSV import + review**
5. **Why this number**
6. **모바일 홈**
7. **모바일 quick add**

### 하지 말 것
- 4개 이상 CSV 지원
- bank sync 탐색
- forecast 고도화
- deep portfolio analytics
- household/shared features
- AI chat surface 추가
- branding polishing에 과몰입

---

## 11. 지금 바로 사용할 체크리스트

### 오늘
- [ ] `01_Product_Brief.md` 작성
- [ ] `23_Safe_To_Spend_Engine_Spec.md` 초안 작성
- [ ] CSV 범위 ING + T212로 문서 수정
- [ ] 핵심 화면 5개만 별도 우선순위로 고정
- [ ] web-first 개발 원칙 문서에 반영

### 이번 주
- [ ] `21_Data_Model.md` 작성
- [ ] Lars 인터뷰 3명 진행
- [ ] monorepo 초기 세팅
- [ ] safe-to-spend 테스트 케이스 30–50개 작성

### 다음 2주
- [ ] web onboarding 구현
- [ ] CSV import + field mapping 구현
- [ ] why this number 구현
- [ ] mobile home 구현
- [ ] mobile quick add 구현
- [ ] private beta 준비

---

## 12. 마지막 원칙

Dart Finance의 MVP는 “예쁜 돈 앱”이 아니다.

Dart Finance의 MVP는:
- 투자 이체를 지출로 오해하지 않고
- 다음 월급일까지
- 사용자가 믿을 수 있는
- 보수적인 safe-to-spend 숫자를 주는 것

이 숫자가 맞는다고 느껴지면, 나머지 기능은 나중에 붙일 수 있다.  
이 숫자가 못 믿겠으면, 아무리 UI가 좋아도 리텐션은 생기지 않는다.

