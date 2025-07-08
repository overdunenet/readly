### Local DB 세팅용

local-docker-compose.yml에 있는 `restart: always`는 입맛에 맞게 설정해주세요

```
docker-compose -f docker-compose.yml up -d --build
```

### 정상 실행시 확인 방법
local-template-postgresql 이 도커 환경에 생성 됩니다.
localhost 정보 docker-compose.yml로 확인