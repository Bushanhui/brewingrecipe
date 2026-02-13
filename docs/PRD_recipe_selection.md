# PRD: 브루잉 레시피 선택 기능

## 1. 배경 및 목적

### 현재 상태
- 단일 HTML 파일로 구성된 정적 브루잉 계산기
- 계산 공식이 1개로 하드코딩 (Bloom=원두x3, 나머지를 3등분 후 보정)
- GitHub Pages로 배포, 백엔드 없음

### 목표
유명 바리스타들의 브루잉 레시피를 저장해두고, 사용자가 원하는 레시피를 선택하면 해당 공식에 따라 각 단계별 물 양을 계산하여 보여준다.

### 예시 시나리오
| 레시피 | Bloom | Pour 구성 | 특징 |
|--------|-------|-----------|------|
| 기존 공식 | 원두x3 | 3회 (보정값 적용) | 현재 앱의 공식 |
| James Hoffmann V60 | 원두x2 | 1회차 60% → 2회차 40% | 단순 2단계 |
| Tetsu Kasuya 4:6 | 원두x3 | 4:6 비율로 5회 분할 | 맛/농도 분리 조절 |
| Scott Rao V60 | 원두x3 | 1회 연속 주입 | bloom 후 원푸어 |

> 레시피마다 **단계 수, 각 단계의 비율, 보정 로직**이 모두 다르다.

---

## 2. 사용자 스토리

1. 사용자는 레시피 목록에서 원하는 바리스타의 레시피를 선택할 수 있다.
2. 사용자는 원두량과 비율을 입력한 후 Calculate을 누르면, 선택한 레시피의 공식에 따른 단계별 물 양을 확인한다.
3. (향후) 관리자는 새로운 레시피를 추가/수정/삭제할 수 있다.

---

## 3. 레시피 데이터 모델

```
Recipe {
  id: string               // 고유 식별자
  name: string              // "James Hoffmann V60"
  author: string            // "James Hoffmann"
  description: string       // 레시피 간단 설명
  default_ratio: number     // 권장 비율 (예: 15)
  steps: Step[]             // 단계 배열 (가변 길이)
}

Step {
  order: number             // 순서
  name: string              // "Bloom", "First Pour" 등
  type: "bloom" | "pour"    // 단계 유형
  amount_formula: object    // 물 양 계산 방법 (아래 참조)
}
```

### amount_formula 설계

레시피마다 계산 방식이 다르므로, 안전하고 유연한 구조가 필요하다.

```
// 방식 A: 원두 무게 기반 배수
{ "method": "multiply_bean", "factor": 3 }
// → beanWeight * 3 = bloom 양

// 방식 B: 전체 물 양 대비 비율
{ "method": "ratio_of_total", "ratio": 0.6 }
// → totalWater * 0.6

// 방식 C: 남은 물 양 대비 비율 (이전 단계까지 부은 양 제외)
{ "method": "ratio_of_remaining", "ratio": 0.5 }
// → (totalWater - 이전 단계 합계) * 0.5

// 방식 D: 남은 물 전부
{ "method": "remainder" }
// → totalWater - 이전 단계 합계
```

> `eval()` 같은 문자열 수식 실행은 보안 위험이 있으므로 사용하지 않는다. 위 4가지 method 조합으로 대부분의 레시피를 표현할 수 있다.

---

## 4. 기술 스택

### Frontend
| 항목 | 현재 | 변경 |
|------|------|------|
| 프레임워크 | 순수 HTML/JS | 유지 (또는 가벼운 프레임워크 도입 검토) |
| 스타일링 | Bootstrap 4 CDN | 유지 |
| 호스팅 | GitHub Pages | **Cloudflare Pages** |

### Backend (신규)
| 항목 | 선택 | 이유 |
|------|------|------|
| API 서버 | **Cloudflare Workers** | 사용자가 이미 Cloudflare 도메인 보유. 무료 티어 넉넉함 (일 10만 요청). 별도 서버 관리 불필요 |
| 데이터베이스 | **Cloudflare D1** (SQLite) | Workers와 네이티브 통합. 구조화된 레시피 데이터에 적합. 무료 티어 5GB |
| 대안 | Cloudflare KV | 레시피가 소수라면 KV로도 충분하나, 향후 확장성 고려 시 D1 추천 |

### 인프라 구성도

```
[사용자 브라우저]
       │
       ▼
[Cloudflare CDN / Pages]  ← 프론트엔드 정적 파일 서빙
  (사용자 도메인)             index.html, CSS, JS
       │
       │  fetch('/api/recipes')
       ▼
[Cloudflare Workers]       ← API 엔드포인트
       │
       ▼
[Cloudflare D1]            ← 레시피 데이터 저장
```

---

## 5. API 설계

### Phase 1 (MVP)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/recipes` | 레시피 목록 조회 (id, name, author만) |
| GET | `/api/recipes/:id` | 레시피 상세 조회 (steps 포함) |

### Phase 2 (관리 기능)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/recipes` | 레시피 추가 |
| PUT | `/api/recipes/:id` | 레시피 수정 |
| DELETE | `/api/recipes/:id` | 레시피 삭제 |

> Phase 2 엔드포인트는 인증 필요 (Cloudflare Access 또는 API Key).

---

## 6. DB 스키마

```sql
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  default_ratio REAL
);

CREATE TABLE recipe_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,           -- 'bloom' | 'pour'
  amount_method TEXT NOT NULL,  -- 'multiply_bean' | 'ratio_of_total' | 'ratio_of_remaining' | 'remainder'
  amount_value REAL,            -- method에 따른 값 (remainder일 때는 NULL)
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);
```

### 시드 데이터 예시

```sql
-- James Hoffmann V60
INSERT INTO recipes VALUES ('hoffmann-v60', 'James Hoffmann V60', 'James Hoffmann', 'The Ultimate V60 Technique', 15);
INSERT INTO recipe_steps VALUES (NULL, 'hoffmann-v60', 1, 'Bloom', 'bloom', 'multiply_bean', 2.0);
INSERT INTO recipe_steps VALUES (NULL, 'hoffmann-v60', 2, 'First Pour', 'pour', 'ratio_of_total', 0.6);
INSERT INTO recipe_steps VALUES (NULL, 'hoffmann-v60', 3, 'Second Pour', 'pour', 'remainder', NULL);

-- 기존 공식 (현재 앱)
INSERT INTO recipes VALUES ('default', '휘뚜루마뚜루 레시피', '기본', '기존 계산기 공식', 16);
-- (기존 공식은 보정 로직이 있어 커스텀 method 추가 필요 - Phase 1에서 결정)
```

---

## 7. 프론트엔드 변경사항

### UI 변경

```
┌─────────────────────────────────────┐
│         [Hero Image]                │
├─────────────────────────────────────┤
│                                     │
│  📋 레시피 선택                      │
│  ┌─────────────────────────────┐    │
│  │ ▼ James Hoffmann V60       │    │
│  └─────────────────────────────┘    │
│  "The Ultimate V60 Technique"       │
│                                     │
│  🟤 Coffee Bean Weight (g)          │
│  ┌─────────────────────────────┐    │
│  │ 20                          │    │
│  └─────────────────────────────┘    │
│                                     │
│  ☕ Coffee to Water Ratio           │
│  ┌─────────────────────────────┐    │
│  │ 15          (auto-filled)   │    │
│  └─────────────────────────────┘    │
│                                     │
│  [        Calculate        ]        │
│                                     │
├─────────────────────────────────────┤
│  Results                            │
│                                     │
│  🌝 Total          300.00 g        │
│  🌒 Bloom           40.00 g        │  ← 레시피에 따라
│  🌓 First Pour     156.00 g        │  ← 단계 수와 양이
│  🌕 Second Pour    104.00 g        │  ← 동적으로 변경됨
│                                     │
│  📖 계산 로직                        │
│  Bloom = 원두량 x 2                  │
│  First Pour = Total x 0.6           │
│  Second Pour = 나머지 전부            │
└─────────────────────────────────────┘
```

### 주요 변경 포인트
1. **레시피 선택 드롭다운** 추가 (폼 최상단)
2. **결과 영역 동적 렌더링** - 선택한 레시피의 steps 수에 따라 `<li>` 동적 생성
3. **비율 자동 채움** - 레시피 선택 시 해당 레시피의 `default_ratio` 값을 비율 입력란에 자동 입력
4. **계산 로직 설명** - 하단에 현재 선택된 레시피의 계산 방식을 동적으로 표시

### 계산 로직 (프론트엔드)

```javascript
function calculate(recipe, beanWeight, ratio) {
  const totalWater = beanWeight * ratio;
  let usedWater = 0;
  const results = [];

  for (const step of recipe.steps) {
    let amount;
    switch (step.amount_method) {
      case 'multiply_bean':
        amount = beanWeight * step.amount_value;
        break;
      case 'ratio_of_total':
        amount = totalWater * step.amount_value;
        break;
      case 'ratio_of_remaining':
        amount = (totalWater - usedWater) * step.amount_value;
        break;
      case 'remainder':
        amount = totalWater - usedWater;
        break;
    }
    usedWater += amount;
    results.push({ name: step.name, amount: Math.round(amount * 100) / 100 });
  }

  return { totalWater, results };
}
```

---

## 8. 프로젝트 구조 (변경 후)

```
brewingrecipe/
├── frontend/
│   ├── index.html          # 메인 페이지
│   ├── css/
│   │   └── style.css       # 인라인에서 분리
│   └── js/
│       ├── app.js           # 앱 초기화, 이벤트 핸들링
│       └── calculator.js    # 계산 로직
│
├── worker/
│   ├── src/
│   │   └── index.ts         # Cloudflare Worker 엔드포인트
│   ├── schema.sql           # D1 테이블 생성
│   ├── seed.sql             # 초기 레시피 데이터
│   ├── wrangler.toml        # Worker 설정
│   └── package.json
│
└── docs/
    └── PRD_recipe_selection.md
```

---

## 9. 마일스톤

### Phase 1 - MVP
- [ ] Cloudflare Workers + D1 세팅
- [ ] 레시피 API 구현 (GET 목록, GET 상세)
- [ ] 3~4개 유명 레시피 시드 데이터 입력
- [ ] 프론트엔드에 레시피 선택 드롭다운 추가
- [ ] 동적 결과 렌더링 구현
- [ ] Cloudflare Pages에 프론트엔드 배포
- [ ] 사용자 도메인 연결

### Phase 2 - 관리 기능
- [ ] 레시피 추가/수정/삭제 API
- [ ] 간단한 관리자 페이지 (또는 CLI 도구)
- [ ] 인증 적용

### Phase 3 - 고도화 (선택)
- [ ] 레시피별 타이머 기능
- [ ] 플레이버 노트 연동 (기존 CSV 데이터 활용)
- [ ] 사용자 커스텀 레시피 저장

---

## 10. 기존 공식 처리

현재 앱의 계산 로직에는 `beanWeight >= 30` 조건 분기가 있는 특수한 보정값 로직이 포함되어 있다. 이를 위 데이터 모델로 표현하려면:

**방법 A**: `amount_method`에 `custom` 타입 추가 → 기존 로직을 JS 함수로 유지
**방법 B**: 기존 공식을 위 4가지 method 조합으로 근사치로 변환 (정확도 차이 발생 가능)

> **권장**: 방법 A. 기존 공식은 `custom` method로 처리하되, 새로 추가하는 유명 바리스타 레시피들은 표준 method로 표현한다.

---

## 11. 리스크 및 고려사항

| 항목 | 리스크 | 대응 |
|------|--------|------|
| 레시피 표현력 | 4가지 method로 모든 레시피를 표현할 수 없을 수 있음 | `custom` method를 통한 확장 포인트 마련 |
| D1 무료 한도 | 일 읽기 500만, 쓰기 10만 | 레시피 데이터는 읽기 위주이므로 충분 |
| CORS | Workers와 Pages 도메인이 다를 경우 | 동일 도메인 하위 경로로 라우팅 (`/api/*` → Worker) |
| 기존 사용자 | 기존 URL(GitHub Pages)로 접근하는 사용자 | 리다이렉트 설정 또는 안내 |
