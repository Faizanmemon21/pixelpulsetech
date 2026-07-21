"use client";

import { lazy, Suspense, useState } from "react";
import { MessageCircle, X } from "lucide-react";

// The panel (message list, Markdown rendering, streaming fetch logic) pulls
// in react-markdown + remark-gfm — a real chunk of weight. Keeping it behind
// a lazy import means only this tiny launcher button ships on first load;
// the panel downloads on first click, same discipline as the site's 3D
// canvases (mount only once the visitor actually wants it).
const ChatPanel = lazy(() => import("./ChatPanel"));

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat with the PixelPulse Assistant"}
        aria-expanded={open}
        className="glow-icon fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_30px_-6px_rgba(220,38,38,0.7)]"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {open && (
        <Suspense fallback={null}>
          <ChatPanel onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
