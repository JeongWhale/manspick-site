# 맨즈픽 MANSPICK 웹사이트

빌드 과정 없는 정적 사이트입니다 (HTML + Tailwind CDN + 바닐라 JS).

## 로컬에서 미리 보기

필요한 것: [Node.js](https://nodejs.org) 18 이상

```bash
npm install   # 처음 한 번만
npm start     # 브라우저가 자동으로 열림 → http://localhost:8080
```

- 파일을 저장하면 브라우저가 **자동 새로고침**됩니다.
- 브라우저 자동 열기 없이 서버만 띄우려면 `npm run dev`
- 종료: 터미널에서 `Ctrl + C`
- 같은 와이파이의 휴대폰에서 확인: `http://<내 PC IP>:8080`

> `index.html`을 더블클릭으로 직접 열면 `/images/...` 같은 경로가 깨질 수 있으니 꼭 서버로 여세요.

## 파일 구성

| 파일 | 설명 |
|---|---|
| `index.html` | 메인 랜딩 페이지 |
| `recommend.html`, `recommend.js` | 맞춤 패키지 추천 퀴즈 |
| `script.js`, `style.css` | 메인 페이지 스크립트·스타일 |
| `privacy.html`, `terms.html` | 개인정보처리방침·이용약관 |
| `sitemap.xml`, `robots.txt`, `llms.txt` | 검색엔진·AI 크롤러용 |
| `images/` | 사진 리소스 |
