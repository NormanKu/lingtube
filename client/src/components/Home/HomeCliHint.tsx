import { Terminal } from 'lucide-react';

export function HomeCliHint() {
  return (
    <div className="mb-8 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left">
      <Terminal size={18} className="mt-0.5 shrink-0 text-blue-500" />
      <div className="text-sm text-blue-700">
        <p className="font-medium">CLI Mode (no API key needed)</p>
        <p className="mt-1 text-blue-600">
          Run <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs">node cli/generate.js &lt;YouTube URL&gt;</code> to
          generate learning materials using Claude Code, then open the video here.
        </p>
      </div>
    </div>
  );
}
