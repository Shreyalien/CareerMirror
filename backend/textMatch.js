// Word-boundary-safe substring matching. Plain .includes() falsely matches
// keywords hiding inside unrelated words — e.g. "git" inside "digital",
// "api" inside "capital", "ios" inside "previous". \b anchors the match to
// real word boundaries so a keyword only counts when it actually appears
// as its own word (or exact phrase, for multi-word keywords).
export function wordMatch(text, keyword) {
  if (!text || !keyword) return false;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}
