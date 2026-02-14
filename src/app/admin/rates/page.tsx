'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { PageHeader } from '@/components/FormElements';
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const API_BASE = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://127.0.0.1:8000';

const DEFAULT_CONFIG = {
  currencies: 'USD|EUR|CNY|JPY|RUB|KRW|GBP',
  source: 'monxansh',
  api_url: 'https://monxansh.appspot.com/xansh.json',
  cache_ttl_seconds: 300,
  rates: [] as { symbol: string; rate: number; name: string }[],
};

export default function RatesPage() {
  const [jsonText, setJsonText] = useState('');
  const [configId, setConfigId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [liveRates, setLiveRates] = useState<{ symbol: string; rate: number; name: string; date: string }[]>([]);

  // Fetch config from Django
  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/exchange-rate-config/`);
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.results || [data];
        if (items.length > 0) {
          const item = items[0];
          setConfigId(item.id);
          const parsed = typeof item.config_json === 'string' ? JSON.parse(item.config_json) : item.config_json;
          setJsonText(JSON.stringify(parsed, null, 2));
        } else {
          setJsonText(JSON.stringify(DEFAULT_CONFIG, null, 2));
        }
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
      setJsonText(JSON.stringify(DEFAULT_CONFIG, null, 2));
    }
    setIsLoading(false);
  }, []);

  // Fetch live rates from Mongolbank
  const fetchLiveRates = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Parse current config to get currencies
      let config;
      try { config = JSON.parse(jsonText); } catch { config = DEFAULT_CONFIG; }
      const currencies = config.currencies || DEFAULT_CONFIG.currencies;
      const apiUrl = config.api_url || DEFAULT_CONFIG.api_url;

      const res = await fetch(`${apiUrl}?currency=${currencies}`);
      if (res.ok) {
        const data = await res.json();
        const rates = data.map((item: { code: string; rate_float: number; name: string; rate_date: string }) => ({
          symbol: `${item.code}/MNT`,
          rate: item.rate_float,
          name: item.name,
          date: item.rate_date,
        }));
        setLiveRates(rates);
      }
    } catch (err) {
      console.error('Failed to fetch live rates:', err);
    }
    setIsSyncing(false);
  }, [jsonText]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (!isLoading && jsonText) {
      fetchLiveRates();
    }
  }, [isLoading]); // eslint-disable-line

  // Validate JSON on change
  useEffect(() => {
    if (!jsonText.trim()) { setJsonError(null); return; }
    try {
      JSON.parse(jsonText);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  }, [jsonText]);

  // Save config to Django
  const handleSave = async () => {
    if (jsonError) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const parsed = JSON.parse(jsonText);
      const body = { config_json: JSON.stringify(parsed) };

      const url = configId
        ? `${API_BASE}/api/v1/exchange-rate-config/${configId}/`
        : `${API_BASE}/api/v1/exchange-rate-config/`;
      const method = configId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setConfigId(data.id);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
    setIsSaving(false);
  };

  // Format JSON
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch { /* ignore */ }
  };

  const formatRate = (rate: number) => {
    return rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <AdminLayout title="Валютын ханш">
      {saveStatus === 'success' && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
          <div>
            <h4 className="text-sm font-semibold text-emerald-900">Амжилттай хадгалагдлаа!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">Тохиргоо серверт хадгалагдсан.</p>
          </div>
        </div>
      )}

      <PageHeader
        title="Валютын ханш тохиргоо"
        description="Монголбанкны бодит ханшийг JSON тохиргоогоор удирдах"
        action={
          <div className="flex gap-3">
            <button
              onClick={fetchLiveRates}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Шинэчилж байна...' : 'Бодит ханш харах'}
            </button>
            <button
              onClick={handleFormat}
              disabled={!!jsonError}
              className="px-4 py-2 text-sm rounded-lg font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Формат засах
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !!jsonError}
              className={`px-5 py-2 text-sm rounded-lg font-semibold text-white transition-colors ${
                isSaving || jsonError
                  ? 'bg-emerald-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* JSON Editor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">JSON тохиргоо</h3>
            {jsonError && (
              <div className="flex items-center gap-1.5 text-red-600">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span className="text-xs font-medium">JSON алдаатай</span>
              </div>
            )}
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="animate-pulse">Ачааллаж байна...</div>
              </div>
            ) : (
              <>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className={`w-full h-[500px] font-mono text-sm p-4 rounded-lg border resize-none focus:outline-none focus:ring-2 transition-colors ${
                    jsonError
                      ? 'border-red-300 bg-red-50/50 focus:ring-red-300 text-red-900'
                      : 'border-gray-200 bg-gray-50 focus:ring-emerald-300 text-gray-800'
                  }`}
                  spellCheck={false}
                  placeholder='{ "currencies": "USD|EUR|CNY|JPY|RUB|KRW|GBP" }'
                />
                {jsonError && (
                  <p className="mt-2 text-xs text-red-600 font-mono bg-red-50 p-2 rounded">
                    {jsonError}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Help */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              <strong>currencies</strong> — Монголбанкаас авах валютуудын код (| тэмдэгээр тусгаарлана).{' '}
              <strong>cache_ttl_seconds</strong> — Кэш хадгалах хугацаа (секунд).{' '}
              <strong>rates</strong> — Гараар оруулах нэмэлт ханш (хоосон бол Монголбанкаас автоматаар авна).
            </p>
          </div>
        </div>

        {/* Live Rates Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Бодит ханш (Монголбанк)</h3>
            {liveRates.length > 0 && (
              <span className="text-xs text-gray-500">
                {liveRates[0]?.date}
              </span>
            )}
          </div>
          <div className="p-4">
            {liveRates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                <ArrowPathIcon className="w-8 h-8" />
                <p className="text-sm">&quot;Бодит ханш харах&quot; товч дарна уу</p>
              </div>
            ) : (
              <div className="space-y-2">
                {liveRates.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-xs">
                        {item.symbol.split('/')[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{item.symbol}</div>
                        <div className="text-xs text-gray-500">{item.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">₮{formatRate(item.rate)}</div>
                      <div className="text-xs text-gray-500">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ticker Preview */}
          {liveRates.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="px-5 py-3 bg-gray-50">
                <h4 className="text-xs font-semibold text-gray-600 mb-2">Ticker урьдчилан харах</h4>
              </div>
              <div className="bg-slate-900 py-2 px-4 overflow-hidden">
                <div className="flex items-center gap-4 text-xs whitespace-nowrap overflow-x-auto">
                  <span className="text-amber-400 font-semibold">Монголбанк {liveRates[0]?.date}</span>
                  <span className="text-slate-600">|</span>
                  {liveRates.map((item, idx) => (
                    <span key={idx} className="flex items-center gap-2">
                      <span className="text-slate-300 font-medium">{item.symbol}</span>
                      <span className="text-white font-bold">₮{formatRate(item.rate)}</span>
                      {idx < liveRates.length - 1 && <span className="text-slate-600 ml-2">|</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
