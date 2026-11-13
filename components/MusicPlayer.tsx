"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const sync = () => setSlot(document.getElementById("lavie-header-music"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) { audio.volume = 0.35; await audio.play(); setPlaying(true); }
      else { audio.pause(); setPlaying(false); }
    } catch { setPlaying(false); }
  }
  const button = <button type="button" aria-label={playing ? "Pause music" : "Play music"} aria-pressed={playing} title={playing ? "Pause music" : "Play music"} onClick={toggleMusic} className={slot ? "lavie-music-header-button" : "music-floating-btn"}><span aria-hidden="true">{playing ? "♫" : "♪"}</span></button>;
  return <><audio ref={audioRef} src="/music/background-music.mp3" loop preload="none" />{slot ? createPortal(button, slot) : button}</>;
}
