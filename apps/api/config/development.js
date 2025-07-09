module.exports = {
  name: '여기는 development.js 입니다.',
  cors: {
    origin: [
      'http://localhost:5173', // 백오피스 개발 서버
      'http://localhost:3001', // 기타 프론트엔드 개발 서버
      'http://localhost:3000', // 동일 origin
    ],
  }
};
