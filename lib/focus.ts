const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']"
].join(",");

export function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("inert") && el.offsetParent !== null
  );
}

/**
 * Trap focus inside `root` while active. Call the returned cleanup to release.
 * Pressing Tab cycles within `root`; Shift+Tab cycles in reverse.
 */
export function trapFocus(root: HTMLElement) {
  const previouslyFocused = document.activeElement as HTMLElement | null;

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Tab") return;
    const focusable = getFocusable(root);
    if (focusable.length === 0) {
      event.preventDefault();
      root.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || !root.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  root.addEventListener("keydown", handleKeyDown);

  // Move focus to the first focusable element if focus isn't already inside.
  if (!root.contains(document.activeElement)) {
    const focusable = getFocusable(root);
    (focusable[0] ?? root).focus();
  }

  return () => {
    root.removeEventListener("keydown", handleKeyDown);
    if (previouslyFocused && document.contains(previouslyFocused)) {
      previouslyFocused.focus();
    }
  };
}
