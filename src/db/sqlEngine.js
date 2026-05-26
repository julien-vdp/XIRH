import alasql from 'alasql';
import { getEmployees, getCampaigns, getEvaluations, getCompCampaigns, getCompEnrollments } from './database';

let initialized = false;

export const initSQL = () => {
    if (initialized) return;
    
    // Create tables
    alasql('CREATE TABLE IF NOT EXISTS employees');
    alasql('CREATE TABLE IF NOT EXISTS campaigns');
    alasql('CREATE TABLE IF NOT EXISTS evaluations');
    alasql('CREATE TABLE IF NOT EXISTS comp_campaigns');
    alasql('CREATE TABLE IF NOT EXISTS comp_enrollments');

    // Mettre à mort le cache : rechargement à chaud
    syncSQLData();
    
    initialized = true;
};

export const syncSQLData = () => {
    // Vider puis charger les données du LocalStorage vers AlaSQL
    alasql('TRUNCATE TABLE employees');
    alasql('TRUNCATE TABLE campaigns');
    alasql('TRUNCATE TABLE evaluations');
    alasql('TRUNCATE TABLE comp_campaigns');
    alasql('TRUNCATE TABLE comp_enrollments');

    // Injection hyper rapide des tableaux JSON vers la table.
    // AlaSQL a une propriété .data qui permet d'éviter l'INSERT un par un.
    if(alasql.tables.employees) alasql.tables.employees.data = getEmployees() || [];
    if(alasql.tables.campaigns) alasql.tables.campaigns.data = getCampaigns() || [];
    if(alasql.tables.evaluations) alasql.tables.evaluations.data = getEvaluations() || [];
    if(alasql.tables.comp_campaigns) alasql.tables.comp_campaigns.data = getCompCampaigns() || [];
    if(alasql.tables.comp_enrollments) alasql.tables.comp_enrollments.data = getCompEnrollments() || [];
};

export const runQuery = (query) => {
    // S'assure que les données sont syncrhonisées avant chaque requête.
    syncSQLData();
    try {
        const result = alasql(query);
        return { success: true, data: result };
    } catch (e) {
        return { success: false, error: e.message };
    }
};
