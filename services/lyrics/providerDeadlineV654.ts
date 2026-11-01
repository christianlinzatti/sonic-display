/** Bound the caller's wait for third-party lyrics. A dependency without AbortSignal
 * (such as genius-lyrics-api) may finish its own network work later; callers no
 * longer wait indefinitely, and late results cannot overwrite selected lyrics.
 */
export function withProviderDeadlineV654<T>(task: Promise<T>, timeoutMs: number): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return Promise.reject(new Error('Invalid provider deadline'));
  return new Promise<T>((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Lyrics provider timeout')),timeoutMs);
    void Promise.resolve(task).then(
      value=>{clearTimeout(timer);resolve(value);},
      error=>{clearTimeout(timer);reject(error);},
    );
  });
}
