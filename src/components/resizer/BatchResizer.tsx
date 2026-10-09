import { useRef, useState } from 'react';
import JSZip from 'jszip';
import { Layers, Loader2, Download, X } from 'lucide-react';
import { RESIZE_PRESETS, resizeImage, type ResizeMode } from '@/lib/imageResize';

const MAX_FILES = 100;

export function BatchResizer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [presetId, setPresetId] = useState(RESIZE_PRESETS[0].id);
  const [mode, setMode] = useState<ResizeMode>('fill');
  const [progress, setProgress] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const pick = (list: FileList | null) => {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith('image/'));
    const merged = [...files, ...imgs];
    setNotice(merged.length > MAX_FILES ? `Only the first ${MAX_FILES} images were kept.` : null);
    setFiles(merged.slice(0, MAX_FILES));
  };

  const run = async () => {
    const preset = RESIZE_PRESETS.find((p) => p.id === presetId)!;
    const zip = new JSZip();
    const used = new Set<string>();
    let failed = 0;
    setProgress(0);
    for (let i = 0; i < files.length; i++) {
      const src = URL.createObjectURL(files[i]);
      try {
        const out = await resizeImage(src, preset.width, preset.height, mode);
        URL.revokeObjectURL(out.url);
        let base = files[i].name.replace(/\.[^.]+$/, '') || `image-${i + 1}`;
        while (used.has(base)) base += '-1';
        used.add(base);
        zip.file(`${base}-${preset.width}x${preset.height}.png`, out.blob);
      } catch {
        failed++;
      } finally {
        URL.revokeObjectURL(src);
      }
      setProgress(i + 1);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `resized-${preset.id}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setProgress(null);
    setNotice(failed ? `${failed} image(s) couldn't be read and were skipped.` : 'Done — your ZIP is downloading.');
  };

  const busy = progress !== null;

  return (
    <section className="mt-6 p-4 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Layers className="w-4 h-4 text-primary" /> Bulk resize
          <span className="text-xs font-normal text-muted-foreground">up to {MAX_FILES} images</span>
        </div>
        {files.length > 0 && !busy && (
          <button onClick={() => { setFiles([]); setNotice(null); }} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />

      <button
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-50"
      >
        {files.length ? `${files.length} image${files.length > 1 ? 's' : ''} selected — add more` : 'Select images'}
      </button>

      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr,auto,auto] gap-2">
          <select value={presetId} onChange={(e) => setPresetId(e.target.value)} disabled={busy} aria-label="Target size"
            className="h-10 rounded-xl bg-background border border-border px-3 text-sm text-foreground">
            {RESIZE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.platform} · {p.label} ({p.width}×{p.height})</option>
            ))}
          </select>
          <select value={mode} onChange={(e) => setMode(e.target.value as ResizeMode)} disabled={busy} aria-label="Resize mode"
            className="h-10 rounded-xl bg-background border border-border px-3 text-sm text-foreground">
            <option value="fill">Fill</option>
            <option value="fit">Fit</option>
            <option value="stretch">Stretch</option>
          </select>
          <button onClick={run} disabled={busy}
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-70">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> {progress}/{files.length}</> : <><Download className="w-4 h-4" /> Resize all</>}
          </button>
        </div>
      )}

      {busy && (
        <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${(progress! / files.length) * 100}%` }} />
        </div>
      )}
      {notice && !busy && <p className="mt-2 text-xs text-muted-foreground">{notice}</p>}
    </section>
  );
}
