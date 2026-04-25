# Hackfest-UC-2026

🚀 Repository resmi untuk Hackfest UC 2026 - Hackathon inovatif dengan fokus pada teknologi terkini dan kolaborasi tim.

## 📋 Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Stack Teknologi](#stack-teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Instalasi](#instalasi)
- [Cara Menjalankan](#cara-menjalankan)
- [Kontribusi](#kontribusi)
- [Tim](#tim)
- [Lisensi](#lisensi)

## 🎯 Tentang Proyek

Hackfest UC 2026 adalah sebuah hackathon yang dirancang untuk:
- Mengembangkan solusi inovatif menggunakan teknologi modern
- Mendorong kolaborasi dan kreativitas dalam tim
- Membangun produk yang dapat memberikan dampak nyata
- Berbagi pengetahuan dan best practices dalam development

Proyek ini dibangun dengan arsitektur modern fullstack menggunakan teknologi TypeScript di kedua sisi (frontend dan backend).

## 💻 Stack Teknologi

### Backend
- **Framework**: NestJS - Progressive Node.js framework
- **Language**: TypeScript
- **Runtime**: Node.js

### Frontend
- **Framework**: Next.js - React framework modern
- **Language**: TypeScript
- **Features**: App Router, Server Components, Optimization

### Umum
- **Version Control**: Git & GitHub
- **Package Manager**: npm/yarn

## 📁 Struktur Proyek

```
Hackfest-UC-2026/
├── backend/              # NestJS Application
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── README.md
├── frontend/             # Next.js Application
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── README.md
├── README.md             # Dokumentasi utama (file ini)
└── .gitignore
```

## 🚀 Instalasi

### Prerequisites
- Node.js (v16 atau lebih tinggi)
- npm atau yarn
- Git

### Backend Setup

```bash
cd backend
npm install
```

### Frontend Setup

```bash
cd frontend
npm install
```

## 🏃 Cara Menjalankan

### Menjalankan Backend (NestJS)

```bash
cd backend

# Development mode
npm run start

# Watch mode (hot reload)
npm run start:dev

# Production mode
npm run start:prod
```

Backend akan berjalan di `http://localhost:3001` (atau port yang dikonfigurasi)

### Menjalankan Frontend (Next.js)

```bash
cd frontend

# Development mode
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

### Menjalankan Testing

**Backend:**
```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

**Frontend:**
```bash
cd frontend

# Development dengan testing
npm run dev
```

## 🧪 Testing

### Backend Testing
Proyek backend menggunakan Jest untuk unit testing dan e2e testing.

```bash
cd backend
npm run test          # Jalankan semua tests
npm run test:watch   # Watch mode
npm run test:cov     # Coverage report
```

## 🔧 Environment Variables

Buat file `.env` di direktori backend dan frontend sesuai kebutuhan:

### Backend (.env)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=your_database_url
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📦 Deployment

### Backend Deployment
Ikuti dokumentasi NestJS: [NestJS Deployment Guide](https://docs.nestjs.com/deployment)

### Frontend Deployment
Ikuti dokumentasi Next.js: [Next.js Deployment Guide](https://nextjs.org/docs/app/building-your-application/deploying)

Rekomendasi platform:
- **Backend**: Heroku, AWS, DigitalOcean, Railway
- **Frontend**: Vercel, Netlify, AWS Amplify

## 🤝 Kontribusi

Kami menyambut kontribusi dari semua anggota tim! Silakan ikuti langkah-langkah berikut:

1. **Fork** repository ini
2. Buat **branch** fitur Anda (`git checkout -b feature/AmazingFeature`)
3. **Commit** perubahan Anda (`git commit -m 'Add some AmazingFeature'`)
4. **Push** ke branch (`git push origin feature/AmazingFeature`)
5. Buat **Pull Request**

### Git Workflow
- Main branch: `main` (production-ready code)
- Development branch: `develop` (integration branch)
- Feature branches: `feature/*`
- Bug fix branches: `bugfix/*`
- Release branches: `release/*`

## 👥 Tim

Tim Hackfest UC 2026:
- **Backend Lead**: [Nama Backend Developer]
- **Frontend Lead**: [Nama Frontend Developer]
- **Product Manager**: [Nama PM]
- **Designer**: [Nama Designer]

## 📝 Dokumentasi

- [Backend README](./backend/README.md) - Dokumentasi lengkap untuk backend
- [Frontend README](./frontend/README.md) - Dokumentasi lengkap untuk frontend
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)

## 🐛 Troubleshooting

### Backend Issues
- Port sudah digunakan: Ubah PORT di `.env`
- Database connection error: Periksa DATABASE_URL di `.env`
- Dependencies error: Jalankan `npm install` atau `npm ci`

### Frontend Issues
- Build error: Hapus `.next` folder dan jalankan `npm run dev` lagi
- API connection error: Periksa NEXT_PUBLIC_API_URL di `.env.local`

## 📚 Resources

- [NestJS Docs](https://docs.nestjs.com) - Documentation
- [NestJS Discord](https://discord.gg/G7Qnnhy) - Community support
- [Next.js Docs](https://nextjs.org/docs) - Documentation
- [Next.js Learn](https://nextjs.org/learn) - Interactive tutorial
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript reference

## 📄 Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

## 📞 Kontak & Support

Untuk pertanyaan atau dukungan, silakan:
- Buka [GitHub Issues](https://github.com/Bukan-Telkomsel-Tapi-Sinyal-Kami-Kuat/Hackfest-UC-2026/issues)
- Hubungi tim development
- Buat diskusi di repository ini

---

**Made with ❤️ by Hackfest UC 2026 Team**

*Last Updated: 2026-04-25*