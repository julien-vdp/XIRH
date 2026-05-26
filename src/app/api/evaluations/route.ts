import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const evaluations = await prisma.evaluation.findMany();
    return NextResponse.json(evaluations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if evaluation already exists for this employee and campaign
    const existing = await prisma.evaluation.findFirst({
      where: {
        campaignId: body.campaignId,
        employeeId: body.employeeId,
      },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        id: body.id,
        campaignId: body.campaignId,
        employeeId: body.employeeId,
        date: body.date,
        status: body.status || 'Planifié',
        type: body.type,
        formTemplateId: body.formTemplateId || null,
        score: body.score || null,
        answers: body.answers || null,
        evaluatorId: body.evaluatorId || null,
      },
    });
    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error('Error creating evaluation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing evaluation ID' }, { status: 400 });
    }

    const updated = await prisma.evaluation.update({
      where: { id },
      data: {
        campaignId: updateData.campaignId,
        employeeId: updateData.employeeId,
        date: updateData.date,
        status: updateData.status,
        type: updateData.type,
        formTemplateId: updateData.formTemplateId,
        score: updateData.score,
        answers: updateData.answers,
        evaluatorId: updateData.evaluatorId,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating evaluation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const campaignId = searchParams.get('campaignId');
    const employeeId = searchParams.get('employeeId');

    if (id) {
      await prisma.evaluation.delete({
        where: { id },
      });
    } else if (campaignId && employeeId) {
      await prisma.evaluation.deleteMany({
        where: {
          campaignId,
          employeeId,
        },
      });
    } else {
      return NextResponse.json({ error: 'Missing evaluation identifier' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting evaluation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
