import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        history: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });
    return NextResponse.json(employees);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { history, ...empData } = body;

    const employee = await prisma.employee.create({
      data: {
        ...empData,
        history: {
          create: history?.map((h: any) => ({
            date: h.date,
            type: h.type,
            label: h.label,
            description: h.description,
            newValue: h.newValue,
          })) || [],
        },
      },
      include: {
        history: true,
      },
    });

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { history, id, ...empData } = body;

    // Update the employee basic details
    const employee = await prisma.employee.update({
      where: { id },
      data: empData,
    });

    // Replace the history
    if (history) {
      await prisma.employeeHistory.deleteMany({
        where: { employeeId: id },
      });
      if (history.length > 0) {
        await prisma.employeeHistory.createMany({
          data: history.map((h: any) => ({
            employeeId: id,
            date: h.date,
            type: h.type,
            label: h.label,
            description: h.description,
            newValue: h.newValue,
          })),
        });
      }
    }

    const updatedEmployee = await prisma.employee.findUnique({
      where: { id },
      include: { history: { orderBy: { date: 'desc' } } },
    });

    return NextResponse.json(updatedEmployee);
  } catch (error: any) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing employee ID' }, { status: 400 });
    }

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
