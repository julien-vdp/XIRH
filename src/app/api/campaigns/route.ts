import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany();
    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const campaign = await prisma.campaign.create({
      data: {
        id: body.id,
        name: body.name,
        startDate: body.startDate,
        endDate: body.endDate,
        progress: body.progress ?? 0,
        formTemplateId: body.formTemplateId || null,
      },
    });
    return NextResponse.json(campaign);
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
