import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') ?? '',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') ?? '',
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL') ?? '',
      scope: ['email', 'profile'],
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      id: string;
      emails: { value: string }[];
      displayName: string;
      photos: { value: string }[];
    },
    done: Function,
  ) {
    const email = profile.emails[0].value;
    const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') ?? [
      'didi-labs.com',
    ];
    const domain = email.split('@')[1];

    if (!allowedDomains.includes(domain)) {
      return done(new UnauthorizedException('Email domain not allowed'), false);
    }

    const user = {
      googleId: profile.id,
      email,
      name: profile.displayName,
      avatarUrl: profile.photos[0]?.value,
    };

    done(null, user);
  }
}
