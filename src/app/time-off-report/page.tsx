'use client';

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Archive, ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, FileSpreadsheet, LockKeyhole, ShieldCheck, Sparkles, UploadCloud, X } from 'lucide-react';
import './time-off-report.css';
import './time-off-report-zip.css';

const REQUIRED_FILES = ['Time Account.csv', 'Time Account-Time Account Details.csv', 'Time Account Snapshot.csv', 'Time Account Type.csv'] as const;
type RequiredFile = (typeof REQUIRED_FILES)[number];
type Uploads = Partial<Record<RequiredFile, File>>;
type Summary = { rawDetailRows: number; uniqueDetailRows: number; duplicateRowsRemoved: number; activeAccounts: number; uniqueUsers: number; uniqueTypes: number; futureMovementRows: number; reviewAccounts: number };
type ZipInspection = { valid: boolean; found: RequiredFile[]; missing: RequiredFile[]; duplicates: RequiredFile[]; message: string };
type ArchiveUpload = { id: string; file: File; inspection?: ZipInspection };
type WorkerMessage = { type: 'progress'; label: string; value: number } | { type: 'complete'; summary: Summary; filename: string; buffer: ArrayBuffer } | { type: 'zipInspection'; archiveId: string; inspection: ZipInspection } | { type: 'error'; message: string };
const FILE_LABELS: Record<RequiredFile, string> = { 'Time Account.csv': 'Comptes Time Off', 'Time Account-Time Account Details.csv': 'Écritures de compte', 'Time Account Snapshot.csv': 'Snapshots SAP', 'Time Account Type.csv': 'Types de compte' };

export default function TimeOffReportPage() {
  const workerRef = useRef<Worker | null>(null);
  const downloadRef = useRef<string | null>(null);
  const archiveNumberRef = useRef(0);
  const [uploads, setUploads] = useState<Uploads>({});
  const [archives, setArchives] = useState<ArchiveUpload[]>([]);
  const [cutoffDate, setCutoffDate] = useState('2026-06-30');
  const [extractDate, setExtractDate] = useState(new Date().toISOString().slice(0, 10));
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<{ label: string; value: number } | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [download, setDownload] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const coverage = useMemo(() => {
    const sources = new Map<RequiredFile, string[]>();
    REQUIRED_FILES.forEach((name) => sources.set(name, uploads[name] ? ['CSV'] : []));
    archives.forEach((archive) => archive.inspection?.found.forEach((name) => sources.get(name)!.push(archive.id)));
    const missing = REQUIRED_FILES.filter((name) => !sources.get(name)!.length);
    const duplicates = REQUIRED_FILES.filter((name) => sources.get(name)!.length > 1);
    const pending = archives.some((archive) => !archive.inspection);
    const invalid = archives.find((archive) => archive.inspection && !archive.inspection.valid);
    return { sources, missing, duplicates, pending, invalid };
  }, [archives, uploads]);
  const complete = !coverage.pending && !coverage.invalid && !coverage.missing.length && !coverage.duplicates.length;
  const validationMessage = coverage.invalid?.inspection?.message
    || (coverage.duplicates.length ? `Doublon détecté : ${coverage.duplicates.join(', ')} est présent dans plusieurs sources.` : null)
    || (archives.length && coverage.missing.length ? `Ajoutez une autre archive ou les CSV manquants : ${coverage.missing.join(', ')}.` : null);

  useEffect(() => {
    const worker = new Worker(new URL('./time-off-report-zip.worker.ts', import.meta.url));
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message.type === 'progress') { setProgress({ label: message.label, value: message.value }); return; }
      if (message.type === 'zipInspection') {
        setArchives((current) => current.map((archive) => archive.id === message.archiveId ? { ...archive, inspection: message.inspection } : archive));
        setProgress(null);
        return;
      }
      if (message.type === 'error') { setProgress(null); setError(message.message); return; }
      const url = URL.createObjectURL(new Blob([message.buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      if (downloadRef.current) URL.revokeObjectURL(downloadRef.current);
      downloadRef.current = url;
      setDownload({ url, filename: message.filename });
      setSummary(message.summary);
      setProgress(null);
    };
    return () => { worker.terminate(); if (downloadRef.current) URL.revokeObjectURL(downloadRef.current); };
  }, []);

  function clearResult() {
    setSummary(null);
    setError(null);
    if (downloadRef.current) { URL.revokeObjectURL(downloadRef.current); downloadRef.current = null; }
    setDownload(null);
  }

  function inspectZip(file: File) {
    clearResult();
    const id = `zip-${++archiveNumberRef.current}`;
    setArchives((current) => [...current, { id, file }]);
    setProgress({ label: 'Contrôle local des archives ZIP…', value: 12 });
    workerRef.current?.postMessage({ type: 'inspectZip', archiveId: id, archive: file });
  }

  function addFiles(files: FileList | File[]) {
    const allFiles = Array.from(files);
    const zips = allFiles.filter((file) => file.name.toLowerCase().endsWith('.zip'));
    const next: Uploads = {};
    allFiles.forEach((file) => {
      const name = REQUIRED_FILES.find((item) => item.toLowerCase() === file.name.toLowerCase());
      if (name) next[name] = file;
    });
    if (Object.keys(next).length) { setUploads((current) => ({ ...current, ...next })); clearResult(); }
    zips.forEach(inspectZip);
    if (!zips.length && !Object.keys(next).length) setError('Déposez des archives ZIP ou les quatre CSV SAP aux noms attendus.');
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) { event.preventDefault(); setIsDragging(false); addFiles(event.dataTransfer.files); }
  function onChange(event: ChangeEvent<HTMLInputElement>) { if (event.target.files) addFiles(event.target.files); event.target.value = ''; }
  function removeFile(name: RequiredFile) { setUploads((current) => { const next = { ...current }; delete next[name]; return next; }); clearResult(); }
  function removeArchive(id: string) { setArchives((current) => current.filter((archive) => archive.id !== id)); clearResult(); }
  function generate() {
    if (!complete || !workerRef.current) return;
    if (extractDate < cutoffDate) { setError('La date d’extraction SAP doit être égale ou postérieure à la date d’arrêté.'); return; }
    clearResult();
    setProgress({ label: archives.length ? 'Extraction locale des archives SAP…' : 'Lecture locale des exports SAP…', value: 18 });
    workerRef.current.postMessage({ type: 'build', files: REQUIRED_FILES.map((name) => [name, uploads[name]]), archives: archives.map((archive) => archive.file), cutoffDate, extractDate });
  }

  return <main className="tor-page"><div className="tor-noise" /><nav className="tor-nav"><Link href="/consulting#portfolio" className="tor-back"><ArrowLeft size={16} /> Mes créations</Link><div className="tor-brand"><span>XR</span> Time Off Control</div><div className="tor-private"><LockKeyhole size={14} /> Traitement 100 % local</div></nav><section className="tor-hero"><div className="tor-hero-copy"><div className="tor-eyebrow"><Sparkles size={15} /> SAP SuccessFactors · Time Off</div><h1>Vos compteurs. <em>Sous contrôle.</em></h1><p>Transformez quatre exports SAP en un rapport de contrôle précis, lisible et immédiatement exploitable. Rien ne quitte votre navigateur.</p><div className="tor-proof"><span><ShieldCheck size={17} /> Aucun envoi serveur</span><span><FileSpreadsheet size={17} /> Excel généré localement</span></div><a href="#generator" className="tor-primary-link">Générer mon rapport <ArrowRight size={17} /></a></div><div className="tor-visual-wrap"><div className="tor-visual-glow" /><img src="/time-off-report-hero.png" alt="Illustration abstraite de contrôle sécurisé des données Time Off" className="tor-visual" /><div className="tor-float tor-float-top"><CheckCircle2 size={16} /> 5 onglets de contrôle</div><div className="tor-float tor-float-bottom"><LockKeyhole size={16} /> Données jamais conservées</div></div></section><section className="tor-value-grid"><article><span>01</span><h2>Fiable</h2><p>Dédoublonnage, soldes à date, snapshots et alertes reproduisent la recette de référence.</p></article><article><span>02</span><h2>Confidentiel</h2><p>Les CSV sont lus dans un Web Worker. Pas de base, pas d’API, pas de télémétrie.</p></article><article><span>03</span><h2>Actionnable</h2><p>Un classeur Excel prêt à partager avec synthèse, anomalies et piste d’audit.</p></article></section><section id="generator" className="tor-generator"><div className="tor-generator-intro"><div className="tor-eyebrow"><UploadCloud size={15} /> Espace de traitement privé</div><h2>Déposez. Contrôlez. Téléchargez.</h2><p>Déposez autant d’archives ZIP SAP que nécessaire : les quatre exports peuvent être répartis entre plusieurs ZIP. Les données restent en mémoire pendant cette session.</p></div><div className="tor-date-grid"><label>Date d’arrêté<input type="date" value={cutoffDate} onChange={(event) => { setCutoffDate(event.target.value); clearResult(); }} /></label><label>Date d’extraction SAP<input type="date" value={extractDate} onChange={(event) => { setExtractDate(event.target.value); clearResult(); }} /></label></div><p className="tor-date-note"><CalendarDays size={15} /> Les archives sont contrôlées localement, puis leurs CSV sont réunis sans jamais quitter votre navigateur.</p><label className={`tor-dropzone ${isDragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop}><Archive size={31} /><strong>Glissez autant de ZIP SAP que nécessaire</strong><span>Les quatre exports peuvent être répartis entre plusieurs archives</span><input type="file" accept=".zip,application/zip,.csv,text/csv" multiple onChange={onChange} /></label>{archives.length > 0 && <div className="tor-archive-list">{archives.map((archive) => <div key={archive.id} className={`tor-archive ${archive.inspection?.valid ? 'is-ready' : archive.inspection ? 'is-invalid' : ''}`}><Archive size={20} /><div><strong>{archive.file.name}</strong><small>{archive.inspection ? archive.inspection.message : 'Vérification locale de l’archive en cours…'}</small></div><button type="button" onClick={() => removeArchive(archive.id)} aria-label={`Retirer ${archive.file.name}`}><X size={16} /></button></div>)}</div>}<div className="tor-file-grid">{REQUIRED_FILES.map((name) => { const file = uploads[name]; const sourceCount = coverage.sources.get(name)!.length; const fromArchive = sourceCount > 0 && !file; return <div key={name} className={`tor-file ${sourceCount === 1 ? 'is-ready' : ''} ${sourceCount > 1 ? 'is-conflict' : ''}`}><span className="tor-file-state">{sourceCount === 1 ? <CheckCircle2 size={18} /> : <FileSpreadsheet size={18} />}</span><div><strong>{FILE_LABELS[name]}</strong><small>{file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} Mo` : fromArchive ? 'Trouvé dans une archive ZIP' : name}</small></div>{file && <button type="button" onClick={() => removeFile(name)} aria-label={`Retirer ${name}`}><X size={16} /></button>}</div>; })}</div>{(error || validationMessage) && <div className="tor-error">{error || validationMessage}</div>}{progress && <div className="tor-progress"><div><span>{progress.label}</span><b>{progress.value}%</b></div><i><em style={{ width: `${progress.value}%` }} /></i></div>}<button type="button" className="tor-generate" disabled={!complete || Boolean(progress)} onClick={generate}><Sparkles size={18} /> Générer le rapport de contrôle</button>{summary && download && <div className="tor-result"><div><CheckCircle2 size={26} /><div><strong>Rapport prêt à télécharger</strong><span>Le fichier a été créé dans votre navigateur.</span></div></div><div className="tor-kpis"><span><b>{summary.activeAccounts.toLocaleString('fr-FR')}</b> comptes inclus</span><span><b>{summary.futureMovementRows.toLocaleString('fr-FR')}</b> mouvements postérieurs</span><span><b>{summary.duplicateRowsRemoved.toLocaleString('fr-FR')}</b> doublons écartés</span><span><b>{summary.reviewAccounts.toLocaleString('fr-FR')}</b> à vérifier</span></div><a className="tor-download" href={download.url} download={download.filename}><FileSpreadsheet size={18} /> Télécharger l’Excel</a></div>}</section></main>;
}
