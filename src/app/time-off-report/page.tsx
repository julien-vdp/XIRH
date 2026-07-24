'use client';

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, FileSpreadsheet, LockKeyhole, ShieldCheck, Sparkles, UploadCloud, X } from 'lucide-react';
import './time-off-report.css';

const REQUIRED_FILES = ['Time Account.csv', 'Time Account-Time Account Details.csv', 'Time Account Snapshot.csv', 'Time Account Type.csv'] as const;
type RequiredFile = (typeof REQUIRED_FILES)[number];
type Uploads = Partial<Record<RequiredFile, File>>;
type Summary = { rawDetailRows: number; uniqueDetailRows: number; duplicateRowsRemoved: number; activeAccounts: number; uniqueUsers: number; uniqueTypes: number; futureMovementRows: number; reviewAccounts: number; };
type WorkerMessage = { type: 'progress'; label: string; value: number } | { type: 'complete'; summary: Summary; filename: string; buffer: ArrayBuffer } | { type: 'error'; message: string };

const FILE_LABELS: Record<RequiredFile, string> = { 'Time Account.csv': 'Comptes Time Off', 'Time Account-Time Account Details.csv': 'Écritures de compte', 'Time Account Snapshot.csv': 'Snapshots SAP', 'Time Account Type.csv': 'Types de compte' };

export default function TimeOffReportPage() {
  const workerRef = useRef<Worker | null>(null);
  const downloadRef = useRef<string | null>(null);
  const [uploads, setUploads] = useState<Uploads>({});
  const [cutoffDate, setCutoffDate] = useState('2026-06-30');
  const [extractDate, setExtractDate] = useState(new Date().toISOString().slice(0, 10));
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<{ label: string; value: number } | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [download, setDownload] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const complete = useMemo(() => REQUIRED_FILES.every((name) => Boolean(uploads[name])), [uploads]);

  useEffect(() => {
    const worker = new Worker(new URL('./time-off-report.worker.ts', import.meta.url));
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message.type === 'progress') { setProgress({ label: message.label, value: message.value }); return; }
      if (message.type === 'error') { setProgress(null); setError(message.message); return; }
      const url = URL.createObjectURL(new Blob([message.buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      if (downloadRef.current) URL.revokeObjectURL(downloadRef.current);
      downloadRef.current = url;
      setDownload({ url, filename: message.filename }); setSummary(message.summary); setProgress(null);
    };
    return () => { worker.terminate(); if (downloadRef.current) URL.revokeObjectURL(downloadRef.current); };
  }, []);

  function clearResult() { setSummary(null); setError(null); if (downloadRef.current) { URL.revokeObjectURL(downloadRef.current); downloadRef.current = null; } setDownload(null); }
  function addFiles(files: FileList | File[]) { const next: Uploads = {}; Array.from(files).forEach((file) => { const name = REQUIRED_FILES.find((item) => item.toLowerCase() === file.name.toLowerCase()); if (name) next[name] = file; }); setUploads((current) => ({ ...current, ...next })); clearResult(); if (!Object.keys(next).length) setError('Les fichiers doivent conserver les quatre noms SAP attendus.'); }
  function onDrop(event: DragEvent<HTMLLabelElement>) { event.preventDefault(); setIsDragging(false); addFiles(event.dataTransfer.files); }
  function onChange(event: ChangeEvent<HTMLInputElement>) { if (event.target.files) addFiles(event.target.files); event.target.value = ''; }
  function removeFile(name: RequiredFile) { setUploads((current) => { const next = { ...current }; delete next[name]; return next; }); clearResult(); }
  function generate() { if (!complete || !workerRef.current) return; if (extractDate < cutoffDate) { setError("La date d’extraction SAP doit être égale ou postérieure à la date d’arrêté."); return; } clearResult(); setProgress({ label: 'Lecture locale des exports SAP…', value: 8 }); workerRef.current.postMessage({ type: 'build', files: REQUIRED_FILES.map((name) => [name, uploads[name]]), cutoffDate, extractDate }); }

  return <main className="tor-page">
    <div className="tor-noise" />
    <nav className="tor-nav"><Link href="/consulting#portfolio" className="tor-back"><ArrowLeft size={16} /> Mes créations</Link><div className="tor-brand"><span>XR</span> Time Off Control</div><div className="tor-private"><LockKeyhole size={14} /> Traitement 100 % local</div></nav>
    <section className="tor-hero"><div className="tor-hero-copy"><div className="tor-eyebrow"><Sparkles size={15} /> SAP SuccessFactors · Time Off</div><h1>Vos compteurs. <em>Sous contrôle.</em></h1><p>Transformez quatre exports SAP en un rapport de contrôle précis, lisible et immédiatement exploitable. Rien ne quitte votre navigateur.</p><div className="tor-proof"><span><ShieldCheck size={17} /> Aucun envoi serveur</span><span><FileSpreadsheet size={17} /> Excel généré localement</span></div><a href="#generator" className="tor-primary-link">Générer mon rapport <ArrowRight size={17} /></a></div><div className="tor-visual-wrap"><div className="tor-visual-glow" /><img src="/time-off-report-hero.png" alt="Illustration abstraite de contrôle sécurisé des données Time Off" className="tor-visual" /><div className="tor-float tor-float-top"><CheckCircle2 size={16} /> 5 onglets de contrôle</div><div className="tor-float tor-float-bottom"><LockKeyhole size={16} /> Données jamais conservées</div></div></section>
    <section className="tor-value-grid"><article><span>01</span><h2>Fiable</h2><p>Dédoublonnage, soldes à date, snapshots et alertes reproduisent la recette de référence.</p></article><article><span>02</span><h2>Confidentiel</h2><p>Les CSV sont lus dans un Web Worker. Pas de base, pas d’API, pas de télémétrie.</p></article><article><span>03</span><h2>Actionnable</h2><p>Un classeur Excel prêt à partager avec synthèse, anomalies et piste d’audit.</p></article></section>
    <section id="generator" className="tor-generator"><div className="tor-generator-intro"><div className="tor-eyebrow"><UploadCloud size={15} /> Espace de traitement privé</div><h2>Déposez. Contrôlez. Téléchargez.</h2><p>Les fichiers restent en mémoire le temps de cette session, puis sont éliminés à la fermeture ou à la réinitialisation de la page.</p></div><div className="tor-date-grid"><label>Date d’arrêté<input type="date" value={cutoffDate} onChange={(event) => { setCutoffDate(event.target.value); clearResult(); }} /></label><label>Date d’extraction SAP<input type="date" value={extractDate} onChange={(event) => { setExtractDate(event.target.value); clearResult(); }} /></label></div><p className="tor-date-note"><CalendarDays size={15} /> La date d’extraction sépare les mouvements postérieurs à l’arrêté de ceux datés après l’export.</p>
      <label className={`tor-dropzone ${isDragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop}><UploadCloud size={31} /><strong>Glissez les quatre exports SAP ici</strong><span>ou sélectionnez-les sur votre poste — CSV uniquement</span><input type="file" accept=".csv,text/csv" multiple onChange={onChange} /></label>
      <div className="tor-file-grid">{REQUIRED_FILES.map((name) => { const file = uploads[name]; return <div key={name} className={`tor-file ${file ? 'is-ready' : ''}`}><span className="tor-file-state">{file ? <CheckCircle2 size={18} /> : <FileSpreadsheet size={18} />}</span><div><strong>{FILE_LABELS[name]}</strong><small>{file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} Mo` : name}</small></div>{file && <button type="button" onClick={() => removeFile(name)} aria-label={`Retirer ${name}`}><X size={16} /></button>}</div>; })}</div>
      {error && <div className="tor-error">{error}</div>}{progress && <div className="tor-progress"><div><span>{progress.label}</span><b>{progress.value}%</b></div><i><em style={{ width: `${progress.value}%` }} /></i></div>}<button type="button" className="tor-generate" disabled={!complete || Boolean(progress)} onClick={generate}><Sparkles size={18} /> Générer le rapport de contrôle</button>
      {summary && download && <div className="tor-result"><div><CheckCircle2 size={26} /><div><strong>Rapport prêt à télécharger</strong><span>Le fichier a été créé dans votre navigateur.</span></div></div><div className="tor-kpis"><span><b>{summary.activeAccounts.toLocaleString('fr-FR')}</b> comptes inclus</span><span><b>{summary.futureMovementRows.toLocaleString('fr-FR')}</b> mouvements postérieurs</span><span><b>{summary.duplicateRowsRemoved.toLocaleString('fr-FR')}</b> doublons écartés</span><span><b>{summary.reviewAccounts.toLocaleString('fr-FR')}</b> à vérifier</span></div><a className="tor-download" href={download.url} download={download.filename}><FileSpreadsheet size={18} /> Télécharger l’Excel</a></div>}
    </section>
  </main>;
}
