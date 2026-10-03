"use client";

import { useEffect, useRef, useState } from "react";

// Shows up to 3 lines of text. If the text is longer, a "See more" / "See less" toggle appears.
export default function EventDescription({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isLong, setIsLong] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Only measure while collapsed; once the text is known to be long, keep the toggle visible
    const check = () => {
      if (!expanded) setIsLong(el.scrollHeight > el.clientHeight + 1);
    };
    check();

    const observer = new ResizeObserver(check); // re-check on rotate / resize
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  return (
    <div className="mt-3">
      <p
        ref={ref}
        className={`whitespace-pre-line text-sm leading-5 text-gray-600 ${expanded ? "" : "line-clamp-3"}`}
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-1 text-sm font-medium text-blue-700 hover:underline"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}