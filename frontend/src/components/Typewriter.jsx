import { useEffect, useState } from "react";

export default function TypewriterText({ text, speed = 10, className = "" }) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown("");
    setDone(false);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i += 3;
      if (i >= text.length) {
        setShown(text);
        setDone(true);
        clearInterval(id);
      } else {
        setShown(text.slice(0, i));
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span className={className}>
      {shown}
      {!done && <span className="inline-block w-1.5 h-3.5 bg-current ml-0.5 align-middle animate-pulseGlow" />}
    </span>
  );
}
