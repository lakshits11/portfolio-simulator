import React, { useState, useEffect } from 'react';
import { MutualFundDropdown } from './components/MutualFundDropdown';
import { Container } from './components/Container';
import { LoadingSpinner } from './components/LoadingSpinner';
import { NavTable } from './components/NavTable';
import { useMutualFunds } from './hooks/useMutualFunds';
import { useNavData } from './hooks/useNavData';
import { calculateLumpSumRollingXirr, RollingXirrEntry } from './utils/lumpSumRollingXirr';
import { RollingXirrTable } from './components/RollingXirrTable';
import { fillMissingNavDates } from './utils/fillMissingNavDates';
import { NavEntry } from './types/navData';
import { calculateSipRollingXirr, SipRollingXirrEntry } from './utils/sipRollingXirr';
import { SipRollingXirrTable } from './components/SipRollingXirrTable';

const DEFAULT_SCHEME_CODE = 120716;

const App: React.FC = () => {
  const { funds, loading, error } = useMutualFunds();
  const { navData, loading: navLoading, error: navError, loadNavData } = useNavData();
  const [selectedScheme, setSelectedScheme] = useState<number>(DEFAULT_SCHEME_CODE);
  const [xirrError, setXirrError] = useState<string | null>(null);
  const [lumpSumRollingXirr, setLumpSumRollingXirr] = useState<RollingXirrEntry[]>([]);
  const [sipRollingXirr, setSipRollingXirr] = useState<SipRollingXirrEntry[]>([]);
  const [filledNavData, setFilledNavData] = useState<NavEntry[]>([]);
  const [years, setYears] = useState<number>(1);

  useEffect(() => {
    loadNavData(DEFAULT_SCHEME_CODE);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!navLoading && !navError && navData.length > 0) {
      try {
        const filled = fillMissingNavDates(navData);
        setFilledNavData(filled);
        const rolling = calculateLumpSumRollingXirr(filled, years);
        setLumpSumRollingXirr(rolling);
        const sipRolling = calculateSipRollingXirr(filled, years);
        setSipRollingXirr(sipRolling);
        setXirrError(null);
      } catch (err: any) {
        setXirrError(err.message || 'Error calculating rolling XIRR');
        setLumpSumRollingXirr([]);
        setSipRollingXirr([]);
      }
    } else {
      setLumpSumRollingXirr([]);
      setSipRollingXirr([]);
      setFilledNavData(navData);
    }
  }, [navData, navLoading, navError, years]);

  const handleFundSelect = (schemeCode: number) => {
    setSelectedScheme(schemeCode);
    loadNavData(schemeCode);
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
          onChange={e => setYears(Math.max(1, Math.floor(Number(e.target.value))))}
          style={{ width: 60, marginLeft: 8 }}
        />
      </div>
      {loading && <LoadingSpinner />}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && funds.length > 0 && (
        <MutualFundDropdown 
          funds={funds} 
          onSelect={handleFundSelect}
          value={selectedScheme}
        />
      )}
      {selectedScheme && navLoading && <LoadingSpinner />}
      {selectedScheme && navError && <div style={{ color: 'red' }}>{navError}</div>}
      {selectedScheme && !navLoading && !navError && navData.length > 0 && (
        <>
          <NavTable navData={filledNavData} />
          <RollingXirrTable data={lumpSumRollingXirr} />
          <SipRollingXirrTable data={sipRollingXirr} />
          {xirrError && <div style={{ color: 'red', marginTop: 16 }}>{xirrError}</div>}
        </>
      )}
    </Container>
  );
};

export default App;