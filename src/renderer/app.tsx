import React, { useCallback, useEffect, useState } from "react";
import { AuthPage } from "./features/auth/auth-page";
import { LibraryView } from "./features/library/library-view";
import { SearchView, type LookupRequest } from "./features/search/search-view";
import { MatchView } from "./features/match/match-view";
import { DownloadsView } from "./features/downloads/downloads-view";
import { SettingsView } from "./features/settings/settings-view";
import { LogsView } from "./features/settings/logs-view";
import { LastPlayedCard } from "./features/now-playing/last-played-card";
import type { SongSearchResult } from "./lib/types";

type Page = "library" | "search" | "matches" | "downloads" | "settings" | "logs";

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>("matches");
  const [lookupRequest, setLookupRequest] = useState<LookupRequest | null>(null);

  const [pendingCount, setPendingCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [installedCount, setInstalledCount] = useState(0);

  const loadCounts = useCallback(async () => {
    try {
      const [matches, queue, downloads] = await Promise.all([
        window.api.matches.getAll(),
        window.api.downloads.getQueue(),
        window.api.downloads.getDownloads(),
      ]);

      setPendingCount(
        Object.values(matches.items).filter((m) => m.status === "pending").length
      );
      setActiveCount(queue.active.length + queue.pending.length);
      setFailedCount(queue.failed.length);
      setInstalledCount(
        Object.values(downloads.items).filter((d) => d.status === "completed")
          .length
      );
    } catch {
      // Counts are decoration; a failure here should not break navigation.
    }
  }, []);

  useEffect(() => {
    window.api.auth
      .status()
      .then((status) => setIsAuthenticated(status.isAuthenticated))
      .catch(() => setIsAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    void loadCounts();

    const events = [
      "match:finished",
      "decision:changed",
      "download:queued",
      "download:started",
      "download:finished",
      "download:failed",
      "download:allFinished",
      "sync:finished",
    ];

    const unsubs = events.map((channel) =>
      window.api.on(channel, () => void loadCounts())
    );

    return () => unsubs.forEach((u) => u());
  }, [isAuthenticated, loadCounts]);

  if (isAuthenticated === null) {
    return (
      <div className="auth-page">
        <p>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const findMapsFor = (song: SongSearchResult) => {
    setLookupRequest({ song, nonce: Date.now() });
    setCurrentPage("search");
  };

  const navItem = (page: Page, label: string, badges?: React.ReactNode) => (
    <button
      className={`sidebar-link ${currentPage === page ? "active" : ""}`}
      onClick={() => setCurrentPage(page)}
    >
      {label}
      {badges && <span className="sidebar-counts">{badges}</span>}
    </button>
  );

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-title">YTBSSync</div>
        <div className="sidebar-nav">
          {navItem("library", "Library")}
          {navItem("search", "Search")}
          {navItem(
            "matches",
            "Review",
            pendingCount > 0 ? (
              <span className="sidebar-badge sidebar-badge-pending">
                {pendingCount}
              </span>
            ) : null
          )}
          {navItem(
            "downloads",
            "Downloads",
            activeCount > 0 || failedCount > 0 || installedCount > 0 ? (
              <>
                {activeCount > 0 && (
                  <span className="sidebar-badge sidebar-badge-pending">
                    {activeCount}
                  </span>
                )}
                {installedCount > 0 && (
                  <span className="sidebar-badge sidebar-badge-completed">
                    {installedCount}
                  </span>
                )}
                {failedCount > 0 && (
                  <span className="sidebar-badge sidebar-badge-failed">
                    {failedCount}
                  </span>
                )}
              </>
            ) : null
          )}
          {navItem("settings", "Settings")}
          {navItem("logs", "Logs")}
        </div>

        <LastPlayedCard onFindMaps={findMapsFor} />
      </nav>

      <div className="main-content">
        {currentPage === "library" && <LibraryView />}
        {currentPage === "search" && (
          <SearchView
            request={lookupRequest}
            onRequestHandled={() => setLookupRequest(null)}
          />
        )}
        {currentPage === "matches" && <MatchView />}
        {currentPage === "downloads" && <DownloadsView />}
        {currentPage === "settings" && (
          <SettingsView onLogout={() => setIsAuthenticated(false)} />
        )}
        {currentPage === "logs" && <LogsView />}
      </div>
    </div>
  );
}
