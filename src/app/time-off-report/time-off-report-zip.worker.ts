/// <reference lib="webworker" />

import JSZip from 'jszip';
import './time-off-report.worker';

const REQUIRED_FILES = ['Time Account.csv', 'Time Account-Time Account Details.csv', 'Time Account Snapshot.csv', 'Time Account Type.csv'] as const;
type RequiredFile = (typeof REQUIRED_FILES)[number];
type Inspection = { valid: boolean; found: RequiredFile[]; missing: RequiredFile[]; duplicates: RequiredFile[]; message: string; zip?: JSZip; matches?: Map<string, string[]> };
type EventPayload =
  | { type: 'inspectZip'; archiveId: string; archive: File }
  | { type: 'build'; files: [string, File | undefined][]; archives: File[]; cutoffDate: string; extractDate: string };

const legacyHandler = self.onmessage!;
const baseName = (path: string) => path.split('/').pop()?.toLowerCase() || '';

async function inspect(archive: File): Promise<Inspection> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(archive);
  } catch {
    return { valid: false, found: [], missing: [...REQUIRED_FILES], duplicates: [], message: 'Le fichier déposé n’est pas une archive ZIP lisible.' };
  }

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
  const valid = found.length > 0 && !duplicates.length;
  const message = !found.length
    ? 'Cette archive ne contient aucun des quatre exports SAP attendus.'
    : duplicates.length
      ? `Archive ambiguë : plusieurs occurrences de ${duplicates.join(', ')}.`
      : missing.length
        ? `Archive partielle : ${found.length} export(s) SAP détecté(s).`
        : 'Archive conforme : les quatre exports SAP sont présents.';
  return { valid, found, missing, duplicates, message, zip, matches };
}

async function extract(archive: File) {
  const inspection = await inspect(archive);
  if (!inspection.valid || !inspection.zip || !inspection.matches) throw new Error(inspection.message);
  const files: [RequiredFile, File][] = [];
  for (const name of inspection.found) {
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
      postMessage({ type: 'zipInspection', archiveId: event.data.archiveId, inspection });
      return;
    }

    const merged = new Map<string, File>();
    event.data.files.forEach(([name, file]) => { if (file) merged.set(name, file); });
    for (const archive of event.data.archives) {
      for (const [name, file] of await extract(archive)) {
        if (merged.has(name)) throw new Error(`Le fichier ${name} est présent dans plusieurs sources. Retirez le doublon avant de générer le rapport.`);
        merged.set(name, file);
      }
    }
    const files = [...merged.entries()] as [string, File][];
    legacyHandler.call(self, { data: { ...event.data, files } } as MessageEvent);
  } catch (error) {
    postMessage({ type: 'error', message: error instanceof Error ? error.message : 'Impossible de lire les archives ZIP localement.' });
  }
};
