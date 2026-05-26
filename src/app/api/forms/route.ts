import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const templates = await prisma.formTemplate.findMany();
    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing form ID' }, { status: 400 });
    }

    const template = await prisma.formTemplate.upsert({
      where: { id },
      update: {
        name,
        fields,
      },
      create: {
        id,
        name,
        fields,
      },
    });

    return NextResponse.json(template);
  } catch (error: any) {
    console.error('Error saving form template:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing form template ID' }, { status: 400 });
    }

    await prisma.formTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting form template:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
