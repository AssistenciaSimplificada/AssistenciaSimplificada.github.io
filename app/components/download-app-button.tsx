"use client";

import { useState } from "react";
import { GITHUB_RELEASES } from "../../lib/site-data";

type ReleaseAsset = {
  name?: unknown;
  browser_download_url?: unknown;
};

type LatestRelease = {
  assets?: unknown;
};

const ALLOWED_DOWNLOAD_HOSTS = new Set([
  "github.com",
]);
const OFFICIAL_RELEASE_PATH = /^\/GabrielSchmeisk\/Orcamentos-Atualizacoes\/releases\/download\/[^/]+\/Orcamentos-Simplificados-Setup-[\w.-]+\.exe$/i;

function findInstaller(payload: LatestRelease) {
  if (!Array.isArray(payload.assets)) return null;

  for (const rawAsset of payload.assets as ReleaseAsset[]) {
    if (typeof rawAsset.name !== "string" || typeof rawAsset.browser_download_url !== "string") continue;
    const isMainInstaller = /^Orcamentos-Simplificados-Setup-[\w.-]+\.exe$/i.test(rawAsset.name)
      && !/(emissor|license|licen[cç]a)/i.test(rawAsset.name);
    if (!isMainInstaller) continue;

    try {
      const url = new URL(rawAsset.browser_download_url);
      const fileName = decodeURIComponent(url.pathname.split("/").at(-1) || "");
      if (
        url.protocol === "https:"
        && ALLOWED_DOWNLOAD_HOSTS.has(url.hostname)
        && OFFICIAL_RELEASE_PATH.test(url.pathname)
        && fileName === rawAsset.name
      ) return url.href;
    } catch {
      // O fallback oficial continua disponível se a API retornar uma URL inválida.
    }
  }

  return null;
}

type DownloadAppButtonProps = {
  className?: string;
  compact?: boolean;
  onNavigate?: () => void;
};

export function DownloadAppButton({ className = "btn btn-download", compact = false, onNavigate }: DownloadAppButtonProps) {
  const [loading, setLoading] = useState(false);

  async function downloadLatest() {
    if (loading) return;
    setLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8_000);

    try {
      const response = await fetch(GITHUB_RELEASES.api, {
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-store",
        credentials: "omit",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`GitHub respondeu ${response.status}`);

      const installerUrl = findInstaller(await response.json() as LatestRelease);
      onNavigate?.();
      window.location.assign(installerUrl || GITHUB_RELEASES.fallback);
    } catch {
      onNavigate?.();
      window.location.assign(GITHUB_RELEASES.fallback);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <button className={className} type="button" onClick={downloadLatest} disabled={loading} aria-busy={loading}>
      <i className={`bi ${loading ? "bi-arrow-repeat download-spinner" : "bi-download"}`} aria-hidden="true" />
      {loading ? "Buscando versão..." : compact ? "Baixar app" : "Baixar versão estável"}
    </button>
  );
}
