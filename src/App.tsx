import React, { useState, useEffect } from 'react';
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
  const [sipXirrDatas, setSipXirrDatas] = useState<Record<number, any[]>>({});
  const [hasPlotted, setHasPlotted] = useState(false);
  const [loadingFunds, setLoadingFunds] = useState(false);
  const [xirrError, setXirrError] = useState<string | null>(null);

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
    setLoadingFunds(true);
    setHasPlotted(false);
    setNavDatas({});
    setLumpSumXirrDatas({});
    setSipXirrDatas({});
    setXirrError(null);
    try {
      const navs: Record<number, any[]> = {};
      const filledNavs: any[][] = [];
      for (const scheme of selectedSchemes) {
        if (!scheme) continue;
        const nav = await loadNavData(scheme);
        if (!Array.isArray(nav) || nav.length === 0) continue;
        const filled = fillMissingNavDates(nav);
        navs[scheme] = filled;
        filledNavs.push(filled);
      }
      setNavDatas(navs);

      // Portfolio XIRR calculation (single series)
      const lumpSum = calculateLumpSumRollingXirr(filledNavs, years);
      setLumpSumXirrDatas({ portfolio: lumpSum });

      // Portfolio SIP XIRR calculation (single series)
      const sipPortfolio = calculateSipRollingXirr(filledNavs, years);
      setSipXirrDatas({ portfolio: sipPortfolio });
      setHasPlotted(true);
    } catch (e) {
      setXirrError('Error loading or calculating data.');
    } finally {
      setLoadingFunds(false);
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
          disabled={loading || loadingFunds}
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
        </>
      )}
      {(loadingFunds) && <LoadingSpinner text="Loading NAV data..." />}
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
    </Container>
  );
};

export default App;