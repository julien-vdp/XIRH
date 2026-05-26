export const generateMockEmployees = () => {
  const departments = ['Ressources Humaines', 'IT & Tech', 'Ventes', 'Marketing', 'Direction', 'Finance'];
  const titles = ['Développeur', 'Manager', 'Directeur', 'Assistant', 'Analyste', 'Commercial'];
  const firstNames = ['Camille', 'Léo', 'Léa', 'Arthur', 'Louise', 'Hugo', 'Ambre', 'Jules', 'Alice', 'Gabriel', 'Anna', 'Paul', 'Eva', 'Gaspard', 'Rose', 'Louis', 'Emma', 'Maël', 'Jade', 'Lucas'];
  const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'];

  const employees = [];

  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const pos = titles[Math.floor(Math.random() * titles.length)] + (dept === 'IT & Tech' ? ' Fullstack' : '');
    
    // Generate dates
    const hireYear = 2015 + Math.floor(Math.random() * 9);
    const hireMonth = Math.floor(Math.random() * 12) + 1;
    const hireDate = `${hireYear}-${hireMonth.toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2,'0')}`;
    
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
      history: history.sort((a,b) => new Date(b.date) - new Date(a.date)) // newest first
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
