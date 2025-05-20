// xirrWorker.ts - Web Worker for SIP XIRR calculation (Vite/TypeScript compatible)

self.onmessage = async function(e) {
  const { navDataList, years, allocations, rebalancingEnabled } = e.data;
  // Dynamically import the calculation function
  const module = await import('./sipRollingXirr');
  const result = module.calculateSipRollingXirr(navDataList, years, allocations, rebalancingEnabled);
  // Post the result back to the main thread
  self.postMessage(result);
}; 