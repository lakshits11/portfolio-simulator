export interface Portfolio {
  selectedSchemes: (number | null)[];
  allocations: number[];
  rebalancingEnabled: boolean;
  rebalancingThreshold: number;
} 