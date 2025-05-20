import { useCallback } from 'react';
import { fillMissingNavDates } from '../utils/fillMissingNavDates';

export function usePortfolioPlot({
  portfolios,
  years,
  loadNavData,
  plotState,
}) {
  // Handler for plotting all portfolios
  const handlePlotAllPortfolios = useCallback(async () => {
    plotState.setLoadingNav(true);
    plotState.setLoadingXirr(false);
    plotState.setHasPlotted(false);
    plotState.setNavDatas({});
    plotState.setLumpSumXirrDatas({});
    plotState.setSipXirrDatas({});
    plotState.setXirrError(null);
    try {
      const allNavDatas: Record<string, any[][]> = {}; // key: portfolio index, value: array of nav arrays
      const allNavsFlat: Record<string, any[]> = {}; // for navDatas prop
      for (let pIdx = 0; pIdx < portfolios.length; ++pIdx) {
        const schemes = portfolios[pIdx].selectedSchemes.filter(Boolean) as number[];
        const navs: any[][] = [];
        for (const scheme of schemes) {
          const nav = await loadNavData(scheme);
          if (!Array.isArray(nav) || nav.length === 0) continue;
          const filled = fillMissingNavDates(nav);
          navs.push(filled);
          allNavsFlat[`${pIdx}_${scheme}`] = filled;
        }
        allNavDatas[pIdx] = navs;
      }
      plotState.setNavDatas(allNavsFlat);
      // Now calculate XIRR for each portfolio using the worker
      plotState.setLoadingXirr(true);
      const allSipXirrDatas: Record<string, any[]> = {};
      let completed = 0;
      for (let pIdx = 0; pIdx < portfolios.length; ++pIdx) {
        const navDataList = allNavDatas[pIdx];
        const allocations = portfolios[pIdx].allocations;
        const rebalancingEnabled = portfolios[pIdx].rebalancingEnabled;
        const rebalancingThreshold = portfolios[pIdx].rebalancingThreshold;
        if (!navDataList || navDataList.length === 0) {
          allSipXirrDatas[`Portfolio ${pIdx + 1}`] = [];
          completed++;
          continue;
        }
        await new Promise<void>((resolve) => {
          const worker = new Worker(new URL('../utils/xirrWorker.ts', import.meta.url));
          worker.postMessage({ navDataList, years, allocations, rebalancingEnabled, rebalancingThreshold });
          worker.onmessage = (event: MessageEvent) => {
            allSipXirrDatas[`Portfolio ${pIdx + 1}`] = event.data;
            worker.terminate();
            completed++;
            resolve();
          };
          worker.onerror = (err: ErrorEvent) => {
            allSipXirrDatas[`Portfolio ${pIdx + 1}`] = [];
            worker.terminate();
            completed++;
            resolve();
          };
        });
      }
      plotState.setSipXirrDatas(allSipXirrDatas);
      plotState.setHasPlotted(true);
      plotState.setLoadingNav(false);
      plotState.setLoadingXirr(false);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      plotState.setXirrError('Error loading or calculating data: ' + errorMsg);
      console.error('Error loading or calculating data:', e);
      plotState.setLoadingNav(false);
      plotState.setLoadingXirr(false);
    }
  }, [portfolios, years, loadNavData, plotState]);

  return { handlePlotAllPortfolios };
} 