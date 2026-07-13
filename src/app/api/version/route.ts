import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const publicDir = join(process.cwd(), 'public');
  const assets = {
    logo: existsSync(join(publicDir, 'logo.png')),
    sirhDashboardHero: existsSync(join(publicDir, 'sirh-dashboard-hero.png')),
    sirhLoginVisual: existsSync(join(publicDir, 'sirh-login-visual.png')),
  };

  return NextResponse.json(
    {
      app: 'xirh',
      branch: process.env.COOLIFY_BRANCH || process.env.SOURCE_BRANCH || null,
      commit:
        process.env.COOLIFY_GIT_COMMIT_SHA ||
        process.env.SOURCE_COMMIT ||
        process.env.COMMIT_SHA ||
        null,
      nodeEnv: process.env.NODE_ENV,
      cwd: process.cwd(),
      assets,
      checkedAt: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
