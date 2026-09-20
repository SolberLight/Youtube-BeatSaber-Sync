import React, { useEffect, useRef, useState } from "react";

export function LogsView() {
  const [logs, setLogs] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const loadLogs = async () => {
    try {
      setLogs(await window.api.diagnostics.getLogs());
    } catch {
      setLogs("Failed to load logs.");
    }
    // Let the new content lay out before scrolling to the newest line.
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 50);
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Logs</h2>
        <button className="btn btn-secondary" onClick={() => void loadLogs()}>
          Refresh
        </button>
      </div>
      <div className="log-viewer" ref={containerRef}>
        {logs || "No logs yet."}
      </div>
    </div>
  );
}
