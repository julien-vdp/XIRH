import React, { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';
import { importCSVData, getEmployees } from '../db/database';

const Import = () => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, parsing, success, error
  const [importResult, setImportResult] = useState(null);

  const handleFileUpload = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setStatus('parsing');
      
      Papa.parse(selected, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
          setStatus('idle');
        },
        error: (error) => {
          console.error(error);
          setStatus('error');
        }
      });
    }
  };

  const handleImport = () => {
    setStatus('importing');
    try {
      const result = importCSVData(parsedData);
      setImportResult(result);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setStatus('idle');
    setImportResult(null);
  }

  const handleExportTemplate = () => {
    const employees = getEmployees();
    const dataToExport = employees.map(emp => ({
      id: emp.id,
      Prenom: emp.firstName,
      Nom: emp.lastName,
      Email: emp.email,
      Poste: emp.position,
      Departement: emp.department,
      Statut: emp.status,
      Salaire: emp.salary,
      DateEmbauche: emp.hireDate
    }));
    
    // CSV with semicolon for French Excel compatibility
    const csv = Papa.unparse(dataToExport, { delimiter: ';' });
    
    // BOM for UTF-8 Excel parsing
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'xirh_export_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-col gap-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h1>Import de Données</h1>
        <p>Mettez à jour la base des salariés via un fichier CSV (avec gestion des dates d'effet).</p>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px', borderColor: file ? 'var(--primary)' : 'var(--panel-border)' }}>
        {!file && (
          <div className="flex-col items-center gap-4">
            <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', color: 'var(--primary)' }}>
              <UploadCloud size={48} />
            </div>
            <div>
              <h3>Glissez-déposez votre fichier ici</h3>
              <p style={{ margin: '0.5rem 0' }}>Ou cliquez pour sélectionner un fichier depuis votre ordinateur.</p>
              <p style={{ fontSize: '0.85rem' }}>Formats acceptés : .csv (En-têtes attendus : id, Nom, Prenom, Email, Poste, etc.)</p>
            </div>
            
            <label className="btn btn-primary" style={{ marginTop: '1rem', cursor: 'pointer' }}>
              Sélectionner un fichier
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
            
            <button className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleExportTemplate}>
              <Download size={18} /> Télécharger la base actuelle (Modèle CSV)
            </button>
          </div>
        )}

        {file && status !== 'success' && (
          <div className="flex-col items-center gap-4">
            <FileText size={48} color="var(--primary)" />
            <div>
              <h3>{file.name}</h3>
              <p>{parsedData.length} lignes détectées</p>
            </div>
            <div className="flex gap-4 mt-4">
              <button className="btn btn-outline" onClick={handleReset}>Annuler</button>
              <button 
                 className="btn btn-primary" 
                 onClick={handleImport}
                 disabled={status === 'parsing' || parsedData.length === 0}
              >
                Confirmer l'importation
              </button>
            </div>
          </div>
        )}

        {status === 'success' && (
           <div className="flex-col items-center gap-4">
             <div style={{ color: 'var(--success)' }}>
               <CheckCircle size={64} />
             </div>
             <h2>Importation réussie !</h2>
             <p>{importResult?.count} salariés ont été créés ou mis à jour avec succès.</p>
             <button className="btn btn-outline" onClick={handleReset}>Nouvel import</button>
           </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <AlertCircle size={18} color="var(--warning)" /> Conseils pour l'import CSV
        </h4>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <li>Utilisez l'encodage <strong>UTF-8</strong> pour éviter les problèmes de caractères spéciaux.</li>
          <li>Les colonnes recommandées sont : <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>id, prenom, nom, departement, poste, dateEmbauche, salaire</code>.</li>
          <li>Si l'ID d'un salarié existe déjà, son profil sera <strong>mis à jour</strong> et un nouvel évènement sera ajouté dans son <strong>historique</strong> (date d'effet).</li>
        </ul>
      </div>
    </div>
  );
};

export default Import;
