import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'KODE_RAHASIA_HACKATHON', // <-- Harus sama persis!
    });
  }

  // Fungsi ini otomatis dipanggil oleh NestJS jika token valid
  // Fungsi ini otomatis dipanggil oleh NestJS jika token valid
  async validate(payload: any) {
    console.log('--- TOKEN BERHASIL DIBACA ---'); // <-- Tambahkan ini
    console.log('Isi Payload:', payload);         // <-- Tambahkan ini
    
    return { userId: payload.userId, email: payload.email };
  }
}