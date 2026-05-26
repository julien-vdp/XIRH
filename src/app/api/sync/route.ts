import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [
      employees,
      campaigns,
      evaluations,
      forms,
      compCampaigns,
      compEnrollments,
      compSuggestions,
      compStatuses,
      expenses,
      expenseConfig
    ] = await Promise.all([
      prisma.employee.findMany({
        include: {
          history: {
            orderBy: {
              date: 'desc',
            },
          },
        },
      }),
      prisma.campaign.findMany(),
      prisma.evaluation.findMany(),
      prisma.formTemplate.findMany(),
      prisma.compCampaign.findMany(),
      prisma.compEnrollment.findMany(),
      prisma.compSuggestion.findMany(),
      prisma.compStatus.findMany(),
      prisma.expense.findMany(),
      prisma.expenseWorkflowConfig.findUnique({
        where: { id: 'config' },
      }),
    ]);

    return NextResponse.json({
      employees,
      campaigns,
      evaluations,
      forms,
      compCampaigns,
      compEnrollments,
      compSuggestions,
      compStatuses,
      expenses,
      expenseConfig: expenseConfig || { id: 'config', circuit: 1 },
    });
  } catch (error: any) {
    console.error('Error fetching sync data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
