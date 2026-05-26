import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const generateMockEmployees = () => {
  const departments = ['Ressources Humaines', 'IT & Tech', 'Ventes', 'Marketing', 'Direction', 'Finance'];
  const titles = ['Développeur', 'Manager', 'Directeur', 'Assistant', 'Analyste', 'Commercial'];
  const firstNames = ['Camille', 'Léo', 'Léa', 'Arthur', 'Louise', 'Hugo', 'Ambre', 'Jules', 'Alice', 'Gabriel', 'Anna', 'Paul', 'Eva', 'Gaspard', 'Rose', 'Louis', 'Emma', 'Maël', 'Jade', 'Lucas'];
  const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'];

  const employees: any[] = [];

  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const pos = titles[Math.floor(Math.random() * titles.length)] + (dept === 'IT & Tech' ? ' Fullstack' : '');
    
    // Generate dates
    const hireYear = 2015 + Math.floor(Math.random() * 9);
    const hireMonth = Math.floor(Math.random() * 12) + 1;
    const hireDate = `${hireYear}-${hireMonth.toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`;
    
    let salary = 30000 + Math.floor(Math.random() * 50000);

    const history = [
      {
        id: `evt-${i}-1`,
        date: hireDate,
        type: 'HIRE',
        label: 'Embauche',
        description: `Embauche en tant que ${pos}`,
        newValue: salary.toString()
      }
    ];

    // Some random events (promotion, raise)
    if (Math.random() > 0.5) {
      const effectYear = hireYear + Math.floor(Math.random() * 3) + 1;
      if (effectYear <= 2026) {
         salary += 2000 + Math.floor(Math.random() * 5000);
         history.push({
           id: `evt-${i}-2`,
           date: `${effectYear}-${hireMonth.toString().padStart(2, '0')}-01`,
           type: 'SALARY_INCREASE',
           label: 'Augmentation',
           description: 'Révision salariale annuelle',
           newValue: salary.toString()
         });
      }
    }

    if (Math.random() > 0.8) {
      const effectYear = hireYear + 2 + Math.floor(Math.random() * 2);
      if (effectYear <= 2026) {
         const newPos = 'Senior ' + pos;
         history.push({
           id: `evt-${i}-3`,
           date: `${effectYear}-01-01`,
           type: 'PROMOTION',
           label: 'Promotion',
           description: `Passage au poste de ${newPos}`,
           newValue: newPos
         });
      }
    }

    employees.push({
      id: `EMP${i.toString().padStart(4, '0')}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@xirh-demo.com`,
      department: dept,
      position: history[history.length -1].type === 'PROMOTION' ? history[history.length -1].newValue : pos,
      status: Math.random() > 0.9 ? 'Inactif' : 'Actif',
      hireDate,
      salary,
      history: history.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // newest first
    });
  }

  // --- Second pass to assign managers ---
  if (employees.length > 0) {
    const ceo = employees[0];
    ceo.position = 'Directeur Général';
    ceo.department = 'Direction';
    ceo.managerId = null;

    const leaders = employees.slice(1, 6);
    leaders.forEach(l => {
      l.managerId = ceo.id;
      if (!l.position.includes('Directeur') && !l.position.includes('Manager')) {
         l.position = 'Directeur ' + l.department;
      }
    });

    const level2Managers = employees.slice(6, 15);
    level2Managers.forEach(l => {
      const boss = leaders[Math.floor(Math.random() * leaders.length)];
      l.managerId = boss.id;
      if (!l.position.includes('Manager')) {
         l.position = 'Manager ' + l.department;
      }
    });

    const regularEmployees = employees.slice(15);
    regularEmployees.forEach(emp => {
        const potentialBosses = [...leaders, ...level2Managers];
        const boss = potentialBosses[Math.floor(Math.random() * potentialBosses.length)];
        emp.managerId = boss.id;
    });
  }

  // --- Third pass to assign roles ---
  employees.forEach(emp => {
    if (emp.position.includes('Directeur Général') || emp.position.includes('Directeur')) {
      emp.role = 'ADMIN';
    } else if (emp.department === 'Ressources Humaines') {
      emp.role = 'HR';
    } else if (emp.position.includes('Manager')) {
      emp.role = 'MANAGER';
    } else {
      emp.role = 'EMPLOYEE';
    }
  });

  return employees;
};

export async function POST() {
  try {
    console.log('Resetting Database from API...');

    // Reset database
    await prisma.employeeHistory.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.evaluation.deleteMany();
    await prisma.formTemplate.deleteMany();
    await prisma.compCampaign.deleteMany();
    await prisma.compEnrollment.deleteMany();
    await prisma.compSuggestion.deleteMany();
    await prisma.compStatus.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.expenseWorkflowConfig.deleteMany();

    // 1. Seed Employees & History
    const mockEmps = generateMockEmployees();
    for (const emp of mockEmps) {
      const { history, ...empData } = emp;
      await prisma.employee.create({
        data: {
          ...empData,
          avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(emp.id)}`,
          history: {
            create: history.map((h: any) => ({
              date: h.date,
              type: h.type,
              label: h.label,
              description: h.description,
              newValue: h.newValue
            }))
          }
        }
      });
    }

    // 2. Seed Form Template
    await prisma.formTemplate.create({
      data: {
        id: 'form-1',
        name: "Trame d'Entretien Annuel Standard",
        fields: [
          { id: 'f-info', type: 'employee_info', label: 'Informations Collaborateur' },
          { id: 'f-date', type: 'date', label: 'Date de l\'entretien' },
          { id: 'f-radio', type: 'radio', label: 'Satisfaction globale de l\'année écoulée', options: ['Insatisfait', 'Neutre', 'Satisfait', 'Très satisfait'] },
          { id: 'f-text1', type: 'long_text', label: 'Bilan de l\'année écoulée (Commentaires globaux)' },
          { id: 'f-obj', type: 'objectives_grid', label: 'Suivi des objectifs' },
          { id: 'f-slider', type: 'slider', label: 'Niveau global d\'atteinte des objectifs' },
          { id: 'f-rate', type: 'rating', label: 'Auto-évaluation des compétences douces (Soft skills)' }
        ]
      }
    });

    // 3. Seed Campaigns & Evaluations
    await prisma.campaign.create({
      data: { id: 'camp-1', name: 'Campagne Annuelle 2026', startDate: '2026-11-01', endDate: '2026-12-31', progress: 0, formTemplateId: 'form-1' }
    });
    await prisma.campaign.create({
      data: { id: 'camp-2', name: 'Bilan Mi-Année 2026', startDate: '2026-06-01', endDate: '2026-06-30', progress: 45, formTemplateId: 'form-1' }
    });

    await prisma.evaluation.create({
      data: { id: 'ev-1', campaignId: 'camp-1', formTemplateId: 'form-1', employeeId: 'EMP0001', date: '2026-11-15', status: 'Planifié', type: 'Annuel' }
    });
    await prisma.evaluation.create({
      data: { id: 'ev-2', campaignId: 'camp-2', formTemplateId: 'form-1', employeeId: 'EMP0002', date: '2026-06-15', status: 'En cours', type: 'Mi-année' }
    });

    // 4. Seed CompCampaigns
    await prisma.compCampaign.create({
      data: { id: 'compcamp-1', name: 'Revue Salariale 2026', startDate: '2026-11-01', endDate: '2026-12-31', raisePercent: 3, bonusBudget: 10000, baseGlobalSalary: 0 }
    });

    // 5. Seed Expense Config
    await prisma.expenseWorkflowConfig.create({
      data: { id: 'config', circuit: 1 }
    });

    // 6. Seed Expenses
    const regulars = mockEmps.filter(e => e.role === 'EMPLOYEE').slice(0, 3);
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return fmt(d); };

    if (regulars.length > 0) {
      await prisma.expense.create({
        data: {
          id: `exp-mock-1`,
          employeeId: regulars[0].id,
          type: 'Repas / Restaurant',
          amount: 48.50,
          date: daysAgo(5),
          description: 'Déjeuner client potentiel lors du déplacement à Lyon',
          status: 'PENDING_N1',
          history: [{ date: daysAgo(5), action: 'Déclaration soumise' }]
        }
      });
      if (regulars[1]) {
        await prisma.expense.create({
          data: {
            id: `exp-mock-2`,
            employeeId: regulars[1].id,
            type: 'Transport / Déplacement',
            amount: 124.00,
            date: daysAgo(12),
            description: 'Billet TGV Paris-Bordeaux (aller-retour) - Séminaire annuel',
            status: 'PENDING_N1',
            history: [{ date: daysAgo(12), action: 'Déclaration soumise' }]
          }
        });
      }
      if (regulars[2]) {
        await prisma.expense.create({
          data: {
            id: `exp-mock-3`,
            employeeId: regulars[2].id,
            type: 'Hébergement',
            amount: 89.00,
            date: daysAgo(20),
            description: 'Nuit d\'hôtel lors du déplacement client sur Paris',
            status: 'APPROVED',
            history: [
              { date: daysAgo(20), action: 'Déclaration soumise' },
              { date: daysAgo(18), action: 'Approuvée par le Manager N+1' },
              { date: daysAgo(15), action: 'Remboursée par la comptabilité' }
            ]
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
