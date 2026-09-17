"use client";

import { CURRENT_RELEASE, GITHUB_RELEASES } from "../../lib/site-data";

type DownloadAppButtonProps = {
  className?: string;
  compact?: boolean;
  onNavigate?: () => void;
};

export function DownloadAppButton({ className = "btn btn-download", compact = false, onNavigate }: DownloadAppButtonProps) {
  return (
    <a className={className} href={GITHUB_RELEASES.download} onClick={onNavigate}>
      <i className="bi bi-download" aria-hidden="true" />
      {compact ? "Baixar app" : `Baixar versão ${CURRENT_RELEASE.label}`}
    </a>
  );
}
