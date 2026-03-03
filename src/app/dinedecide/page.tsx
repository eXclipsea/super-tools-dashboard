'use client';

import { useState, useEffect } from 'react';
import { Utensils, ArrowLeft, Sparkles, Search, AlertCircle, Star, MapPin, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { saveData, loadData } from '@/lib/data';

interface Restaurant {
  name: string;
  rating: number;
  reviewCount: number;
  factors: {
    food: number;
    service: number;
    atmosphere: number;
    value: number;
  };
  pros: string[];
  cons: string[];
  summary: string;
  visited?: boolean;
  visitDate?: string;
}

interface ComparisonResult {
  optionA: Restaurant;
  optionB: Restaurant;
  winner: 'A' | 'B' | 'tie';
  reasoning: string;
}

export default function DineDecide() {
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [addressA, setAddressA] = useState('');
  const [addressB, setAddressB] = useState('');
  const [useSpecificAddresses, setUseSpecificAddresses] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const [restaurantHistory, setRestaurantHistory] = useState<Restaurant[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load saved data and history on mount
  useEffect(() => {
    const init = async () => {
      const [savedResult, savedHistory] = await Promise.all([
        loadData('dinedecide_result', null),
        loadData('dinedecide_history', [])
      ]);
      
      if (savedResult) {
        setResult(savedResult);
        setOptionA(savedResult.optionA.name);
        setOptionB(savedResult.optionB.name);
      }
      
      if (savedHistory && Array.isArray(savedHistory)) {
        setRestaurantHistory(savedHistory);
      }
      
      setIsInitialized(true);
    };
    init();
  }, []);

  // Persist result and history whenever they change
  useEffect(() => {
    if (isInitialized && result) {
      saveData('dinedecide_result', result);
      
      // Add restaurants to history
      const newHistory = [...restaurantHistory];
      [result.optionA, result.optionB].forEach(restaurant => {
        if (!newHistory.find(r => r.name.toLowerCase() === restaurant.name.toLowerCase())) {
          newHistory.push(restaurant);
        }
      });
      
      if (newHistory.length !== restaurantHistory.length) {
        setRestaurantHistory(newHistory);
        saveData('dinedecide_history', newHistory);
      }
    }
  }, [result, isInitialized]);

  const analyzeRestaurants = async () => {
    if (!optionA.trim() || !optionB.trim()) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const res = await fetch('/api/dinedecide/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          optionA, 
          optionB,
          addressA: useSpecificAddresses ? addressA : undefined,
          addressB: useSpecificAddresses ? addressB : undefined,
          restaurantHistory
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze restaurants');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze. Please check restaurant names and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const markRestaurantVisited = (name: string) => {
    const newHistory = restaurantHistory.map(r => 
      r.name === name 
        ? { ...r, visited: true, visitDate: new Date().toISOString().split('T')[0] }
        : r
    );
    setRestaurantHistory(newHistory);
    saveData('dinedecide_history', newHistory);
  };

  const reset = () => {
    setResult(null);
    setOptionA('');
    setOptionB('');
    setError('');
    saveData('dinedecide_result', null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-white/50" />
            <span className="text-[13px] text-white/50">Back</span>
          </Link>
          <div className="w-px h-6 bg-neutral-800" />
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-violet-400" />
            <h1 className="text-lg font-semibold tracking-tight">DineDecide</h1>
          </div>
        </div>

        {!result ? (
          /* Input Section */
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
              <h3 className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                How it works
              </h3>
              <ol className="text-sm text-neutral-500 space-y-1 list-decimal list-inside">
                <li>Enter two restaurant names you&apos;re considering</li>
                <li>AI scans Google Reviews and analyzes feedback</li>
                <li>Get scores for food, service, atmosphere, and value</li>
                <li>See a clear recommendation with reasoning</li>
              </ol>
            </div>

            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <h2 className="text-lg font-semibold mb-6">Compare Restaurants</h2>
              
              {/* Address Toggle */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-neutral-800/50 rounded-lg">
                <input
                  type="checkbox"
                  id="useAddresses"
                  checked={useSpecificAddresses}
                  onChange={(e) => setUseSpecificAddresses(e.target.checked)}
                  className="w-4 h-4 accent-violet-400"
                />
                <label htmlFor="useAddresses" className="text-sm text-neutral-400 cursor-pointer">
                  Use specific addresses for more accurate comparison
                </label>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-neutral-500 mb-2 block">Restaurant A</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="text"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      placeholder="e.g., The French Laundry"
                      className="w-full bg-black border border-neutral-800 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-400/50 focus:outline-none"
                    />
                  </div>
                  {useSpecificAddresses && (
                    <div className="mt-2">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                          type="text"
                          value={addressA}
                          onChange={(e) => setAddressA(e.target.value)}
                          placeholder="Address (e.g., 6640 Washington St, Yountville, CA)"
                          className="w-full bg-black border border-neutral-800 text-white rounded-xl pl-9 pr-4 py-2 text-sm focus:border-violet-400/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <span className="text-neutral-600 text-sm">VS</span>
                </div>

                <div>
                  <label className="text-sm text-neutral-500 mb-2 block">Restaurant B</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="text"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      placeholder="e.g., Ad Hoc"
                      className="w-full bg-black border border-neutral-800 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-400/50 focus:outline-none"
                    />
                  </div>
                  {useSpecificAddresses && (
                    <div className="mt-2">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                          type="text"
                          value={addressB}
                          onChange={(e) => setAddressB(e.target.value)}
                          placeholder="Address (e.g., 6476 Washington St, Yountville, CA)"
                          className="w-full bg-black border border-neutral-800 text-white rounded-xl pl-9 pr-4 py-2 text-sm focus:border-violet-400/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={analyzeRestaurants}
                disabled={!optionA.trim() || !optionB.trim() || isAnalyzing}
                className="w-full bg-violet-500 hover:bg-violet-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Analyzing Google Reviews...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Compare Restaurants
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm font-medium mb-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Error
                  </p>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Restaurant History */}
              {restaurantHistory.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 mb-3"
                  >
                    <Star className="w-4 h-4" />
                    Your Restaurant History ({restaurantHistory.length})
                    {restaurantHistory.filter(r => r.visited).length > 0 && (
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {restaurantHistory.filter(r => r.visited).length} visited
                      </span>
                    )}
                    <span className="text-neutral-500">{showHistory ? '▲' : '▼'}</span>
                  </button>
                  
                  {showHistory && (
                    <div className="bg-neutral-800/50 rounded-xl p-4 space-y-2">
                      {restaurantHistory.map((restaurant, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-neutral-800 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{restaurant.name}</p>
                            <p className="text-xs text-neutral-500">
                              {restaurant.rating}★ • Food: {restaurant.factors.food}/10
                            </p>
                          </div>
                          <button
                            onClick={() => markRestaurantVisited(restaurant.name)}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                              restaurant.visited 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                            }`}
                          >
                            {restaurant.visited ? '✓ Visited' : 'Mark Visited'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 text-xs text-neutral-600">
                <p className="font-medium text-neutral-500 mb-1">Tips:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Include city/location for better accuracy</li>
                  <li>Use exact restaurant names when possible</li>
                  <li>AI considers your past preferences from history</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            {/* Winner Banner */}
            <div className={`rounded-3xl p-6 border ${
              result.winner === 'A' ? 'bg-violet-500/10 border-violet-500/20' :
              result.winner === 'B' ? 'bg-violet-500/10 border-violet-500/20' :
              'bg-neutral-900/50 border-neutral-800'
            }`}>
              <div className="text-center">
                {result.winner === 'tie' ? (
                  <>
                    <Sparkles className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
                    <p className="text-neutral-400 text-sm mb-1">It&apos;s a Tie!</p>
                    <p className="text-xl font-semibold">Both restaurants are equally matched</p>
                  </>
                ) : (
                  <>
                    <Utensils className="w-10 h-10 text-violet-400 mx-auto mb-3" />
                    <p className="text-violet-400 text-sm mb-1">Recommended Choice</p>
                    <p className="text-2xl font-semibold text-violet-300">
                      {result.winner === 'A' ? result.optionA.name : result.optionB.name}
                    </p>
                  </>
                )}
                <p className="text-neutral-400 mt-3 text-sm">{result.reasoning}</p>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Restaurant A */}
              <div className={`rounded-2xl p-5 border ${
                result.winner === 'A' ? 'bg-violet-500/5 border-violet-500/20' : 'bg-neutral-900/50 border-neutral-800'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold text-lg">{result.optionA.name}</h3>
                  {result.winner === 'A' && <span className="text-violet-400 text-sm">★ Winner</span>}
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="font-semibold">{result.optionA.rating}</span>
                  </div>
                  <span className="text-neutral-500 text-sm">({result.optionA.reviewCount} reviews)</span>
                </div>

                <div className="space-y-2 mb-4">
                  <ScoreBar label="Food" score={result.optionA.factors.food} />
                  <ScoreBar label="Service" score={result.optionA.factors.service} />
                  <ScoreBar label="Atmosphere" score={result.optionA.factors.atmosphere} />
                  <ScoreBar label="Value" score={result.optionA.factors.value} />
                </div>

                {(result.optionA as any).summary && (
                  <p className="text-xs text-neutral-400 italic mb-3">{(result.optionA as any).summary}</p>
                )}
                <div className="space-y-2">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Pros</p>
                  <ul className="space-y-1">
                    {result.optionA.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-emerald-400 flex items-start gap-2">
                        <span>+</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 mt-3">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Cons</p>
                  <ul className="space-y-1">
                    {result.optionA.cons.map((con, i) => (
                      <li key={i} className="text-sm text-red-400/80 flex items-start gap-2">
                        <span>−</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Restaurant B */}
              <div className={`rounded-2xl p-5 border ${
                result.winner === 'B' ? 'bg-violet-500/5 border-violet-500/20' : 'bg-neutral-900/50 border-neutral-800'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold text-lg">{result.optionB.name}</h3>
                  {result.winner === 'B' && <span className="text-violet-400 text-sm">★ Winner</span>}
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="font-semibold">{result.optionB.rating}</span>
                  </div>
                  <span className="text-neutral-500 text-sm">({result.optionB.reviewCount} reviews)</span>
                </div>

                <div className="space-y-2 mb-4">
                  <ScoreBar label="Food" score={result.optionB.factors.food} />
                  <ScoreBar label="Service" score={result.optionB.factors.service} />
                  <ScoreBar label="Atmosphere" score={result.optionB.factors.atmosphere} />
                  <ScoreBar label="Value" score={result.optionB.factors.value} />
                </div>

                {(result.optionB as any).summary && (
                  <p className="text-xs text-neutral-400 italic mb-3">{(result.optionB as any).summary}</p>
                )}
                <div className="space-y-2">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Pros</p>
                  <ul className="space-y-1">
                    {result.optionB.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-emerald-400 flex items-start gap-2">
                        <span>+</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 mt-3">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Cons</p>
                  <ul className="space-y-1">
                    {result.optionB.cons.map((con, i) => (
                      <li key={i} className="text-sm text-red-400/80 flex items-start gap-2">
                        <span>−</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={reset}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Compare Different Restaurants
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-400 w-20">{label}</span>
      <div className="flex-1 bg-neutral-800 rounded-full h-2">
        <div
          className="bg-violet-400 h-2 rounded-full transition-all"
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
      <span className="text-sm font-medium w-8">{score}</span>
    </div>
  );
}
