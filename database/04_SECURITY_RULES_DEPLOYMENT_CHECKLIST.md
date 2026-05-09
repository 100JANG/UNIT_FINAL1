# RTDB Security Rules — Deployment Checklist

> 본 문서는 [`database.rules.json`](../database.rules.json) 배포 절차이다.
> 사양은 [03_SECURITY_RULES.md](03_SECURITY_RULES.md)를 참조한다.
> 본 사이클에서는 **실제 배포를 수행하지 않는다** — 본 문서는 운영 첫 배포 시 사용한다.


## 0. 배포 직전 review 항목

- [ ] [`database.rules.json`](../database.rules.json)이 `database/03_SECURITY_RULES.md` §3 표와 일치하는지 visual diff 확인
- [ ] 코드의 모든 `queryByChildAsc/Desc` 호출의 `orderByChild` 값이 `database/03 §5` 표 + `database.rules.json`의 `.indexOn`과 일치하는지 확인
- [ ] `SecurityRulesContractTest`가 통과하는지 확인 (`gradlew test --tests 'kr.unit.backend.security.SecurityRulesContractTest'`)
- [ ] `database.rules.json`에 다음 금지 키가 없는지 grep 확인: `"ai"`, `"ocr"`, `"gemma"`, `"recap"`, `"moderation"`, `"student_registry"`, `"pwa"`, `"service_worker"`
- [ ] 모든 `".write"` 값이 `false`인지 확인 (백엔드 Admin SDK는 룰 우회)
- [ ] `".read": true`로 설정된 루트 레벨 경로가 없는지 확인 (default-deny 유지)

## 1. 사전 환경 준비

- [ ] Firebase CLI 설치
  ```bash
  npm install -g firebase-tools
  firebase --version
  ```
- [ ] Firebase 계정 로그인
  ```bash
  firebase login
  ```
- [ ] 대상 프로젝트 권한 확인
  - 운영자 본인 계정이 대상 Firebase 프로젝트의 Editor 또는 Owner 권한 보유
  - service account 키 파일을 로컬에 만들지 말 것 (CLI 로그인이 표준)

## 2. 프로젝트 선택 (project id 하드코딩 금지)

```bash
firebase projects:list                       # 사용 가능한 프로젝트 ID 목록
firebase use <project-id>                    # 예: firebase use unit-backend-dev
firebase use --add                           # 별칭 등록(예: dev/staging/prod)이 권장 흐름
```

`firebase.json`에는 project id를 적지 않는다 (이미 적혀 있지 않음). 환경별 project id는 `.firebaserc` 또는 `firebase use <id>`로만 주입한다.

## 3. RTDB 인스턴스 확인

프로젝트에 RTDB 인스턴스가 존재하는지 확인한다 (멀티 데이터베이스 환경 대비).

```bash
firebase database:instances:list
```

여러 인스턴스가 있다면 배포 대상 인스턴스를 명시적으로 지정해야 한다 — `firebase.json`에 `"database": [{ "instance": "...", "rules": "..." }]` 배열 형태로 정의 가능. 단일 인스턴스라면 현재 `firebase.json` 그대로 사용.

## 4. Local emulator로 dry-run

실제 배포 전에 emulator로 룰을 검증한다.

```bash
firebase emulators:start --only database
```

emulator 콘솔(http://localhost:9000)에 접속해 다음 시나리오를 검증한다:

- [ ] 인증 없이 `/post_feeds/all` read → 거부 (`PERMISSION_DENIED`)
- [ ] 인증된 사용자 A로 로그인 후 `/notifications/{userId=A}` read → 허용
- [ ] 인증된 사용자 A로 로그인 후 `/notifications/{userId=B}` read → 거부
- [ ] 인증된 사용자가 어느 경로든 write 시도 → 거부
- [ ] `/post_feeds/all`을 `orderByChild("createdAt").limitToLast(20)`로 query → 인덱스 사용 (warning 없음)
- [ ] 인증된 사용자가 `/reports/{anyId}` read → 거부 (백엔드 전용)
- [ ] 인증된 사용자가 `/ai/...`, `/ocr/...` 등 금지 경로 read → 거부

emulator 검증 스크립트는 도메인 트래픽이 안정화된 후 별도 사이클에서 자동화 후보.

## 5. Staging 환경 배포 (운영 직전 단계)

```bash
firebase use staging
firebase deploy --only database
```

배포 후 staging 환경에서 다음을 확인한다:

- [ ] 백엔드 통합 테스트 (Spring Boot가 RTDB로 정상 read/write — Admin SDK 사용)
- [ ] 프론트(또는 Postman)로 인증되지 않은 read 시도 → `PERMISSION_DENIED` 응답
- [ ] 프론트의 read subscription이 의도한 경로에서만 동작
- [ ] Firebase Console > Database > Rules 탭에서 룰이 올바르게 반영되었는지 visual 확인

## 6. 운영 배포

```bash
firebase use prod
firebase deploy --only database
```

배포 직전에 staging에서 확인한 시나리오를 prod에서도 1차 점검:

- [ ] 운영 백엔드 1대를 카나리로 두고 5분간 RTDB read/write 트래픽 정상 확인 (Admin SDK는 룰 우회이므로 실제로는 룰 변경의 영향이 없으나 path 변동 점검 차원)
- [ ] CloudWatch 또는 Firebase 콘솔의 RTDB 사용량 그래프에 갑작스런 권한 거부 spike가 없는지 확인

## 7. 롤백 절차

배포 후 문제가 발견되면:

1. 직전 commit의 `database.rules.json`으로 git revert
2. `firebase deploy --only database` 재실행
3. Firebase Console > Database > Rules 탭에서 "rules history"로 이전 버전 확인 (콘솔에서도 직접 롤백 가능)

긴급 차단이 필요한 경우 (예: 광범위한 데이터 노출 위험 발견):

```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

위 minimal rules로 즉시 배포해 모든 client 접근을 차단할 수 있다 (백엔드 Admin SDK는 영향 없음).

## 8. 배포 금지 항목

다음 파일은 **절대 commit/배포되지 않아야** 한다:

- `firebase-credentials.json`
- `serviceAccountKey.json`
- `*-credentials.json`
- `.env`, `.env.local`, `.env.production`

`.gitignore`에 이미 등재되어 있는지 확인:

```bash
git check-ignore firebase-credentials.json serviceAccountKey.json .env
```

각 항목이 출력되면 안전하게 무시되는 상태.

## 9. 현재 상태

- ✅ `database.rules.json` — 작성 완료, 본 사이클 기준 사양과 일치
- ✅ `firebase.json` — `database.rules.json` 가리키도록 설정 (project id 미포함)
- ✅ `SecurityRulesContractTest` — `database.rules.json` 정합성 자동 검증
- ❌ 실제 Firebase 배포 — 본 사이클에서는 수행하지 않음 (사용자 지시)
- ❌ Firebase emulator 검증 — 본 사이클에서는 수행하지 않음 (별도 환경 필요)

운영 첫 배포 시 §0 ~ §6를 순차로 따른다.
