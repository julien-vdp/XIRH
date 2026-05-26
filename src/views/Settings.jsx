import React from 'react';
import { Settings as SettingsIcon, Database, Paintbrush, RefreshCw } from 'lucide-react';
import { resetDB } from '../db/database';

const Settings = () => {

  const handleReset = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser la base de données ? Toutes les données actuelles seront effacées et remplacées par les données de démonstration initiales.")) {
      resetDB();
      alert("Base de données réinitialisée avec succès !");
      window.location.reload();
    }
  };

  return (
    <div className="flex-col gap-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h1>Paramétrage</h1>
        <p>Configuration globale de l'application SIRH.</p>
      </div>

      <div className="flex-col gap-6">
        {/* Section 1 */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <Paintbrush size={20} color="var(--primary)" /> Personnalisation
          </h3>
          
          <div className="flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 style={{ margin: 0 }}>Thème de l'application</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Choisissez l'apparence visuelle.</p>
              </div>
              <select style={{ width: 'auto', minWidth: '200px' }} defaultValue="dark">
                <option value="dark">Mode Sombre Premium</option>
                <option value="light">Mode Clair (Non implémenté)</option>
              </select>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div>
                <h4 style={{ margin: 0 }}>Langue par défaut</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Langue de l'interface.</p>
              </div>
              <select style={{ width: 'auto', minWidth: '200px' }} defaultValue="fr">
                <option value="fr">Français (FR)</option>
                <option value="en">English (US)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <Database size={20} color="var(--primary)" /> Base de données locale
          </h3>
          
          <div className="flex-col gap-4">
            <div className="flex justify-between items-center">
               <div>
                  <h4 style={{ margin: 0 }}>Données Pédagogiques</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', maxWidth: '400px' }}>
                    L'application utilise le <code>localStorage</code> de votre navigateur. En cas de problème ou pour revenir à l'état initial (50 faux profils avec historique), vous pouvez réinitialiser.
                  </p>
               </div>
               <button className="btn btn-danger" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <RefreshCw size={18} /> Réinitialiser la DB
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
