export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchWithRetries(url, options, {
    maxAttempts = 10,
    delayMs = 3000,
    timeoutPerAttemptMs = 15000,
    onAttempt,
} = {}) {
    let lastErr;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        onAttempt?.(attempt, maxAttempts);

        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), timeoutPerAttemptMs);

        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(t);
            return res;
        } catch (e) {
            clearTimeout(t);
            lastErr = e;

            if (attempt === maxAttempts) break;
            await sleep(delayMs);
        }
    }

    throw lastErr;
}
