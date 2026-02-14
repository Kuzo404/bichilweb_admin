"use client";

import { useState, useCallback } from "react";

interface LoanCalculatorProps {
  maxAmount?: number;
  maxTerm?: number;
  minRate?: number;
  maxRate?: number;
  downPaymentPercent?: number;
  compact?: boolean;
  // Button & disclaimer styling
  calcBtnColor?: string;
  calcBtnFontSize?: string;
  calcBtnText?: string;
  requestBtnColor?: string;
  requestBtnFontSize?: string;
  requestBtnText?: string;
  requestBtnUrl?: string;
  disclaimerColor?: string;
  disclaimerFontSize?: string;
  disclaimerText?: string;
}

export default function LoanCalculator({
  maxAmount = 100000000,
  maxTerm = 60,
  minRate = 0.5,
  maxRate = 5.0,
  downPaymentPercent = 0,
  compact = false,
  calcBtnColor = "#0d9488",
  calcBtnFontSize = "14px",
  calcBtnText = "Тооцоолох",
  requestBtnColor = "#2563eb",
  requestBtnFontSize = "14px",
  requestBtnText = "Хүсэлт илгээх",
  requestBtnUrl = "",
  disclaimerColor = "#92400e",
  disclaimerFontSize = "10px",
  disclaimerText = "Энэхүү тооцоолуур нь зөвхөн мэдээллийн зорилготой бөгөөд бодит зээлийн нөхцөл өөр байж болно.",
}: LoanCalculatorProps) {
  const [loanAmount, setLoanAmount] = useState<string>(String(Math.round(maxAmount / 2)));
  const [loanTerm, setLoanTerm] = useState<string>(String(Math.min(12, maxTerm)));
  const [showResults, setShowResults] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);

  // Auto-calculate interest rate based on loan amount & term
  const getAutoRate = useCallback(
    (amount: number, term: number) => {
      if (minRate === maxRate) return minRate;
      const amountRatio = maxAmount > 0 ? amount / maxAmount : 0;
      const termRatio = maxTerm > 0 ? term / maxTerm : 0;
      const factor = Math.max(0, Math.min(1, (1 - amountRatio + termRatio) / 2));
      const rate = minRate + (maxRate - minRate) * factor;
      return Math.round(rate * 100) / 100;
    },
    [minRate, maxRate, maxAmount, maxTerm]
  );

  const currentRate = getAutoRate(parseFloat(loanAmount) || 0, parseInt(loanTerm) || 0);

  const stepAmount = maxAmount >= 10000000 ? 1000000 : maxAmount >= 1000000 ? 100000 : 10000;

  const calculateLoan = () => {
    const requestedAmount = parseFloat(loanAmount);
    const monthlyRate = currentRate / 100;
    const months = parseInt(loanTerm);

    if (isNaN(requestedAmount) || isNaN(months) || requestedAmount <= 0 || months <= 0) return;

    const dp = downPaymentPercent > 0 ? downPaymentPercent / 100 : 0;
    const principal = requestedAmount * (1 - dp);
    const interest = principal * monthlyRate * months;
    const total = principal + interest;
    const monthly = total / months;

    setMonthlyPayment(monthly);
    setTotalPayment(total);
    setTotalInterest(interest);
    setShowResults(true);
  };

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("mn-MN").format(Math.round(num));

  const formatAmount = (amount: number) =>
    amount >= 1000000 ? `₮${amount / 1000000}M` : `₮${formatNumber(amount)}`;

  return (
    <div className={`bg-white border border-teal-100 rounded-2xl shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className={`font-bold text-slate-900 ${compact ? 'text-sm' : 'text-base'}`}>
          Зээлийн тооцоолуур
        </h3>
      </div>

      <div className="space-y-4">
        {/* Loan Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Зээлийн дүн</label>
          <div className="relative">
            <input
              type="text"
              value={formatNumber(parseFloat(loanAmount) || 0)}
              onChange={(e) => {
                setLoanAmount(e.target.value.replace(/[^0-9]/g, ""));
                setShowResults(false);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">₮</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxAmount}
            step={stepAmount}
            value={loanAmount}
            onChange={(e) => { setLoanAmount(e.target.value); setShowResults(false); }}
            className="mt-2 w-full accent-teal-600 h-1.5"
          />
          <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
            <span>₮0</span>
            <span>{formatAmount(maxAmount)}</span>
          </div>
        </div>

        {/* Down Payment */}
        {downPaymentPercent > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Урьдчилгаа төлбөр</label>
            <div className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900">
              {downPaymentPercent}%
              <span className="text-xs font-normal text-slate-500 ml-2">
                (₮{formatNumber((parseFloat(loanAmount) || 0) * (downPaymentPercent / 100))})
              </span>
            </div>
          </div>
        )}

        {/* Interest Rate — auto-calculated, read-only */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Сарын хүү (%)</label>
          <div className="relative">
            <div className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900">
              {currentRate.toFixed(2)}
            </div>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">%</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            Зээлийн хэмжээ, хугацаанаас хамааран автоматаар тооцоолно ({minRate}% – {maxRate}%)
          </p>
        </div>

        {/* Loan Term */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Хугацаа (сар)</label>
          <div className="relative">
            <input
              type="text"
              value={loanTerm}
              onChange={(e) => {
                setLoanTerm(e.target.value.replace(/[^0-9]/g, ""));
                setShowResults(false);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">сар</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxTerm}
            step="1"
            value={loanTerm}
            onChange={(e) => { setLoanTerm(e.target.value); setShowResults(false); }}
            className="mt-2 w-full accent-teal-600 h-1.5"
          />
          <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
            <span>0 сар</span>
            <span>{maxTerm} сар</span>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateLoan}
          style={{ backgroundColor: calcBtnColor, fontSize: calcBtnFontSize }}
          className="w-full rounded-lg px-4 py-2.5 font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors"
        >
          {calcBtnText}
        </button>

        {/* Request Button */}
        {requestBtnUrl ? (
          <a
            href={requestBtnUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: requestBtnColor, fontSize: requestBtnFontSize }}
            className="block w-full rounded-lg px-4 py-2.5 font-medium text-white text-center hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors"
          >
            {requestBtnText}
          </a>
        ) : (
          <button
            style={{ backgroundColor: requestBtnColor, fontSize: requestBtnFontSize }}
            className="w-full rounded-lg px-4 py-2.5 font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors"
          >
            {requestBtnText}
          </button>
        )}

        {/* Results */}
        {showResults && monthlyPayment !== null && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-700">Үр дүн</h4>

            <div className="relative rounded-lg overflow-hidden border border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100 p-3">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 w-1.5 h-full bg-gradient-to-b from-transparent via-teal-400 to-transparent animate-scan-line shadow-[0_0_15px_rgba(45,212,191,0.8)]" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-medium text-teal-700 mb-0.5">Сарын төлбөр</p>
                <div className="text-lg font-bold text-teal-900">₮{formatNumber(monthlyPayment)}</div>
                <p className="text-[10px] text-teal-700">/ сар</p>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-3">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 w-1.5 h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-scan-line shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-medium text-blue-700 mb-0.5">Нийт төлөх дүн</p>
                <div className="text-base font-bold text-blue-900">₮{formatNumber(totalPayment!)}</div>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-3">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 w-1.5 h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-scan-line shadow-[0_0_15px_rgba(192,132,252,0.8)]" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-medium text-purple-700 mb-0.5">Нийт хүү</p>
                <div className="text-base font-bold text-purple-900">₮{formatNumber(totalInterest!)}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Зээлийн дүн</span>
                <span className="font-medium text-slate-900">₮{formatNumber(parseFloat(loanAmount))}</span>
              </div>
              {downPaymentPercent > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Урьдчилгаа төлбөр</span>
                  <span className="font-medium text-slate-900">
                    {downPaymentPercent}% (₮{formatNumber((parseFloat(loanAmount) || 0) * (downPaymentPercent / 100))})
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Үндсэн зээл</span>
                <span className="font-medium text-slate-900">
                  ₮{formatNumber((parseFloat(loanAmount) || 0) * (1 - (downPaymentPercent > 0 ? downPaymentPercent / 100 : 0)))}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Хугацаа</span>
                <span className="font-medium text-slate-900">{loanTerm} сар</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Сарын хүү</span>
                <span className="font-medium text-slate-900">{currentRate.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div
          className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5"
          style={{ color: disclaimerColor, fontSize: disclaimerFontSize }}
        >
          <p className="font-medium mb-0.5">Анхааруулга</p>
          <p>{disclaimerText}</p>
        </div>
      </div>
    </div>
  );
}
