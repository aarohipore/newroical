import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Helper function to convert empty string to 0 for calculations
const toNumber = (value) => value === '' ? 0 : Number(value);

function App() {
  const [section, setSection] = useState('invoices');
  const [automationPercent, setAutomationPercent] = useState(50);
  
  // State for invoices section input fields
  const [invoicesNumDocs, setInvoicesNumDocs] = useState('');
  const [invoicesTimePerDoc, setInvoicesTimePerDoc] = useState('');
  const [invoicesAnnualCost, setInvoicesAnnualCost] = useState('');
  const [invoicesErrorRate, setInvoicesErrorRate] = useState('');
  const [invoicesAvgInvoiceValue, setInvoicesAvgInvoiceValue] = useState('');
  const [invoicesAutomationCost, setInvoicesAutomationCost] = useState('');
  

  
  // Page 3 state
  const [showPage3Results, setShowPage3Results] = useState(false);
  const [hasInitialCalculation, setHasInitialCalculation] = useState(false);
  const [showNewPage, setShowNewPage] = useState(false);
  
  // New page state
  const [activeTab, setActiveTab] = useState('simple');
  const [fteCount, setFteCount] = useState(5);
  const [fteAnnualCost, setFteAnnualCost] = useState(50000);
  const [monthlyCredits, setMonthlyCredits] = useState(100000);
  const [pagesPerMonth, setPagesPerMonth] = useState(200000);
  

  

  
  // Common inputs for all advanced tabs
  const [commonMonthlyDocumentVolume, setCommonMonthlyDocumentVolume] = useState(10000);
  const [commonCurrentFTEs, setCommonCurrentFTEs] = useState(5);
  const [commonAnnualCostPerFTE, setCommonAnnualCostPerFTE] = useState(50000);
  
  // Error Handling specific inputs (removing monthlyDocumentVolume since it's now common)
  const [misinterpretationErrors, setMisinterpretationErrors] = useState(2);
  const [matchingErrors, setMatchingErrors] = useState(1.5);
  const [workflowErrors, setWorkflowErrors] = useState(1);
  const [avgCostPerError, setAvgCostPerError] = useState(80);
  const [errorReductionFactor, setErrorReductionFactor] = useState(80);
  const [quickEstimateMode, setQuickEstimateMode] = useState(false);
  const [whatIfAnalysis, setWhatIfAnalysis] = useState(false);
  const [showDetailedErrors, setShowDetailedErrors] = useState(false);
  const [showQuickEstimateInfo, setShowQuickEstimateInfo] = useState(false);
  const [showCreditsInfo, setShowCreditsInfo] = useState(false);
  const [creditsInputEnabled, setCreditsInputEnabled] = useState(false);
  const [showSmartProjectionTooltip, setShowSmartProjectionTooltip] = useState(false);
  const [smartProjectionMode, setSmartProjectionMode] = useState(false);
  const [panelsCollapsed, setPanelsCollapsed] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState({
    common: true,
    scalability: true,
    errorHandling: true
  });
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  
  // Scalability specific inputs
  const [annualGrowthRate, setAnnualGrowthRate] = useState(25);
  const [ftesNeededAfterAI, setFtesNeededAfterAI] = useState(30);
  const [peakVsNormalIncrease, setPeakVsNormalIncrease] = useState(50);
  

  
  // Customer Experience calculations
  const timeTakenPerDocBeforeAI = (commonCurrentFTEs * 60 * 160) / commonMonthlyDocumentVolume;
  const timeSavedPerDoc = timeTakenPerDocBeforeAI - 1; // 1 min assumed reduction
  const processingTimeReduction = timeSavedPerDoc > 0 ? (timeSavedPerDoc / timeTakenPerDocBeforeAI) * 100 : 0;
  
  // Scalability calculations - Updated Framework
  
  // 1. Productivity Multiplier
  const baselineDocumentsPerFTE = toNumber(commonMonthlyDocumentVolume) / toNumber(commonCurrentFTEs);
  const documentsPerFTEAfterAI = commonMonthlyDocumentVolume / (commonCurrentFTEs * (ftesNeededAfterAI / 100));
  const productivityMultiplier = documentsPerFTEAfterAI / baselineDocumentsPerFTE;
  
  // 2. FTEs Saved (Headcount) + Annual Cost Savings ($)
  const futureDocumentVolume = commonMonthlyDocumentVolume * (1 + (annualGrowthRate / 100));
  const baselineFTEsRequired = futureDocumentVolume / baselineDocumentsPerFTE;
  const ftesRequiredAfterAI = commonCurrentFTEs * (ftesNeededAfterAI / 100);
  const scalabilityFtesSaved = baselineFTEsRequired - ftesRequiredAfterAI;
  const annualCostSavings = scalabilityFtesSaved * commonAnnualCostPerFTE;
  
  // 3. Peak Handling Capacity (%)
  const peakMonthVolume = commonMonthlyDocumentVolume * (1 + (peakVsNormalIncrease / 100));
  const processingCapacityAfterAI = ftesRequiredAfterAI * documentsPerFTEAfterAI;
  const peakHandlingCapacity = (processingCapacityAfterAI / peakMonthVolume) * 100;
  
  // Advanced Section - Additional KPIs
  // Automation Cost calculation (using same framework as simple section)
  const advancedAutomationCost = (() => {
    const annualCredits = commonMonthlyDocumentVolume * 12;
    
    if (annualCredits <= 25000) {
      return annualCredits * 1.00;
    } else if (annualCredits <= 100000) {
      return annualCredits * 0.80;
    } else if (annualCredits <= 500000) {
      return annualCredits * 0.60;
    } else if (annualCredits <= 1000000) {
      return annualCredits * 0.50;
    } else if (annualCredits <= 2000000) {
      return annualCredits * 0.30;
    }
    return annualCredits * 0.30; // Default for >2M
  })();
  
  // Error Cost Savings (from error handling section)
  const advancedErrorCostSavings = (() => {
    const totalErrorRate = quickEstimateMode ? 5 : (misinterpretationErrors + matchingErrors + workflowErrors);
    const costPerError = quickEstimateMode ? 80 : avgCostPerError;
    const errorsBefore = commonMonthlyDocumentVolume * totalErrorRate / 100;
    const errorsAfter = errorsBefore * 0.1;
    const costBefore = errorsBefore * costPerError;
    const costAfter = errorsAfter * costPerError;
    const monthlySavings = costBefore - costAfter;
    return monthlySavings * 12;
  })();
  
  // FTE Cost Savings
  const fteCostSavings = scalabilityFtesSaved * commonAnnualCostPerFTE;
  
  // Annual Savings = Error Cost Savings + FTE Cost Savings - Automation Cost
  const advancedAnnualSavings = advancedErrorCostSavings + fteCostSavings - advancedAutomationCost;
  
  // ROI = (Net Savings Ã· Automation Cost) Ã— 100
  const advancedROI = (advancedAnnualSavings / advancedAutomationCost) * 100;

  // State for Page 3 calculation results
  const [hoursSaved, setHoursSaved] = useState(0);
  const [ftesSaved, setFtesSaved] = useState(0);
  const [dsoImpact, setDsoImpact] = useState(0);
  const [annualSavings, setAnnualSavings] = useState(0);
  const [claimsAutoAdjRate, setClaimsAutoAdjRate] = useState(0);
  




  // Validation: all except errorRate must be filled
  const allRequiredFilled = (invoicesNumDocs && invoicesTimePerDoc && invoicesAnnualCost && invoicesAvgInvoiceValue && invoicesAutomationCost);

  // Calculation function for Page 3
  const calculatePage3Results = useCallback(() => {
    if (section === 'invoices') {
      // Invoices calculation logic
      const pagesProcessedMonthly = parseFloat(invoicesNumDocs) || 0;
      const timeTakenPerPage = parseFloat(invoicesTimePerDoc) || 0;
      const annualFTECost = parseFloat(invoicesAnnualCost) || 0;
      const monthlyCredits = parseFloat(invoicesErrorRate) || 0;
      const currentDSO = parseFloat(invoicesAvgInvoiceValue) || 0;
      const avgInvoiceValueAmount = parseFloat(invoicesAutomationCost) || 0;
      const discount = parseFloat(automationPercent) || 0;

      // Hours Saved calculation
      const totalTimeBeforeAutomation = pagesProcessedMonthly * timeTakenPerPage * (1 + 0.05);
      const totalTimeAfterAutomation = pagesProcessedMonthly * timeTakenPerPage * (1 + 0.01);
      const timeSaved = totalTimeBeforeAutomation - totalTimeAfterAutomation;
      const hoursSavedValue = timeSaved / 60;

      // FTEs Saved calculation
      const ftesSavedValue = hoursSavedValue / 160;

      // DSO Impact calculation
      const dsoImpactValue = currentDSO - 30;

      // Automation Cost (annualized)
      const automationCostValue = monthlyCredits * (1 - (discount / 100)) * 12;

      // Error Reduction Savings (annualized)
      const errorReductionSavingsValue = avgInvoiceValueAmount * 0.04 * 12;

      // Annual Savings calculation (includes error reduction savings)
      const annualSavingsValue = (ftesSavedValue * 12 * annualFTECost) + (dsoImpactValue * avgInvoiceValueAmount) + errorReductionSavingsValue - automationCostValue;
      setAnnualSavings(annualSavingsValue);

      // Set the calculated values (multiply by 12 for annual values)
      setHoursSaved(hoursSavedValue * 12);
      setFtesSaved(ftesSavedValue * 12);
      setDsoImpact(dsoImpactValue);



    }
  }, [section, invoicesNumDocs, invoicesTimePerDoc, invoicesAnnualCost, invoicesErrorRate, invoicesAvgInvoiceValue, invoicesAutomationCost, automationPercent]);

  // Debounced effect for real-time calculations
  useEffect(() => {
    if (hasInitialCalculation) {
      const timeoutId = setTimeout(() => {
        calculatePage3Results();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [hasInitialCalculation, calculatePage3Results]);

  const handleCalculate = () => {
    // Perform initial calculation
    calculatePage3Results();
    setHasInitialCalculation(true);
    setShowPage3Results(true);
  };

  const handleLeftArrowClick = () => {
    setShowNewPage(true);
  };

  const handleNewPageBack = () => {
    setShowNewPage(false);
  };

  // Automation Cost calculation based on tiered pricing (annual ranges)
  const calculateAutomationCost = (monthlyCredits) => {
    const annualCredits = monthlyCredits * 12; // Convert to annual volume for tier determination
    
    if (annualCredits <= 25000) {
      return monthlyCredits * 1.00;
    } else if (annualCredits <= 100000) {
      return monthlyCredits * 0.80;
    } else if (annualCredits <= 500000) {
      return monthlyCredits * 0.60;
    } else if (annualCredits <= 1000000) {
      return monthlyCredits * 0.50;
    } else if (annualCredits <= 2000000) {
      return monthlyCredits * 0.30;
    } else {
      return monthlyCredits * 0.30; // Default to highest tier for credits above 2M annually
    }
  };

  // New page calculations
  const automationCost = calculateAutomationCost(toNumber(monthlyCredits));
  const annualAutomationCost = automationCost * 12;
  const newPageHoursSaved = ((toNumber(fteCount) * (60 * 160.0) / toNumber(pagesPerMonth)) - 1) * (toNumber(pagesPerMonth) / 60.0);
  const fteAfter = newPageHoursSaved / 160.0;
  const newPageAnnualSavings = ((toNumber(fteCount) - fteAfter) * 12 * toNumber(fteAnnualCost)) - annualAutomationCost;
  
  // Advanced calculations
  const totalErrorRate = misinterpretationErrors + matchingErrors + workflowErrors;
  const totalErrorsBefore = commonMonthlyDocumentVolume * (totalErrorRate / 100);
  const totalErrorsAfter = totalErrorsBefore * (1 - errorReductionFactor / 100);
  const costOfErrorsBefore = totalErrorsBefore * avgCostPerError;
  const costOfErrorsAfter = totalErrorsAfter * avgCostPerError;
  const annualErrorSavings = (costOfErrorsBefore - costOfErrorsAfter) * 12;
  const accuracyBefore = (1 - (totalErrorsBefore / commonMonthlyDocumentVolume)) * 100;
  const accuracyAfter = (1 - (totalErrorsAfter / commonMonthlyDocumentVolume)) * 100;
  
  // Quick estimate calculations
  const quickErrorRate = 5; // 5% default
  const quickTotalErrorsBefore = commonMonthlyDocumentVolume * (quickErrorRate / 100);
  const quickTotalErrorsAfter = quickTotalErrorsBefore * (1 - 0.8); // 80% reduction
  const quickCostOfErrorsBefore = quickTotalErrorsBefore * 80; // $80 default
  const quickCostOfErrorsAfter = quickTotalErrorsAfter * 80;
  const quickAnnualErrorSavings = (quickCostOfErrorsBefore - quickCostOfErrorsAfter) * 12;

  const handleExportPDF = () => {
    // PDF export functionality would go here
    alert('PDF export functionality would be implemented here');
  };

  const handleReset = () => {
    setFteCount(5);
    setFteAnnualCost(50000);
    setMonthlyCredits(10000);
    setPagesPerMonth(10000);
    setCreditsInputEnabled(false); // Reset to auto-fill mode
  };

  const handleSmartProjection = () => {
    setSmartProjectionMode(!smartProjectionMode);
    
    if (!smartProjectionMode) {
      // Autofill values when activating Smart Projection
      setAnnualGrowthRate(25);
      setPeakVsNormalIncrease(20);
      setMisinterpretationErrors(3);
      setMatchingErrors(1.5);
      setWorkflowErrors(0.5);
      setAvgCostPerError(7);
    }
  };

  const handleRevealImpact = () => {
    setPanelsCollapsed(!panelsCollapsed);
    
    if (!panelsCollapsed) {
      // Collapse all panels
      setExpandedPanels({
        common: false,
        scalability: false,
        errorHandling: false
      });
    } else {
      // Expand all panels
      setExpandedPanels({
        common: true,
        scalability: true,
        errorHandling: true
      });
    }
  };

  const togglePanel = (panelName) => {
    setExpandedPanels(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
  };

  const handleDetailedAnalysis = () => {
    setShowDetailedAnalysis(!showDetailedAnalysis);
  };

  // Always display the new ROI calculator directly
  return (
    <div className="new-page">
        <div className="new-page-content">
          <div className="tabs-container">
            <div className="tab-switcher">
              <button 
                className={`tab-button ${activeTab === 'simple' ? 'active' : ''}`}
                onClick={() => setActiveTab('simple')}
              >
                Simple
              </button>
              <button 
                className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
                onClick={() => setActiveTab('advanced')}
              >
                Advanced
              </button>
            </div>
          </div>
          

          
          <div className="main-container">
            {activeTab === 'simple' && (
              <>
                <div className="input-panel">
                  <h3>Calculate Your ROI</h3>
                  <div className="input-group">
                    <label htmlFor="fteCount">No. of FTEs required for the task</label>
                    <input
                      id="fteCount"
                      type="number"
                      value={fteCount}
                      onChange={(e) => setFteCount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 5"
                    />
                    <div className="tooltip">Number of full-time employees currently working on this task</div>
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="fteAnnualCost">Annual FTE cost ($)</label>
                    <input
                      id="fteAnnualCost"
                      type="number"
                      value={fteAnnualCost}
                      onChange={(e) => setFteAnnualCost(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 50000"
                    />
                    <div className="tooltip">Annual cost per full-time employee</div>
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="monthlyCredits">Monthly credits required</label>
                    <div className="input-with-inner-info">
                      <input
                        id="monthlyCredits"
                        type="number"
                        value={monthlyCredits}
                        onChange={(e) => creditsInputEnabled && setMonthlyCredits(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 100000"
                        disabled={!creditsInputEnabled}
                        style={{ paddingRight: '35px' }}
                      />
                      <button 
                        className="inner-info-button"
                        onMouseEnter={() => setShowCreditsInfo(true)}
                        onMouseLeave={() => setShowCreditsInfo(false)}
                        onClick={() => {
                          if (creditsInputEnabled) {
                            // If currently enabled, disable it and return to auto-fill
                            setCreditsInputEnabled(false);
                            setMonthlyCredits(pagesPerMonth); // Reset to auto-fill value
                          } else {
                            // If currently disabled, enable it for custom input
                            setCreditsInputEnabled(true);
                            setTimeout(() => document.getElementById('monthlyCredits').focus(), 0);
                          }
                        }}
                        type="button"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {showCreditsInfo && (
                        <div className="inner-info-tooltip">
                          {creditsInputEnabled ? (
                            <>Click to return to auto-fill mode<br/>based on pages processed</>
                          ) : (
                            <>Enter custom credits from credit calculator<br/>and click this i button to unlock input</>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="tooltip">Monthly automation credits needed</div>
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="pagesPerMonth">No. of pages processed monthly</label>
                    <input
                      id="pagesPerMonth"
                      type="number"
                      value={pagesPerMonth}
                      onChange={(e) => {
                        const pageValue = e.target.value === '' ? '' : Number(e.target.value);
                        setPagesPerMonth(pageValue);
                        if (!creditsInputEnabled) {
                          setMonthlyCredits(pageValue); // Auto-fill credits: 1 page = 1 credit only when disabled
                        }
                      }}
                      placeholder="e.g. 20000"
                    />
                    <div className="tooltip">Total pages processed per month</div>
                  </div>
                </div>
                
                <div className="output-panel">
                  <div className="kpi-row">
                    <div className="kpi-card">
                      <h4>Annual Automation Cost</h4>
                      <div className="kpi-value">${(automationCost * 12).toLocaleString()}</div>
                      <div className="kpi-subtitle">Per Year</div>
                    </div>
                    <div className="kpi-card">
                      <h4>Annual Savings</h4>
                      <div className="kpi-value">${newPageAnnualSavings.toLocaleString()}</div>
                      <div className="kpi-subtitle">Total savings</div>
                    </div>
                  </div>
                  
                  <div className="chart-card">
                    <h4>Summary</h4>
                    <div className="chart-with-stats-container">
                      <div className="charts-row">
                        <div className="bar-chart-container">
                          <svg width="280" height="200" viewBox="0 0 280 200">
                            {/* Chart background */}
                            <rect x="0" y="0" width="280" height="200" fill="none"/>
                            
                            {/* Y-axis */}
                            <line x1="40" y1="20" x2="40" y2="180" stroke="#4F8CFF" strokeWidth="2"/>
                            <text x="20" y="100" textAnchor="middle" fill="#FFFFFF" fontSize="10" transform="rotate(-90 20 100)">FTE Count</text>
                            
                            {/* X-axis */}
                            <line x1="40" y1="180" x2="240" y2="180" stroke="#4F8CFF" strokeWidth="2"/>
                            
                            {/* Before Automation bar */}
                            <rect x="70" y={180 - (fteCount * 20)} width="45" height={fteCount * 20} fill="#4F8CFF" rx="4"/>
                            <text x="92" y="195" textAnchor="middle" fill="#FFFFFF" fontSize="11">Before</text>
                            <text x="92" y={175 - (fteCount * 20)} textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">{fteCount}</text>
                            
                            {/* After Automation bar */}
                            <rect x="140" y={180 - (fteAfter * 20)} width="45" height={fteAfter * 20} fill="#FFFFFF" rx="4"/>
                            <text x="162" y="195" textAnchor="middle" fill="#FFFFFF" fontSize="11">After</text>
                            <text x="162" y={175 - (fteAfter * 20)} textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">{fteAfter.toFixed(1)}</text>
                          </svg>
                        </div>
                        
                        <div className="radial-chart">
                          {(() => {
                            const annualAutomationCost = automationCost * 12;
                            const total = Math.abs(newPageAnnualSavings) + annualAutomationCost;
                            const savingsPercentage = (Math.abs(newPageAnnualSavings) / total) * 100;
                            
                            return (
                              <div className="radial-chart-container">
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                  {/* Background circle */}
                                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e6f3ff" strokeWidth="8"/>
                                  {/* Progress circle */}
                                  <circle 
                                    cx="60" 
                                    cy="60" 
                                    r="50" 
                                    fill="none" 
                                    stroke="#4F8CFF" 
                                    strokeWidth="8"
                                    strokeDasharray={`${(savingsPercentage / 100) * 314} 314`}
                                    strokeDashoffset="78.5"
                                    transform="rotate(-90 60 60)"
                                    className="radial-progress"
                                  />
                                  {/* Center text */}
                                  <text x="60" y="65" textAnchor="middle" className="chart-percentage">
                                    {savingsPercentage.toFixed(0)}%
                                  </text>
                                </svg>
                                {/* Legend below chart */}
                                <div className="radial-legend">
                                  <div className="legend-item">
                                    <span className="legend-color" style={{backgroundColor: '#4F8CFF'}}></span>
                                    <span>Savings</span>
                                  </div>
                                  <div className="legend-item">
                                    <span className="legend-color" style={{backgroundColor: '#e6f3ff'}}></span>
                                    <span>Cost</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      
                      <div className="inline-hours-saved">
                        <div className="inline-kpi-card">
                          <h4>FTEs Saved</h4>
                          <div className="kpi-value">{(fteCount - fteAfter).toFixed(1)}</div>
                          <div className="kpi-subtitle">FTEs</div>
                        </div>
                        <div className="inline-kpi-card">
                          <h4>Hours Saved</h4>
                          <div className="kpi-value">{newPageHoursSaved.toFixed(0)} hrs</div>
                          <div className="kpi-subtitle">Monthly</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="actions-row">
                    <button className="action-button" onClick={handleExportPDF}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15V3M12 15L8 11M12 15L16 11M22 15V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Export PDF
                    </button>
                    <button className="action-button secondary" onClick={handleReset}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Reset
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'advanced' && (
              <div className="main-container advanced-mode">
                {/* Input Panels Row - Common and Tab-specific side by side */}
                <div className="advanced-inputs-row">
                  {/* Common Inputs Panel - Left side */}
                  <div className="common-inputs-panel">
                    <h3 
                      className={`panel-heading ${expandedPanels.common ? 'expanded' : 'collapsed'}`}
                      onClick={() => togglePanel('common')}
                    >
                      Common Inputs
                    </h3>
                    {expandedPanels.common && (
                      <div className="panel-content">
                        <div className="input-group">
                          <label htmlFor="commonMonthlyDocumentVolume">Monthly Document Volume</label>
                          <input
                            id="commonMonthlyDocumentVolume"
                            type="number"
                            value={commonMonthlyDocumentVolume}
                            onChange={(e) => setCommonMonthlyDocumentVolume(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="e.g. 10000"

                          />
                          <div className="tooltip">Total documents processed per month</div>
                        </div>
                        
                        <div className="input-group">
                          <label htmlFor="commonCurrentFTEs">Current Number of FTEs Handling the Process</label>
                          <input
                            id="commonCurrentFTEs"
                            type="number"
                            value={commonCurrentFTEs}
                            onChange={(e) => setCommonCurrentFTEs(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="e.g. 5"

                          />
                          <div className="tooltip">Number of full-time employees currently working on this process</div>
                        </div>
                        
                        <div className="input-group">
                          <label htmlFor="commonAnnualCostPerFTE">Annual Cost per FTE ($)</label>
                          <input
                            id="commonAnnualCostPerFTE"
                            type="number"
                            value={commonAnnualCostPerFTE}
                            onChange={(e) => setCommonAnnualCostPerFTE(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="e.g. 50000"

                          />
                          <div className="tooltip">Annual cost per full-time employee</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Scalability Input Panel */}
                    <div className="tab-input-panel">
                      <h3 
                        className={`panel-heading ${expandedPanels.scalability ? 'expanded' : 'collapsed'}`}
                        onClick={() => togglePanel('scalability')}
                      >
                        Scalability Inputs
                      </h3>
                      {expandedPanels.scalability && (
                        <div className="panel-content">
                          <div className="input-group">
                            <label htmlFor="annualGrowthRate">Annual Growth in Document Volume (%)</label>
                            <input
                              id="annualGrowthRate"
                              type="number"
                              value={annualGrowthRate}
                              onChange={(e) => setAnnualGrowthRate(e.target.value === '' ? '' : Number(e.target.value))}
                              disabled={smartProjectionMode}
                              placeholder="e.g. 25"
  
                              max="100"
                            />
                            <div className="tooltip">Projected Monthly Volume (Next Year)</div>
                          </div>
                          
                          <div className="input-group">
                            <label htmlFor="ftesNeededAfterAI">FTEs Required After AI (%)</label>
                            <input
                              id="ftesNeededAfterAI"
                              type="number"
                              value={ftesNeededAfterAI}
                              onChange={(e) => setFtesNeededAfterAI(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="e.g. 30"
  
                              max="100"
                            />
                            <div className="tooltip">Percentage of current employees still needed after AI implementation</div>
                          </div>
                          
                          <div className="input-group">
                            <label htmlFor="peakVsNormalIncrease">Seasonal Document Volume Spike (%)</label>
                            <input
                              id="peakVsNormalIncrease"
                              type="number"
                              value={peakVsNormalIncrease}
                              onChange={(e) => setPeakVsNormalIncrease(e.target.value === '' ? '' : Number(e.target.value))}
                              disabled={smartProjectionMode}
                              placeholder="e.g. 50"
  
                              max="200"
                            />
                            <div className="tooltip">Increase in volume during peak months compared to normal months</div>
                          </div>
                        </div>
                      )}
                    </div>
                  
                  {/* Error Handling Input Panel */}
                    <div className="tab-input-panel">
                      <h3 
                        className={`panel-heading ${expandedPanels.errorHandling ? 'expanded' : 'collapsed'}`}
                        onClick={() => togglePanel('errorHandling')}
                      >
                        Error Handling Inputs
                      </h3>
                      
                      {expandedPanels.errorHandling && (
                        <div className="panel-content">
                          {!quickEstimateMode && (
                        <>
                          <div className="input-group">
                            <label htmlFor="totalErrorRate">Total Error Rate (%)</label>
                            <div className="slider-with-toggle">
                              <input
                                id="totalErrorRate"
                                type="range"
                                min="0"
                                max="20"
                                step="0.1"
                                value={misinterpretationErrors + matchingErrors + workflowErrors}
                                onChange={(e) => {
                                  const totalRate = Number(e.target.value);
                                  const avgRate = totalRate / 3;
                                  setMisinterpretationErrors(avgRate);
                                  setMatchingErrors(avgRate);
                                  setWorkflowErrors(avgRate);
                                }}
                                disabled={smartProjectionMode}
                              />
                              <button 
                                className="info-toggle"
                                onClick={() => setShowDetailedErrors(!showDetailedErrors)}
                                type="button"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                            <span>{(misinterpretationErrors + matchingErrors + workflowErrors).toFixed(1)}%</span>
                            <div className="tooltip">Total percentage of errors across all types</div>
                            
                            {showDetailedErrors && (
                              <div className="detailed-errors">
                                <div className="error-slider-group">
                                  <label>Misinterpretation Errors (%)</label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={misinterpretationErrors}
                                    onChange={(e) => setMisinterpretationErrors(e.target.value === '' ? 0 : Number(e.target.value))}
                                    disabled={smartProjectionMode}
                                  />
                                  <span>{misinterpretationErrors.toFixed(1)}%</span>
                                </div>
                                <div className="error-slider-group">
                                  <label>Matching Errors (%)</label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={matchingErrors}
                                    onChange={(e) => setMatchingErrors(e.target.value === '' ? 0 : Number(e.target.value))}
                                    disabled={smartProjectionMode}
                                  />
                                  <span>{matchingErrors.toFixed(1)}%</span>
                                </div>
                                <div className="error-slider-group">
                                  <label>Workflow Errors (%)</label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={workflowErrors}
                                    onChange={(e) => setWorkflowErrors(e.target.value === '' ? 0 : Number(e.target.value))}
                                    disabled={smartProjectionMode}
                                  />
                                  <span>{workflowErrors.toFixed(1)}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="input-group">
                            <label htmlFor="avgCostPerError">Average Cost per Error ($)</label>
                            <input
                              id="avgCostPerError"
                              type="number"
                              value={avgCostPerError}
                              onChange={(e) => setAvgCostPerError(e.target.value === '' ? '' : Number(e.target.value))}
                              disabled={smartProjectionMode}
                              placeholder="e.g. 80"
  
                            />
                            <div className="tooltip">Average cost to fix each error</div>
                          </div>
                        </>
                      )}
                          
                          {/* Smart Projection Button */}
                      <div className="smart-projection-section">
                        <button 
                          className={`smart-projection-btn ${smartProjectionMode ? 'active' : ''}`} 
                          type="button"
                          onClick={handleSmartProjection}
                          onMouseEnter={() => setShowSmartProjectionTooltip(true)}
                          onMouseLeave={() => setShowSmartProjectionTooltip(false)}
                        >
                          {smartProjectionMode ? 'Exit Smart Projection' : 'Smart Projection'}
                        </button>
                        {showSmartProjectionTooltip && (
                          <div className="smart-projection-tooltip">
                            Calculate ROI using Industry Benchmarks
                          </div>
                        )}
                      </div>
                      
                      {/* Reveal Impact Button */}
                      <div className="reveal-impact-section">
                        <button 
                          className="reveal-impact-btn" 
                          type="button"
                          onClick={handleRevealImpact}
                        >
                          {panelsCollapsed ? 'Show Details' : 'Reveal Impact'}
                        </button>
                      </div>
                        </div>
                      )}

                    </div>
                </div>
                
                {/* Output Cards - Always visible main KPIs */}
                <div className="main-kpis-row">
                  <div className="output-card">
                    <h4>Annual Savings</h4>
                    <div className="output-value">${advancedAnnualSavings.toLocaleString()}</div>
                    <div className="output-subtitle">Total net savings</div>
                  </div>
                  <div className="output-card">
                    <h4>Automation Cost</h4>
                    <div className="output-value">${advancedAutomationCost.toLocaleString()}</div>
                    <div className="output-subtitle">Annual AI platform cost</div>
                  </div>
                  <div className="output-card">
                    <h4>ROI</h4>
                    <div className="output-value">{advancedROI.toFixed(0)}%</div>
                    <div className="output-subtitle">Return on investment</div>
                  </div>
                </div>

                {/* Additional KPIs Content - Conditionally visible */}
                {showDetailedAnalysis && (
                  <div className="detailed-analysis-content">
                    {/* Additional KPI Cards - Only 3 specific cards */}
                    <div className="advanced-outputs-row" style={{gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr'}}>
                      {/* Error Cost Savings */}
                      <div className="output-card">
                        <h4>Error Cost Savings</h4>
                        <div className="output-value">${(() => {
                          const totalErrorRate = smartProjectionMode ? 5 : (misinterpretationErrors + matchingErrors + workflowErrors);
                          const costPerError = smartProjectionMode ? 3 : avgCostPerError;
                          const errorsBefore = commonMonthlyDocumentVolume * totalErrorRate / 100;
                          const errorsAfter = errorsBefore * 0.1;
                          const costBefore = errorsBefore * costPerError;
                          const costAfter = errorsAfter * costPerError;
                          const monthlySavings = costBefore - costAfter;
                          return Math.round(monthlySavings * 12).toLocaleString();
                        })()}</div>
                        <div className="output-subtitle">Annual</div>
                      </div>
                      
                      {/* Productivity Index */}
                      <div className="output-card">
                        <h4>Productivity Index</h4>
                        <div className="output-value">{productivityMultiplier.toFixed(1)}x</div>
                        <div className="output-subtitle">Docs per FTE improvement</div>
                      </div>

                      {/* FTEs Saved */}
                      <div className="output-card">
                        <h4>FTEs Saved</h4>
                        <div className="output-value">{scalabilityFtesSaved.toFixed(1)}</div>
                        <div className="output-subtitle">Headcount reduction</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* EFFICIENCY GAINS Section - Always visible */}
                <div className="efficiency-gains-section">
                  <div className="efficiency-gains-grid">
                    <div className="efficiency-card">
                      <div className="radial-chart">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="50" fill="none" stroke="#e6f3ff" strokeWidth="8"/>
                          <circle 
                            cx="60" 
                            cy="60" 
                            r="50" 
                            fill="none" 
                            stroke="#4F8CFF" 
                            strokeWidth="8"
                            strokeDasharray={`${(processingTimeReduction / 100) * 314} 314`}
                            strokeDashoffset="78.5"
                            transform="rotate(-90 60 60)"
                            className="radial-progress"
                          />
                          <text x="60" y="65" textAnchor="middle" className="chart-percentage">
                            {processingTimeReduction.toFixed(0)}%
                          </text>
                        </svg>
                      </div>
                      <h3>Processing Time Reduction</h3>
                    </div>
                    
                    <div className="efficiency-card">
                      <div className="radial-chart">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="50" fill="none" stroke="#e6f3ff" strokeWidth="8"/>
                          <circle 
                            cx="60" 
                            cy="60" 
                            r="50" 
                            fill="none" 
                            stroke="#4F8CFF" 
                            strokeWidth="8"
                            strokeDasharray={`${(peakHandlingCapacity / 100) * 314} 314`}
                            strokeDashoffset="78.5"
                            transform="rotate(-90 60 60)"
                            className="radial-progress"
                          />
                          <text x="60" y="65" textAnchor="middle" className="chart-percentage">
                            {peakHandlingCapacity.toFixed(1)}%
                          </text>
                        </svg>
                      </div>
                      <h3>Peak Handling Capacity</h3>
                    </div>
                    
                    <div className="efficiency-card">
                      <div className="stopwatch-icon">
                        <div className="stopwatch-outer">
                          <div className="stopwatch-inner">
                            <div className="time-value">{timeSavedPerDoc.toFixed(1)} min</div>
                          </div>
                        </div>
                      </div>
                      <h3>Time Saved per Document</h3>
                    </div>
                  </div>
                </div>

                {/* Additional KPIs Button */}
                <div className="detailed-analysis-section">
                  <button 
                    className="detailed-analysis-btn" 
                    type="button"
                    onClick={handleDetailedAnalysis}
                  >
                    {showDetailedAnalysis ? 'Hide Additional KPIs' : 'Show Additional KPIs'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

export default App;
