// src/utils/scrollToId.ts
export const scrollToId = (hash: string): void => {
    const id: string = hash.replace("#", "");
    const el: HTMLElement | null = document.getElementById(id);
    if (!el) return;
  
    const headerOffset: number = 64;
    const y: number = el.getBoundingClientRect().top + window.scrollY - headerOffset;
  
    window.scrollTo({ top: y, behavior: "smooth" });
  };