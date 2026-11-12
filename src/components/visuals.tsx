// Visual helpers — cover images, counselor initial avatars, test monograms.
// Purely presentational; no data, pricing or logic lives here.
// Covers are embedded data URIs (see src/lib/covers.ts): the snapshot-sync
// push path is UTF-8 text only and cannot carry binary .webp files.
import { COVERS } from '@/lib/covers';

export function coverFor(kind: string): string {
  const k = ['book', 'audio', 'video', 'course'].includes(kind) ? kind : 'book';
  return COVERS[k];
}

export function initials(name: string): string {
  const parts = name.replace(/^Dr\.\s*/i, '').split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || 'V';
  const second = parts[1]?.[0] || '';
  return (first + second).toUpperCase();
}

export function avatarTone(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `g${(h % 4) + 1}`;
}

export function Avatar({ name }: { name: string }) {
  return (
    <span className={`avatar ${avatarTone(name)}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function ContentCover({ kind }: { kind: string }) {
  return <img className="card-media" src={coverFor(kind)} alt="" loading="lazy" />;
}

export function TestMark({ title }: { title: string }) {
  return (
    <span className="test-mark" aria-hidden="true">
      {(title.trim()[0] || 'V').toUpperCase()}
    </span>
  );
}
