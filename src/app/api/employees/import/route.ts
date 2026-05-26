import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json(); // Array of employee objects mapped in frontend or parsed from CSV
    const { employees } = body;

    if (!Array.isArray(employees)) {
      return NextResponse.json({ error: 'Expected an array of employees' }, { status: 400 });
    }

    let importedCount = 0;

    for (const emp of employees) {
      const { history, id, ...empData } = emp;

      // Check if employee exists
      const existing = await prisma.employee.findUnique({
        where: { id },
      });

      if (existing) {
        // Update basic details
        await prisma.employee.update({
          where: { id },
          data: empData,
        });

        // Insert new history events if provided and not already present
        if (history && history.length > 0) {
          // We can delete and recreate history to match the latest import representation
          await prisma.employeeHistory.deleteMany({
            where: { employeeId: id },
          });
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
      } else {
        // Insert brand new employee
        await prisma.employee.create({
          data: {
            id,
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
        });
      }
      importedCount++;
    }

    return NextResponse.json({ success: true, count: importedCount });
  } catch (error: any) {
    console.error('Error importing employees:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
