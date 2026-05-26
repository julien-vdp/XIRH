import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'campaigns') {
      const campaigns = await prisma.compCampaign.findMany();
      return NextResponse.json(campaigns);
    } else if (type === 'enrollments') {
      const enrollments = await prisma.compEnrollment.findMany();
      return NextResponse.json(enrollments);
    } else if (type === 'suggestions') {
      const campaignId = searchParams.get('campaignId');
      if (campaignId) {
        const suggestions = await prisma.compSuggestion.findMany({
          where: { campaignId },
        });
        return NextResponse.json(suggestions);
      }
      const suggestions = await prisma.compSuggestion.findMany();
      return NextResponse.json(suggestions);
    } else if (type === 'statuses') {
      const campaignId = searchParams.get('campaignId');
      if (campaignId) {
        const statuses = await prisma.compStatus.findMany({
          where: { campaignId },
        });
        return NextResponse.json(statuses);
      }
      const statuses = await prisma.compStatus.findMany();
      return NextResponse.json(statuses);
    }

    // Default: return everything in one payload to initialize cache
    const [campaigns, enrollments, suggestions, statuses] = await Promise.all([
      prisma.compCampaign.findMany(),
      prisma.compEnrollment.findMany(),
      prisma.compSuggestion.findMany(),
      prisma.compStatus.findMany(),
    ]);

    return NextResponse.json({
      campaigns,
      enrollments,
      suggestions,
      statuses,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    if (type === 'campaign') {
      const campaign = await prisma.compCampaign.upsert({
        where: { id: data.id },
        update: {
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          raisePercent: Number(data.raisePercent),
          bonusBudget: Number(data.bonusBudget),
          snapshotDate: data.snapshotDate,
          managerSalaries: data.managerSalaries || null,
          baseGlobalSalary: Number(data.baseGlobalSalary || 0),
        },
        create: {
          id: data.id,
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          raisePercent: Number(data.raisePercent),
          bonusBudget: Number(data.bonusBudget),
          snapshotDate: data.snapshotDate,
          managerSalaries: data.managerSalaries || null,
          baseGlobalSalary: Number(data.baseGlobalSalary || 0),
        },
      });
      return NextResponse.json(campaign);
    } else if (type === 'enrollment') {
      const enrollment = await prisma.compEnrollment.upsert({
        where: {
          campaignId_employeeId: {
            campaignId: data.campaignId,
            employeeId: data.employeeId,
          },
        },
        update: {},
        create: {
          campaignId: data.campaignId,
          employeeId: data.employeeId,
        },
      });
      return NextResponse.json(enrollment);
    } else if (type === 'suggestion') {
      const suggestion = await prisma.compSuggestion.upsert({
        where: {
          campaignId_employeeId: {
            campaignId: data.campaignId,
            employeeId: data.employeeId,
          },
        },
        update: {
          raiseAmount: Number(data.raiseAmount),
          bonusAmount: Number(data.bonusAmount),
        },
        create: {
          campaignId: data.campaignId,
          employeeId: data.employeeId,
          raiseAmount: Number(data.raiseAmount),
          bonusAmount: Number(data.bonusAmount),
        },
      });
      return NextResponse.json(suggestion);
    } else if (type === 'status') {
      const status = await prisma.compStatus.upsert({
        where: {
          campaignId_managerId: {
            campaignId: data.campaignId,
            managerId: data.managerId,
          },
        },
        update: {
          status: data.status,
        },
        create: {
          campaignId: data.campaignId,
          managerId: data.managerId,
          status: data.status,
        },
      });
      return NextResponse.json(status);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in compensation POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'enrollment') {
      const campaignId = searchParams.get('campaignId');
      const employeeId = searchParams.get('employeeId');

      if (!campaignId || !employeeId) {
        return NextResponse.json({ error: 'Missing campaignId or employeeId' }, { status: 400 });
      }

      await prisma.compEnrollment.deleteMany({
        where: {
          campaignId,
          employeeId,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in compensation DELETE:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
