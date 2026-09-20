import React, { useState } from "react";

interface Props {
  onAuthenticated: () => void;
}

export function AuthPage({ onAuthenticated }: Props) {
  const [showPaste, setShowPaste] = useState(false);
  const [cookies, setCookies] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBrowserLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.api.auth.browserLogin();
      if (result.success) onAuthenticated();
      else setError(result.error || "Login failed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasteImport = async () => {
    if (!cookies.trim()) {
      setError("Please paste your cookies.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await window.api.auth.import(cookies.trim());
      if (result.success) onAuthenticated();
      else setError(result.error || "Authentication failed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>YTBSSync</h1>
      <p>
        Sign in to your Google account so YTBSSync can read your YouTube Music
        liked songs, then match them to Beat Saber maps on BeatSaver.
      </p>

      <button
        className="btn btn-primary"
        onClick={() => void handleBrowserLogin()}
        disabled={loading}
        style={{ fontSize: 16, padding: "12px 24px" }}
      >
        {loading ? "Waiting for sign-in…" : "Sign in with Google"}
      </button>

      {!showPaste && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowPaste(true)}
          style={{ marginTop: 8 }}
        >
          Or paste cookies manually
        </button>
      )}

      {showPaste && (
        <>
          <textarea
            className="auth-textarea"
            placeholder="Paste Netscape cookies.txt or header format cookies…"
            value={cookies}
            onChange={(e) => setCookies(e.target.value)}
            disabled={loading}
          />
          <button
            className="btn btn-secondary"
            onClick={() => void handlePasteImport()}
            disabled={loading}
          >
            Import cookies
          </button>
        </>
      )}

      {error && <div className="auth-error">{error}</div>}
    </div>
  );
}
