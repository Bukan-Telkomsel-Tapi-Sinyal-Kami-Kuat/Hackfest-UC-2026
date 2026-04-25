const { io } = require('socket.io-client');

const URL = 'http://localhost:3000';
const CLIENT_COUNT = 50; // Mensimulasikan 50 anak belajar bersamaan
const LOGS_PER_SECOND = 1; // 1 data per detik per anak

console.log(`Memulai Load Test: ${CLIENT_COUNT} koneksi simultan...`);

for (let i = 0; i < CLIENT_COUNT; i++) {
  const socket = io(URL);

  socket.on('connect', () => {
    setInterval(() => {
      socket.emit('send_log', {
        sessionId: `cmoe7nj7100004ca22wsu4oxz-${i}`, // Ganti dengan ID sesi valid jika ingin masuk DB
        childId: 'cmoe7nj7100004ca22wsu4oxz',
        engagementScore: Math.random(), // Skor acak 0-1
        gazeDirection: 'CENTER',
        overloadStatus: 'STABLE',
      });
    }, 1000 / LOGS_PER_SECOND);
  });

  socket.on('connect_error', (err) => {
    console.error(`Koneksi error pada client ${i}:`, err.message);
  });
}