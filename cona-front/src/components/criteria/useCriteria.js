import { useMemo } from "react";

export function useCriteria(value, criteria = []) {
  const evaluation = useMemo(() => {
    const passing = [];
    const failing = [];
    for (const c of criteria) {
      const ok = safeExecute(c.test, value);
      (ok ? passing : failing).push(c);
    }
    return { passing, failing, allPassed: failing.length === 0 && criteria.length > 0 };
  }, [value, criteria]);

  return { ...evaluation, evaluate: evaluation };
}

function safeExecute(fn, value) {
  try {
    return !!fn(value);
  } catch (_e) {
    return false;
  }
}
