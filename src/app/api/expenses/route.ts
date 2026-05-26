import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [expenses, config] = await Promise.all([
      prisma.expense.findMany(),
      prisma.expenseWorkflowConfig.findUnique({
        where: { id: 'config' },
      }),
    ]);

    return NextResponse.json({
      expenses,
      config: config || { id: 'config', circuit: 1 },
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

    if (type === 'config') {
      const config = await prisma.expenseWorkflowConfig.upsert({
        where: { id: 'config' },
        update: {
          circuit: Number(data.circuit),
        },
        create: {
          id: 'config',
          circuit: Number(data.circuit),
        },
      });
      return NextResponse.json(config);
    } else if (type === 'expense') {
      const expense = await prisma.expense.upsert({
        where: { id: data.id },
        update: {
          employeeId: data.employeeId,
          type: data.type,
          amount: Number(data.amount),
          date: data.date,
          description: data.description,
          status: data.status,
          history: data.history || [],
        },
        create: {
          id: data.id,
          employeeId: data.employeeId,
          type: data.type,
          amount: Number(data.amount),
          date: data.date,
          description: data.description,
          status: data.status || 'PENDING_N1',
          history: data.history || [{ date: new Date().toISOString().split('T')[0], action: 'Déclaration soumise' }],
        },
      });
      return NextResponse.json(expense);
    } else if (type === 'status') {
      const { expenseId, status, label } = data;
      if (!expenseId || !status || !label) {
        return NextResponse.json({ error: 'Missing expenseId, status or label' }, { status: 400 });
      }

      const existingExpense = await prisma.expense.findUnique({
        where: { id: expenseId },
      });

      if (!existingExpense) {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      }

      const currentHistory = Array.isArray(existingExpense.history)
        ? (existingExpense.history as any[])
        : [];

      const updatedExpense = await prisma.expense.update({
        where: { id: expenseId },
        data: {
          status,
          history: [
            ...currentHistory,
            { date: new Date().toISOString().split('T')[0], action: label },
          ],
        },
      });

      return NextResponse.json(updatedExpense);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in expenses POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
