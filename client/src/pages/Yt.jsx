import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaClipboard,
  FaHome,
  FaPlay,
  FaTrash,
  FaTv,
  FaYoutube,
} from "react-icons/fa";

function extractYouTubeId(input) {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.replace(/^\//, "").split("/")[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      const pathMatch = url.pathname.match(
        /\/(embed|shorts|live)\/([a-zA-Z0-9_-]{11})/
      );
      if (pathMatch) return pathMatch[2];
    }
  } catch {
    return null;
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Yt = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [playInput, setPlayInput] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [error, setError] = useState("");
  const [serverMessage, setServerMessage] = useState("");

  const apiBase = import.meta.env.VITE_API_URL || "";


  // ── URL / video ID helpers ──────────────────────────────────────────────────
  const applyUrl = useCallback(
    (raw) => {
      const id = extractYouTubeId(raw);
      if (id) {
        setVideoId(id);
        setError("");
        setSearchParams({ v: id }, { replace: true });
        return true;
      }
      setError("Could not read a valid YouTube link or video ID.");
      return false;
    },
    [setSearchParams]
  );


  useEffect(() => {
    const vParam = searchParams.get("v");
    const urlParam = searchParams.get("url");
    if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
      setVideoId(vParam);
      setError("");
      return;
    }
    if (urlParam) applyUrl(decodeURIComponent(urlParam));
  }, [searchParams, applyUrl]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playInput.trim()) {
      setError("Paste a YouTube URL or video ID.");
      return;
    }
    applyUrl(playInput);
  };


  const embedSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
    : null;

  const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 relative overflow-hidden">
    <div className="relative z-10 flex flex-col flex-1">

      {/* Header */}
      <header className="bg-gray-950/80 backdrop-blur-md text-gray-100 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between">
          <motion.h1
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-300"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            Watch on YouTube
          </motion.h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">

        {/* Play form */}
        <motion.form
          onSubmit={handleSubmit}
          className="mb-8"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.35 }}
        >
          <label
            htmlFor="yt-url"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Paste YouTube URL or video ID
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="yt-url"
              type="text"
              value={playInput}
              onChange={(e) => setPlayInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 min-w-0 px-4 py-3 rounded-xl
                         border border-gray-700
                         bg-gray-900/80
                         text-gray-100
                         placeholder:text-gray-500
                         shadow-sm
                         focus:outline-none
                         focus:ring-2 focus:ring-orange-500
                         focus:border-transparent"
              autoComplete="off"
            />

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2
                         px-6 py-3 rounded-xl
                         bg-gradient-to-r from-orange-500 to-orange-600
                         text-white font-semibold
                         shadow-md
                         hover:from-orange-600 hover:to-orange-700
                         transition-all shrink-0"
            >
              <FaPlay className="text-sm" />
              Load video
            </button>
          </div>

          {error && (
            <p
              className="mt-2 text-sm text-red-400"
              role="alert"
            >
              {error}
            </p>
          )}
        </motion.form>

        {/* Embed player */}
        {embedSrc && (
          <motion.div
            className="rounded-2xl overflow-hidden
                       shadow-2xl
                       border border-gray-800
                       bg-black
                       aspect-video
                       w-full"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <iframe
              title="YouTube video player"
              src={embedSrc}
              className="w-full h-full min-h-[200px]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </motion.div>
        )}

        {!embedSrc && !error && (
          <p className="text-center text-gray-500 text-sm mt-8">
            Paste a link above to play the video here without leaving the site.
          </p>
        )}
      </main>
    </div>
  </div>
);
};

export default Yt;