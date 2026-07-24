/// <reference lib="webworker" />

import JSZip from 'jszip';
import './time-off-report.worker';

const REQUIRED_FILES = ['Time Account.csv', 'Time Account-Time Account Details.csv', 'Time Account Snapshot.csv', 'Time Account Type.csv'] as const;
type RequiredFile = (typeof REQUIRED_FILES)[number];
type Inspection = { valid: boolean; found: RequiredFile[]; missing: RequiredFile[]; duplicates: RequiredFile[]; message: string; zip?: JSZip; matches?: Map<string, string[]> };
type EventPayload = { type: 'inspectZip'; archive: File } | { type: 'build'; files: [string, File][]; archive?: File | null; cutoffDate: string; extractDate: string };

const legacyHandler = self.onmessage!;
const baseName = (path: string) => path.split('/').pop()?.toLowerCase() || '';

async function inspect(archive: File): Promise<Inspection> {
  let zip: JSZip;
  try { zip = await JSZip.loadAsync(archive); }
  catch { return { valid: false, found: [], missing: [...REQUIRED_FILES], duplicates: [], message: 'Le fichier déposé n’est pas une archive ZIP lisible.' }; }
  const matches = new Map<string, string[]>();
  Object.values(zip.files).filter((entry) => !entry.dir).forEach((entry) => {
    const canonical = REQUIRED_FILES.find((name) => name.toLowerCase() === baseName(entry.name));
    if (!canonical) return;
    const paths = matches.get(canonical) || [];
    paths.push(entry.name);
    matches.set(canonical, paths);
  });
  const found = REQUIRED_FILES.filter((name) => matches.has(name));
  const missing = REQUIRED_FILES.filter((name) => !matches.has(name));
  const duplicates = REQUIRED_FILES.filter((name) => (matches.get(name)?.length || 0) > 1);
  const valid = !missing.length && !duplicates.length;
  const message = valid ? 'Archive conforme.' : duplicates.length ? `Archive ambiguë : plusieurs occurrences de ${duplicates.join(', ')}.` : `Archive incomplète : ${missing.join(', ')} est absent.`;
  return { valid, found, missing, duplicates, message, zip, matches };
}

async function expand(archive: File) {
  const inspection = await inspect(archive);
  if (!inspection.valid || !inspection.zip || !inspection.matches) throw new Error(inspection.message);
  const files: [string, File][] = [];
  for (const name of REQUIRED_FILES) {
    const path = inspection.matches.get(name)![0];
    const blob = await inspection.zip.file(path)!.async('blob');
    files.push([name, new File([blob], name, { type: 'text/csv' })]);
  }
  return files;
}

self.onmessage = async (event: MessageEvent<EventPayload>) => {
  try {
    if (event.data.type === 'inspectZip') {
      const { zip, matches, ...inspection } = await inspect(event.data.archive);
      postMessage({ type: 'zipInspection', inspection });
      return;
    }
    const files = event.data.archive ? await expand(event.data.archive) : event.data.files;
    legacyHandler.call(self, { data: { ...event.data, archive: undefined, files } } as MessageEvent);
  } catch (error) {
    postMessage({ type: 'error', message: error instanceof Error ? error.message : 'Impossible de lire l’archive ZIP localement.' });
  }
};
