const KEY = "pf_visitor";

/** Anonymous per-browser id used for likes when nobody is signed in. */
export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID(); // storage blocked: likes still work for this visit
  }
}
