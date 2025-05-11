import React, { useState, useEffect, useRef } from 'react';
import { MutualFundDropdown } from './components/MutualFundDropdown';
import { Container } from './components/Container';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useMutualFunds } from './hooks/useMutualFunds';
import { useNavData } from './hooks/useNavData';
import { calculateLumpSumRollingXirr } from './utils/lumpSumRollingXirr';
import { fillMissingNavDates } from './utils/fillMissingNavDates';
import { calculateSipRollingXirr, calculateSipRollingXirrMultipleFunds } from './utils/sipRollingXirr';
import { getQueryParams, setQueryParams } from './utils/queryParams';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { MultiFundCharts } from './components/MultiFundCharts';

const DEFAULT_SCHEME_CODE = 120716;
const COLORS = ['#007bff', '#28a745', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4', '#795548', '#607d8b'];

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const App: React.FC = () => {
  const { funds, loading, error } = useMutualFunds();
  const { loadNavData } = useNavData();

  // Multi-fund selection state
  const initialParams = getQueryParams();
  const [selectedSchemes, setSelectedSchemes] = useState<(number | null)[]>(
    initialParams.schemes && initialParams.schemes.length > 0
      ? initialParams.schemes
      : [DEFAULT_SCHEME_CODE]
  );
  const [years, setYears] = useState<number>(initialParams.years || 1);
  const [navDatas, setNavDatas] = useState<Record<number, any[]>>({});
  const [lumpSumXirrDatas, setLumpSumXirrDatas] = useState<Record<string, any[]>>({});
  const [sipXirrDatas, setSipXirrDatas] = useState<Record<string, any[]>>({});
  const [hasPlotted, setHasPlotted] = useState(false);
  const [loadingNav, setLoadingNav] = useState(false);
  const [loadingXirr, setLoadingXirr] = useState(false);
  const [xirrError, setXirrError] = useState<string | null>(null);
  const navLoadingStartRef = useRef<number | null>(null);
  const xirrLoadingStartRef = useRef<number | null>(null);

  // Sync state to query string
  useEffect(() => {
    setQueryParams(
      selectedSchemes.filter((x): x is number => typeof x === 'number'),
      years
    );
  }, [selectedSchemes, years]);

  // Auto-plot on initial load if funds are loaded and there are selected schemes
  useEffect(() => {
    if (!loading && !error && funds.length > 0 && selectedSchemes.filter(Boolean).length > 0 && !hasPlotted) {
      handlePlot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, funds, selectedSchemes, years]);

  // Add new fund dropdown
  const handleAddFund = () => {
    setSelectedSchemes(schemes => [...schemes, null]);
  };

  // Remove fund dropdown
  const handleRemoveFund = (idx: number) => {
    setSelectedSchemes(schemes => schemes.filter((_, i) => i !== idx));
  };

  // Handle fund selection in dropdown
  const handleFundSelect = (idx: number, schemeCode: number) => {
    setSelectedSchemes(schemes => schemes.map((s, i) => i === idx ? schemeCode : s));
  };

  // Handle years change
  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYears(Math.max(1, Math.floor(Number(e.target.value))));
    setHasPlotted(false);
    setNavDatas({});
    setLumpSumXirrDatas({});
    setSipXirrDatas({});
    setXirrError(null);
  };

  // Plot logic for all selected funds
  const handlePlot = async () => {
    setLoadingNav(true);
    navLoadingStartRef.current = Date.now();
    setLoadingXirr(false);
    setHasPlotted(false);
    setNavDatas({});
    setLumpSumXirrDatas({});
    setSipXirrDatas({});
    setXirrError(null);
    try {
      const navs: Record<number, any[]> = {};
      const filledNavs: any[][] = [];
      console.time('NAV Fetching');
      for (const scheme of selectedSchemes) {
        if (!scheme) continue;
        const nav = await loadNavData(scheme);
        if (!Array.isArray(nav) || nav.length === 0) continue;
        const filled = fillMissingNavDates(nav);
        navs[scheme] = filled;
        filledNavs.push(filled);
      }
      console.timeEnd('NAV Fetching');
      setNavDatas(navs);
      const navElapsed = Date.now() - (navLoadingStartRef.current || 0);
      const startXirrCalculation = () => {
        setLoadingXirr(true);
        xirrLoadingStartRef.current = Date.now();
        console.time('SIP XIRR Calculation');
        const worker = new Worker(new URL('./utils/xirrWorker.ts', import.meta.url), { type: 'module' });
        worker.postMessage({ navDataList: filledNavs, years });
        worker.onmessage = (event) => {
          console.timeEnd('SIP XIRR Calculation');
          setSipXirrDatas({ portfolio: event.data });
          setHasPlotted(true);
          const xirrElapsed = Date.now() - (xirrLoadingStartRef.current || 0);
          if (xirrElapsed < 1500) {
            setTimeout(() => setLoadingXirr(false), 1500 - xirrElapsed);
          } else {
            setLoadingXirr(false);
          }
          worker.terminate();
        };
        worker.onerror = (err) => {
          setXirrError('Error calculating XIRR.');
          const xirrElapsed = Date.now() - (xirrLoadingStartRef.current || 0);
          if (xirrElapsed < 1500) {
            setTimeout(() => setLoadingXirr(false), 1500 - xirrElapsed);
          } else {
            setLoadingXirr(false);
          }
          worker.terminate();
        };
      };
      if (navElapsed < 1500) {
        setTimeout(() => {
          setLoadingNav(false);
          startXirrCalculation();
        }, 1500 - navElapsed);
      } else {
        setLoadingNav(false);
        startXirrCalculation();
      }
    } catch (e) {
      setXirrError('Error loading or calculating data.');
      const navElapsed = Date.now() - (navLoadingStartRef.current || 0);
      if (navElapsed < 1500) {
        setTimeout(() => setLoadingNav(false), 1500 - navElapsed);
      } else {
        setLoadingNav(false);
      }
      const xirrElapsed = Date.now() - (xirrLoadingStartRef.current || 0);
      if (xirrElapsed < 1500) {
        setTimeout(() => setLoadingXirr(false), 1500 - xirrElapsed);
      } else {
        setLoadingXirr(false);
      }
    }
  };

  // Get fund name by scheme code
  const getFundName = (schemeCode: number) => {
    const fund = funds.find(f => f.schemeCode === schemeCode);
    return fund ? fund.schemeName : String(schemeCode);
  };

  // Prepare chart series for each metric
  const getNavSeries = () =>
    Object.entries(navDatas).map(([scheme, data], idx) => ({
      name: getFundName(Number(scheme)),
      data: [...data].sort((a, b) => a.date.getTime() - b.date.getTime()).map(row => row.nav),
      type: 'line',
      color: COLORS[idx % COLORS.length],
      marker: { enabled: false },
    }));
  const getNavCategories = () => {
    const allDates = Object.values(navDatas).flatMap(arr => Array.isArray(arr) ? arr.map(row => formatDate(row.date)) : []);
    return Array.from(new Set(allDates)).sort();
  };

  const getLumpSumSeries = () =>
    Object.entries(lumpSumXirrDatas).map(([scheme, data], idx) => ({
      name: getFundName(Number(scheme)),
      data: [...data].sort((a, b) => a.date.getTime() - b.date.getTime()).map(row => row.xirr * 100),
      type: 'line',
      color: COLORS[idx % COLORS.length],
      marker: { enabled: false },
    }));
  const getLumpSumCategories = () => {
    const allDates = Object.values(lumpSumXirrDatas).flatMap(arr => Array.isArray(arr) ? arr.map(row => formatDate(row.date)) : []);
    return Array.from(new Set(allDates)).sort();
  };

  const getSipSeries = () =>
    Object.entries(sipXirrDatas).map(([scheme, data], idx) => ({
      name: getFundName(Number(scheme)),
      data: [...data].sort((a, b) => a.date.getTime() - b.date.getTime()).map(row => row.xirr * 100),
      type: 'line',
      color: COLORS[idx % COLORS.length],
      marker: { enabled: false },
    }));
  const getSipCategories = () => {
    const allDates = Object.values(sipXirrDatas).flatMap(arr => Array.isArray(arr) ? arr.map(row => formatDate(row.date)) : []);
    return Array.from(new Set(allDates)).sort();
  };

  return (
    <Container>
      <div style={{ position: 'relative' }}>
        {(loadingNav || loadingXirr) && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 10,
              background: 'rgba(255,255,255,0.2)',
              pointerEvents: 'all',
            }}
          />
        )}
        <h2 style={{ marginBottom: '20px' }}>Mutual Funds</h2>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="years-input">Rolling Period (years): </label>
          <input
            id="years-input"
            type="number"
            min={1}
            max={30}
            value={years}
            onChange={handleYearsChange}
            style={{ width: 60, marginLeft: 8 }}
          />
          <button
            style={{ marginLeft: 16, padding: '4px 16px', fontSize: 16 }}
            onClick={handlePlot}
            disabled={loading || loadingNav || loadingXirr}
          >
            Plot
          </button>
        </div>
        {loading && <LoadingSpinner text="Loading list of mutual funds..." />}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && funds.length > 0 && (
          <>
            {selectedSchemes.map((scheme, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <MutualFundDropdown
                  funds={funds.filter(f => !selectedSchemes.includes(f.schemeCode) || f.schemeCode === scheme)}
                  onSelect={code => handleFundSelect(idx, code)}
                  value={scheme ?? undefined}
                />
                {selectedSchemes.length > 1 && (
                  <button style={{ marginLeft: 8 }} onClick={() => handleRemoveFund(idx)}>-</button>
                )}
              </div>
            ))}
            <button style={{ marginTop: 8 }} onClick={handleAddFund}>Add new fund</button>

            {/* Move spinners here, below dropdowns and above chart */}
            {loadingNav && <LoadingSpinner text="Loading NAV data..." />}
            {loadingXirr && <LoadingSpinner text="Calculating XIRR..." />}

            {xirrError && <div style={{ color: 'red', marginTop: 16 }}>{xirrError}</div>}
            {hasPlotted && Object.keys(navDatas).length > 0 && (
              <>
                <MultiFundCharts
                  navDatas={navDatas}
                  lumpSumXirrDatas={lumpSumXirrDatas}
                  sipXirrDatas={sipXirrDatas}
                  funds={funds}
                  COLORS={COLORS}
                />
              </>
            )}
          </>
        )}
      </div>
    </Container>
  );
};

export default App;