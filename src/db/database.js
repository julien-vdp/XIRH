import { generateMockEmployees } from './mockData';

const DB_KEY = 'xirh_employees_db_v3';
const CAMPAIGNS_DB_KEY = 'xirh_campaigns_db_v1';
const EVALS_DB_KEY = 'xirh_evaluations_db_v1';
const FORMS_DB_KEY = 'xirh_forms_db_v2';
const COMP_CAMPAIGNS_KEY = 'xirh_comp_campaigns_v1';
const COMP_ENROLLMENTS_KEY = 'xirh_comp_enrollments_v1';
const COMP_SUGGESTIONS_KEY = 'xirh_comp_suggestions_v2';
const COMP_STATUS_KEY = 'xirh_comp_status_v2';
const EXPENSES_KEY = 'xirh_expenses_v1';
const EXPENSE_WORKFLOW_KEY = 'xirh_expense_workflow_v1';

export const syncFromPostgres = async () => {
  try {
    const res = await fetch('/api/sync');
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    localStorage.setItem(DB_KEY, JSON.stringify(data.employees || []));
    localStorage.setItem(CAMPAIGNS_DB_KEY, JSON.stringify(data.campaigns || []));
    localStorage.setItem(EVALS_DB_KEY, JSON.stringify(data.evaluations || []));
    localStorage.setItem(FORMS_DB_KEY, JSON.stringify(data.forms || []));
    localStorage.setItem(COMP_CAMPAIGNS_KEY, JSON.stringify(data.compCampaigns || []));
    localStorage.setItem(COMP_ENROLLMENTS_KEY, JSON.stringify(data.compEnrollments || []));

    // Suggestions is structured as suggestions[campaignId][employeeId] = suggestion
    const suggestions = {};
    (data.compSuggestions || []).forEach(s => {
      if (!suggestions[s.campaignId]) suggestions[s.campaignId] = {};
      suggestions[s.campaignId][s.employeeId] = { raiseAmount: s.raiseAmount, bonusAmount: s.bonusAmount };
    });
    localStorage.setItem(COMP_SUGGESTIONS_KEY, JSON.stringify(suggestions));

    // Statuses is structured as statuses[campaignId][managerId] = status
    const statuses = {};
    (data.compStatuses || []).forEach(s => {
      if (!statuses[s.campaignId]) statuses[s.campaignId] = {};
      statuses[s.campaignId][s.managerId] = s.status;
    });
    localStorage.setItem(COMP_STATUS_KEY, JSON.stringify(statuses));

    localStorage.setItem(EXPENSES_KEY, JSON.stringify(data.expenses || []));
    localStorage.setItem(EXPENSE_WORKFLOW_KEY, JSON.stringify(data.expenseConfig || { id: 'config', circuit: 1 }));

    console.log('Database synchronized successfully from PostgreSQL!');
    return true;
  } catch (err) {
    console.error('Failed to sync from Postgres:', err);
    return false;
  }
};

export const initDB = () => {
  const existing = localStorage.getItem(DB_KEY);
  if (!existing) {
    const data = generateMockEmployees();
    data.forEach(emp => {
      if (!emp.avatar) emp.avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(emp.id)}`;
    });
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    return data;
  }
  const parsed = JSON.parse(existing);
  let updated = false;
  parsed.forEach(emp => {
    if (!emp.avatar) {
      emp.avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(emp.id)}`;
      updated = true;
    }
  });
  if (updated) {
    localStorage.setItem(DB_KEY, JSON.stringify(parsed));
  }
  return parsed;
};

export const getEmployees = () => {
  return initDB();
};

export const getCompStatuses = (campaignId) => {
  const existing = localStorage.getItem(COMP_STATUS_KEY);
  if (!existing) return {};
  const allStatuses = JSON.parse(existing);
  return allStatuses[campaignId] || {};
};

export const saveCompStatus = (campaignId, managerId, status) => {
  const existing = localStorage.getItem(COMP_STATUS_KEY);
  const allStatuses = existing ? JSON.parse(existing) : {};
  if (!allStatuses[campaignId]) allStatuses[campaignId] = {};
  allStatuses[campaignId][managerId] = status;
  localStorage.setItem(COMP_STATUS_KEY, JSON.stringify(allStatuses));

  // Sync back to Postgres
  fetch('/api/compensation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'status',
      data: { campaignId, managerId, status }
    })
  }).catch(err => console.error('Failed to sync comp status:', err));
};

export const getEmployee = (id) => {
  const employees = getEmployees();
  return employees.find(e => e.id === id);
};

export const addEmployee = (employee) => {
  const employees = getEmployees();
  if (!employee.history) {
    employee.history = [{
      id: `evt-${Date.now()}`,
      date: employee.hireDate || new Date().toISOString().split('T')[0],
      type: 'HIRE',
      label: 'Embauche',
      description: 'Création du profil',
      newValue: employee.position || ''
    }];
  }
  employees.push(employee);
  localStorage.setItem(DB_KEY, JSON.stringify(employees));

  // Sync back to Postgres
  fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee)
  }).catch(err => console.error('Failed to sync added employee:', err));

  return employee;
};

export const updateEmployee = (id, updates) => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === id);
  if (index !== -1) {
    employees[index] = { ...employees[index], ...updates };
    localStorage.setItem(DB_KEY, JSON.stringify(employees));

    // Sync back to Postgres
    fetch('/api/employees', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employees[index])
    }).catch(err => console.error('Failed to sync updated employee:', err));

    return employees[index];
  }
  return null;
};

export const deleteEmployee = (id) => {
  let employees = getEmployees();
  employees = employees.filter(e => e.id !== id);
  localStorage.setItem(DB_KEY, JSON.stringify(employees));

  // Sync back to Postgres
  fetch(`/api/employees?id=${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('Failed to sync deleted employee:', err));
};

export const importCSVData = (csvDataArray) => {
  const employees = getEmployees();
  const importedList = [];
  
  csvDataArray.forEach(row => {
    const existingIndex = employees.findIndex(e => e.id === row.ID || e.id === row.id);
    
    if (existingIndex !== -1) {
      const emp = employees[existingIndex];
      const newPos = row.Poste || row.position || emp.position;
      const newSalary = row.Salaire || row.salary || emp.salary;
      const newDept = row.Departement || row.department || emp.department;
      
      if (newPos !== emp.position || newSalary !== emp.salary) {
         emp.history.unshift({
           id: `evt-${Date.now()}-${Math.random()}`,
           date: new Date().toISOString().split('T')[0],
           type: 'UPDATE_IMPORT',
           label: 'Mise à jour (Import)',
           description: `Import de données: ${newPos !== emp.position ? `Nouveau poste: ${newPos}` : `Nouveau salaire: ${newSalary}`}`,
           newValue: newPos
         });
      }
      
      employees[existingIndex] = {
        ...emp,
        firstName: row.Prenom || row.firstName || emp.firstName,
        lastName: row.Nom || row.lastName || emp.lastName,
        email: row.Email || row.email || emp.email,
        position: newPos,
        salary: Number(newSalary),
        department: newDept,
      };
      importedList.push(employees[existingIndex]);
    } else {
      const newEmp = {
        id: row.ID || row.id || `EMP-${Date.now()}`,
        firstName: row.Prenom || row.firstName || 'Inconnu',
        lastName: row.Nom || row.lastName || 'Inconnu',
        email: row.Email || row.email || '',
        department: row.Departement || row.department || 'Non assigné',
        position: row.Poste || row.position || 'Non assigné',
        status: row.Statut || row.status || 'Actif',
        hireDate: row.DateEmbauche || row.hireDate || new Date().toISOString().split('T')[0],
        salary: Number(row.Salaire || row.salary || 30000),
        history: [{
           id: `evt-${Date.now()}-${Math.random()}`,
           date: row.DateEmbauche || row.hireDate || new Date().toISOString().split('T')[0],
           type: 'HIRE',
           label: 'Embauche',
           description: 'Importé depuis fichier externe',
           newValue: ''
        }]
      };
      employees.push(newEmp);
      importedList.push(newEmp);
    }
  });
  
  localStorage.setItem(DB_KEY, JSON.stringify(employees));

  // Sync back to Postgres
  fetch('/api/employees/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employees: importedList })
  }).catch(err => console.error('Failed to sync imported CSV:', err));

  return { success: true, count: csvDataArray.length };
};

export const resetDB = () => {
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem(CAMPAIGNS_DB_KEY);
  localStorage.removeItem(EVALS_DB_KEY);
  localStorage.removeItem(FORMS_DB_KEY);
  localStorage.removeItem('xirh_comp_settings_v1');
  localStorage.removeItem('xirh_comp_suggestions_v1');
  localStorage.removeItem('xirh_comp_status_v1');
  localStorage.removeItem('xirh_comp_campaigns_v1');
  localStorage.removeItem('xirh_comp_enrollments_v1');
  localStorage.removeItem('xirh_comp_suggestions_v2');
  localStorage.removeItem('xirh_comp_status_v2');
  localStorage.removeItem(EXPENSES_KEY);
  localStorage.removeItem(EXPENSE_WORKFLOW_KEY);

  initDB();
  initCampaignsDB();
  initFormsDB();
  initCompCampaignsDB();
  initExpensesDB();

  // Sync back to Postgres
  fetch('/api/db/reset', {
    method: 'POST'
  }).then(() => syncFromPostgres()).catch(err => console.error('Failed to sync db reset:', err));
};

export const initCampaignsDB = () => {
  const existingCampaigns = localStorage.getItem(CAMPAIGNS_DB_KEY);
  if (!existingCampaigns) {
    const mockCampaigns = [
      { id: 'camp-1', name: 'Campagne Annuelle 2026', startDate: '2026-11-01', endDate: '2026-12-31', progress: 0, formTemplateId: 'form-1' },
      { id: 'camp-2', name: 'Bilan Mi-Année 2026', startDate: '2026-06-01', endDate: '2026-06-30', progress: 45, formTemplateId: 'form-1' }
    ];
    localStorage.setItem(CAMPAIGNS_DB_KEY, JSON.stringify(mockCampaigns));
    
    const mockEvals = [
       { id: 'ev-1', campaignId: 'camp-1', formTemplateId: 'form-1', employeeId: 'EMP0001', date: '2026-11-15', status: 'Planifié', type: 'Annuel' },
       { id: 'ev-2', campaignId: 'camp-2', formTemplateId: 'form-1', employeeId: 'EMP0002', date: '2026-06-15', status: 'En cours', type: 'Mi-année' },
    ];
    localStorage.setItem(EVALS_DB_KEY, JSON.stringify(mockEvals));
  }
};

export const getCampaigns = () => {
  initCampaignsDB();
  return JSON.parse(localStorage.getItem(CAMPAIGNS_DB_KEY));
};

export const saveCampaign = (campaign) => {
  const campaigns = getCampaigns();
  campaign.id = `camp-${Date.now()}`;
  campaign.progress = 0;
  campaigns.push(campaign);
  localStorage.setItem(CAMPAIGNS_DB_KEY, JSON.stringify(campaigns));

  // Sync back to Postgres
  fetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaign)
  }).catch(err => console.error('Failed to sync saved campaign:', err));

  return campaign;
};

export const getEvaluations = () => {
  initCampaignsDB();
  return JSON.parse(localStorage.getItem(EVALS_DB_KEY));
};

export const addEmployeeToCampaign = (campaignId, employeeId) => {
  const evals = getEvaluations();
  const campaigns = getCampaigns();
  const campaign = campaigns.find(c => c.id === campaignId);

  const existing = evals.find(e => e.campaignId === campaignId && e.employeeId === employeeId);
  if (!existing) {
    const newEval = {
      id: `ev-${Date.now()}-${Math.random()}`,
      campaignId,
      employeeId,
      date: campaign ? campaign.endDate : new Date().toISOString().split('T')[0],
      status: 'Planifié',
      type: campaign ? campaign.name : 'Autre',
      formTemplateId: campaign ? campaign.formTemplateId : null,
      score: ''
    };
    evals.push(newEval);
    localStorage.setItem(EVALS_DB_KEY, JSON.stringify(evals));

    // Sync back to Postgres
    fetch('/api/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEval)
    }).catch(err => console.error('Failed to sync added evaluation:', err));
  }
};

export const removeEmployeeFromCampaign = (campaignId, employeeId) => {
  let evals = getEvaluations();
  evals = evals.filter(e => !(e.campaignId === campaignId && e.employeeId === employeeId));
  localStorage.setItem(EVALS_DB_KEY, JSON.stringify(evals));

  // Sync back to Postgres
  fetch(`/api/evaluations?campaignId=${campaignId}&employeeId=${employeeId}`, {
    method: 'DELETE'
  }).catch(err => console.error('Failed to sync removed evaluation:', err));
};

export const updateEvaluationFormTemplate = (evalId, newTemplateId) => {
  const evals = getEvaluations();
  const index = evals.findIndex(e => e.id === evalId);
  if (index !== -1) {
    evals[index].formTemplateId = newTemplateId;
    localStorage.setItem(EVALS_DB_KEY, JSON.stringify(evals));

    // Sync back to Postgres
    fetch('/api/evaluations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: evalId, formTemplateId: newTemplateId })
    }).catch(err => console.error('Failed to sync updated template:', err));
  }
};

export const getEvaluationsForEmployee = (employeeId) => {
  return getEvaluations().filter(e => e.employeeId === employeeId);
};

export const getEvaluationsForManager = (managerId) => {
  const allEmployees = getEmployees();
  const directReportIds = allEmployees.filter(e => e.managerId === managerId).map(e => e.id);
  
  const evals = getEvaluations().filter(e => {
    const isDirectReport = directReportIds.includes(e.employeeId);
    const isDelegatedToMe = e.evaluatorId === managerId;
    return isDelegatedToMe || isDirectReport;
  });
  
  return evals.map(e => ({
    ...e,
    employee: allEmployees.find(emp => emp.id === e.employeeId),
    evaluator: e.evaluatorId ? allEmployees.find(emp => emp.id === e.evaluatorId) : null
  }));
};

export const delegateEvaluation = (evalId, newEvaluatorId) => {
  const evals = getEvaluations();
  const index = evals.findIndex(e => e.id === evalId);
  if (index !== -1) {
    evals[index].evaluatorId = newEvaluatorId;
    localStorage.setItem(EVALS_DB_KEY, JSON.stringify(evals));

    // Sync back to Postgres
    fetch('/api/evaluations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: evalId, evaluatorId: newEvaluatorId })
    }).catch(err => console.error('Failed to sync delegated evaluation:', err));
  }
};

export const initFormsDB = () => {
  const existingForms = localStorage.getItem(FORMS_DB_KEY);
  if (!existingForms) {
    const mockForms = [
      {
        id: 'form-1',
        name: 'Trame d\'Entretien Annuel Standard',
        fields: [
          { id: 'f-info', type: 'employee_info', label: 'Informations Collaborateur' },
          { id: 'f-date', type: 'date', label: 'Date de l\'entretien' },
          { id: 'f-radio', type: 'radio', label: 'Satisfaction globale de l\'année écoulée', options: ['Insatisfait', 'Neutre', 'Satisfait', 'Très satisfait'] },
          { id: 'f-text1', type: 'long_text', label: 'Bilan de l\'année écoulée (Commentaires globaux)' },
          { id: 'f-obj', type: 'objectives_grid', label: 'Suivi des objectifs' },
          { id: 'f-slider', type: 'slider', label: 'Niveau global d\'atteinte des objectifs' },
          { id: 'f-rate', type: 'rating', label: 'Auto-évaluation des compétences douces (Soft skills)' },
        ]
      }
    ];
    localStorage.setItem(FORMS_DB_KEY, JSON.stringify(mockForms));
  }
};

export const getForms = () => {
  initFormsDB();
  return JSON.parse(localStorage.getItem(FORMS_DB_KEY));
};

export const saveForm = (form) => {
  const forms = getForms();
  if (form.id) {
    const index = forms.findIndex(f => f.id === form.id);
    if (index !== -1) {
      forms[index] = form;
    } else {
      forms.push(form);
    }
  } else {
    form.id = `form-${Date.now()}`;
    forms.push(form);
  }
  localStorage.setItem(FORMS_DB_KEY, JSON.stringify(forms));

  // Sync back to Postgres
  fetch('/api/forms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form)
  }).catch(err => console.error('Failed to sync form template:', err));

  return form;
};

export const deleteForm = (id) => {
  let forms = getForms();
  forms = forms.filter(f => f.id !== id);
  localStorage.setItem(FORMS_DB_KEY, JSON.stringify(forms));

  // Sync back to Postgres
  fetch(`/api/forms?id=${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('Failed to sync deleted form template:', err));
};

export const saveEvaluationAnswers = (evalId, answers) => {
  const evals = getEvaluations();
  const index = evals.findIndex(e => e.id === evalId);
  if (index !== -1) {
    evals[index].answers = answers;
    localStorage.setItem(EVALS_DB_KEY, JSON.stringify(evals));

    // Sync back to Postgres
    fetch('/api/evaluations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: evalId, answers })
    }).catch(err => console.error('Failed to sync evaluation answers:', err));
  }
};

export const updateEvaluationStatus = (evalId, status) => {
  const evals = getEvaluations();
  const index = evals.findIndex(e => e.id === evalId);
  if (index !== -1) {
    evals[index].status = status;
    localStorage.setItem(EVALS_DB_KEY, JSON.stringify(evals));

    // Sync back to Postgres
    fetch('/api/evaluations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: evalId, status })
    }).catch(err => console.error('Failed to sync evaluation status:', err));
  }
};

export const initCompCampaignsDB = () => {
  const existingCampaigns = localStorage.getItem(COMP_CAMPAIGNS_KEY);
  if (!existingCampaigns) {
    const mockCompCampaigns = [
      { id: 'compcamp-1', name: 'Revue Salariale 2026', startDate: '2026-11-01', endDate: '2026-12-31', raisePercent: 3, bonusBudget: 10000, snapshotDate: null, managerSalaries: {}, baseGlobalSalary: 0 }
    ];
    localStorage.setItem(COMP_CAMPAIGNS_KEY, JSON.stringify(mockCompCampaigns));
  }
};

export const getCompCampaigns = () => {
  initCompCampaignsDB();
  return JSON.parse(localStorage.getItem(COMP_CAMPAIGNS_KEY));
};

export const saveCompCampaign = (campaign) => {
  const campaigns = getCompCampaigns();
  if (campaign.id) {
    const index = campaigns.findIndex(c => c.id === campaign.id);
    if (index !== -1) campaigns[index] = campaign;
    else campaigns.push(campaign);
  } else {
    campaign.id = `compcamp-${Date.now()}`;
    campaigns.push(campaign);
  }
  localStorage.setItem(COMP_CAMPAIGNS_KEY, JSON.stringify(campaigns));

  // Sync back to Postgres
  fetch('/api/compensation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'campaign', data: campaign })
  }).catch(err => console.error('Failed to sync compensation campaign:', err));

  return campaign;
};

export const getCompEnrollments = () => {
  const existing = localStorage.getItem(COMP_ENROLLMENTS_KEY);
  return existing ? JSON.parse(existing) : [];
};

export const addEmployeeToCompCampaign = (campaignId, employeeId) => {
  const enrollments = getCompEnrollments();
  if (!enrollments.find(e => e.campaignId === campaignId && e.employeeId === employeeId)) {
    enrollments.push({ campaignId, employeeId });
    localStorage.setItem(COMP_ENROLLMENTS_KEY, JSON.stringify(enrollments));

    // Sync back to Postgres
    fetch('/api/compensation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'enrollment', data: { campaignId, employeeId } })
    }).catch(err => console.error('Failed to sync comp campaign enrollment:', err));
  }
};

export const removeEmployeeFromCompCampaign = (campaignId, employeeId) => {
  const enrollments = getCompEnrollments().filter(e => !(e.campaignId === campaignId && e.employeeId === employeeId));
  localStorage.setItem(COMP_ENROLLMENTS_KEY, JSON.stringify(enrollments));

  // Sync back to Postgres
  fetch(`/api/compensation?type=enrollment&campaignId=${campaignId}&employeeId=${employeeId}`, {
    method: 'DELETE'
  }).catch(err => console.error('Failed to sync comp campaign deletion:', err));
};

export const getCompEnrolledEmployees = (campaignId) => {
  const enrollments = getCompEnrollments();
  const enrolledIds = enrollments.filter(e => e.campaignId === campaignId).map(e => e.employeeId);
  const allEmployees = getEmployees();
  return allEmployees.filter(emp => enrolledIds.includes(emp.id));
};

export const getCompSuggestions = (campaignId) => {
  const existing = localStorage.getItem(COMP_SUGGESTIONS_KEY);
  const allSuggestions = existing ? JSON.parse(existing) : {};
  return allSuggestions[campaignId] || {};
};

export const saveCompSuggestion = (campaignId, employeeId, suggestion) => {
  const existing = localStorage.getItem(COMP_SUGGESTIONS_KEY);
  const allSuggestions = existing ? JSON.parse(existing) : {};
  if (!allSuggestions[campaignId]) allSuggestions[campaignId] = {};
  
  allSuggestions[campaignId][employeeId] = suggestion;
  localStorage.setItem(COMP_SUGGESTIONS_KEY, JSON.stringify(allSuggestions));

  // Sync back to Postgres
  fetch('/api/compensation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'suggestion',
      data: { campaignId, employeeId, raiseAmount: suggestion.raiseAmount, bonusAmount: suggestion.bonusAmount }
    })
  }).catch(err => console.error('Failed to sync compensation suggestion:', err));
};

const EXPENSE_TYPES = ['Repas / Restaurant', 'Transport / Déplacement', 'Hébergement', 'Fournitures', 'Formation', 'Autre'];

export const getExpenseTypes = () => EXPENSE_TYPES;

export const getExpenseWorkflowConfig = () => {
  const existing = localStorage.getItem(EXPENSE_WORKFLOW_KEY);
  return existing ? JSON.parse(existing) : { circuit: 1 };
};

export const saveExpenseWorkflowConfig = (config) => {
  localStorage.setItem(EXPENSE_WORKFLOW_KEY, JSON.stringify(config));

  // Sync back to Postgres
  fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'config', data: config })
  }).catch(err => console.error('Failed to sync expense config:', err));
};

export const initExpensesDB = () => {
  const existing = localStorage.getItem(EXPENSES_KEY);
  if (existing) return;

  const employees = getEmployees();
  if (!employees || employees.length < 5) return;

  const regulars = employees.filter(e => e.role === 'EMPLOYEE').slice(0, 3);
  if (regulars.length === 0) return;

  const today = new Date();
  const fmt = (d) => d.toISOString().split('T')[0];
  const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return fmt(d); };

  const mockExpenses = [
    {
      id: `exp-mock-1`,
      employeeId: regulars[0].id,
      type: 'Repas / Restaurant',
      amount: 48.50,
      date: daysAgo(5),
      description: 'Déjeuner client potentiel lors du déplacement à Lyon',
      status: 'PENDING_N1',
      history: [{ date: daysAgo(5), action: 'Déclaration soumise' }]
    },
    {
      id: `exp-mock-2`,
      employeeId: regulars[1] ? regulars[1].id : regulars[0].id,
      type: 'Transport / Déplacement',
      amount: 124.00,
      date: daysAgo(12),
      description: 'Billet TGV Paris-Bordeaux (aller-retour) - Séminaire annuel',
      status: 'PENDING_N1',
      history: [{ date: daysAgo(12), action: 'Déclaration soumise' }]
    },
    {
      id: `exp-mock-3`,
      employeeId: regulars[2] ? regulars[2].id : regulars[0].id,
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
  ];

  localStorage.setItem(EXPENSES_KEY, JSON.stringify(mockExpenses));
};

export const getExpenses = () => {
  initExpensesDB();
  const existing = localStorage.getItem(EXPENSES_KEY);
  return existing ? JSON.parse(existing) : [];
};

export const getExpensesForEmployee = (employeeId) => {
  return getExpenses().filter(e => e.employeeId === employeeId);
};

export const getExpensesPendingForManager = (managerId) => {
  const allEmployees = getEmployees();
  const directReportIds = allEmployees.filter(e => e.managerId === managerId).map(e => e.id);
  return getExpenses().filter(e => directReportIds.includes(e.employeeId) && e.status === 'PENDING_N1');
};

export const getExpensesPendingN2 = (managerId) => {
  const allEmployees = getEmployees();
  const n1Managers = allEmployees.filter(e => e.managerId === managerId).map(e => e.id);
  const n1ReportIds = allEmployees.filter(e => n1Managers.includes(e.managerId)).map(e => e.id);
  return getExpenses().filter(e => n1ReportIds.includes(e.employeeId) && e.status === 'PENDING_N2');
};

export const getExpensesPendingAdmin = () => {
  return getExpenses().filter(e => e.status === 'PENDING_ADMIN');
};

export const saveExpense = (expense) => {
  const expenses = getExpenses();
  if (!expense.id) {
    expense.id = `exp-${Date.now()}`;
    expense.status = 'PENDING_N1';
    expense.history = [{ date: new Date().toISOString().split('T')[0], action: 'Déclaration soumise' }];
    expenses.push(expense);
  } else {
    const idx = expenses.findIndex(e => e.id === expense.id);
    if (idx !== -1) expenses[idx] = expense;
  }
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));

  // Sync back to Postgres
  fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'expense', data: expense })
  }).catch(err => console.error('Failed to sync expense:', err));

  return expense;
};

export const updateExpenseStatus = (expenseId, newStatus, actionLabel) => {
  const expenses = getExpenses();
  const idx = expenses.findIndex(e => e.id === expenseId);
  if (idx !== -1) {
    expenses[idx].status = newStatus;
    expenses[idx].history = [
      ...(expenses[idx].history || []),
      { date: new Date().toISOString().split('T')[0], action: actionLabel }
    ];
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));

    // Sync back to Postgres
    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'status',
        data: { expenseId, status: newStatus, label: actionLabel }
      })
    }).catch(err => console.error('Failed to sync expense status:', err));

    return expenses[idx];
  }
  return null;
};
