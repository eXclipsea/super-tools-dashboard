'use client';

import { useState, useEffect } from 'react';
import { Plane, ArrowLeft, Check, X, Cloud, Sun, Snowflake, Sparkles, MapPin, Briefcase, Shirt, Waves, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { saveData, loadData } from '@/lib/data';

type WeatherType = 'hot' | 'cold' | 'rainy';
type TripType = 'leisure' | 'business' | 'adventure' | 'formal';

interface WardrobeItem {
  category: string;
  items: { name: string; checked: boolean }[];
}

interface TripPlan {
  destination: string;
  days: number;
  weather: WeatherType;
  tripType: TripType;
  hasLaundry: boolean;
  activities: string[];
  wardrobe: WardrobeItem[];
  createdAt: string;
}

const generateCapsule = (
  days: number, 
  weather: WeatherType, 
  tripType: TripType, 
  hasLaundry: boolean,
  activities: string[]
): WardrobeItem[] => {
  const wardrobe: WardrobeItem[] = [];
  
  // Calculate clothing multiplier based on laundry access
  const multiplier = hasLaundry ? Math.min(1.5, 1 + (days / 14)) : Math.min(2, 1 + (days / 7));
  const topsCount = Math.ceil(Math.min(days, 7) * multiplier);
  const bottomsCount = Math.ceil(Math.min(Math.ceil(days / 2), 4) * (hasLaundry ? 0.8 : 1));

  // Base layers (always needed) - show as quantities
  const underwearCount = hasLaundry ? Math.min(days + 2, 7) : days + 2;
  const socksCount = hasLaundry ? Math.min(days + 2, 7) : days + 2;
  
  wardrobe.push({
    category: 'Basics',
    items: [
      { name: `Underwear x${underwearCount}`, checked: false },
      { name: `Socks x${socksCount}`, checked: false }
    ]
  });

  // Weather-specific clothing
  if (weather === 'hot') {
    wardrobe.push(
      { category: 'Tops', items: Array(Math.min(topsCount, 7)).fill(null).map((_, i) => ({ name: `Lightweight top ${i + 1}`, checked: false })) },
      { category: 'Bottoms', items: ['Shorts', 'Light pants', 'Linen pants', 'Casual skirt/shorts'].slice(0, Math.min(bottomsCount, 4)).map((name, i) => ({ name, checked: false })) },
      { category: 'Outerwear', items: ['Light cardigan', 'Sun hat/cap'].map(name => ({ name, checked: false })) },
      { category: 'Shoes', items: ['Sandals/flip-flops', 'Comfortable walking shoes', 'One dressy pair'].map(name => ({ name, checked: false })) }
    );
    
    // Add swimwear if beach/water activities
    if (activities.includes('swimming') || activities.includes('beach')) {
      wardrobe.push({ category: 'Swim & Sun', items: ['Swimsuit', 'Cover-up', 'Sunglasses', 'Sunscreen', 'Beach towel'].map(name => ({ name, checked: false })) });
    } else {
      wardrobe.push({ category: 'Swim & Sun', items: ['Sunglasses', 'Sunscreen'].map(name => ({ name, checked: false })) });
    }
  } else if (weather === 'cold') {
    wardrobe.push(
      { category: 'Tops', items: Array(Math.min(topsCount, 7)).fill(null).map((_, i) => ({ name: `Layer-friendly top ${i + 1}`, checked: false })) },
      { category: 'Bottoms', items: ['Warm pants/jeans', 'Thermal leggings', 'Second pair of warm pants', 'Comfortable indoor pants'].slice(0, Math.min(bottomsCount, 4)).map((name, i) => ({ name, checked: false })) },
      { category: 'Outerwear', items: ['Warm coat/jacket', 'Light layer jacket', 'Scarf', 'Gloves', 'Warm hat/beanie'].map(name => ({ name, checked: false })) },
      { category: 'Shoes', items: ['Waterproof boots', 'Warm comfortable shoes', 'Indoor slippers/slip-ons'].map(name => ({ name, checked: false })) }
    );
  } else {
    // rainy
    wardrobe.push(
      { category: 'Tops', items: Array(Math.min(topsCount, 7)).fill(null).map((_, i) => ({ name: `Quick-dry top ${i + 1}`, checked: false })) },
      { category: 'Bottoms', items: ['Dark jeans/pants', 'Quick-dry pants', 'Backup pair', 'Comfortable lounge pants'].slice(0, Math.min(bottomsCount, 4)).map((name, i) => ({ name, checked: false })) },
      { category: 'Outerwear', items: ['Waterproof rain jacket', 'Compact umbrella', 'Light sweater', 'Water-resistant layer'].map(name => ({ name, checked: false })) },
      { category: 'Shoes', items: ['Waterproof shoes/boots', 'Backup dry pair', 'Indoor shoes'].map(name => ({ name, checked: false })) },
      { category: 'Rain Gear', items: ['Rain cover for bag', 'Waterproof phone case', 'Packable tote bag'].map(name => ({ name, checked: false })) }
    );
  }

  // Add formal wear if business or formal trip
  if (tripType === 'business' || tripType === 'formal') {
    wardrobe.push({
      category: 'Formal Wear',
      items: ['Dress shirt/blouse', 'Dress pants/skirt', 'Blazer/sports coat', 'Dress shoes', 'Belt'].map(name => ({ name, checked: false }))
    });
  }

  // Add workout gear if fitness activities
  if (activities.includes('fitness') || activities.includes('hiking') || activities.includes('sports')) {
    const workoutItems = ['Workout top', 'Workout shorts/leggings', 'Athletic shoes', 'Water bottle'];
    if (activities.includes('hiking')) {
      workoutItems.push('Hiking boots', 'Hiking socks');
    }
    wardrobe.push({
      category: 'Activity Gear',
      items: workoutItems.map(name => ({ name, checked: false }))
    });
  }

  // Sleepwear
  wardrobe.push({
    category: 'Sleepwear',
    items: [weather === 'cold' ? 'Warm pajamas' : 'Light pajamas', 'Robe/light cover'].map(name => ({ name, checked: false }))
  });

  // Toiletries
  wardrobe.push({
    category: 'Toiletries',
    items: ['Toothbrush & toothpaste', 'Deodorant', 'Hair care products', 'Skincare basics', 'Any medications', 'Hairbrush/comb'].map(name => ({ name, checked: false }))
  });

  // Add laundry supplies if needed
  if (hasLaundry) {
    wardrobe.push({
      category: 'Laundry Supplies',
      items: ['Travel detergent', 'Stain remover pen', 'Laundry bag'].map(name => ({ name, checked: false }))
    });
  }

  // Tech & Essentials
  wardrobe.push({
    category: 'Tech & Essentials',
    items: ['Phone charger', 'Power bank (optional)', 'Headphones', 'Travel documents', 'Wallet & ID'].map(name => ({ name, checked: false }))
  });

  return wardrobe;
};

export default function PackLight() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [weather, setWeather] = useState<WeatherType | null>(null);
  const [tripType, setTripType] = useState<TripType>('leisure');
  const [hasLaundry, setHasLaundry] = useState(false);
  const [activities, setActivities] = useState<string[]>([]);
  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved trip on mount
  useEffect(() => {
    const init = async () => {
      const saved = await loadData('packlight_trip', null);
      if (saved) {
        setTrip(saved);
        setDestination(saved.destination);
        setDays(saved.days);
        setWeather(saved.weather);
        setTripType(saved.tripType || 'leisure');
        setHasLaundry(saved.hasLaundry || false);
        setActivities(saved.activities || []);
      }
      setIsInitialized(true);
    };
    init();
  }, []);

  // Persist trip whenever it changes
  useEffect(() => {
    if (isInitialized && trip) {
      saveData('packlight_trip', trip);
    }
  }, [trip, isInitialized]);

  const toggleActivity = (activity: string) => {
    setActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const generateList = () => {
    if (!weather) return;
    const wardrobe = generateCapsule(days, weather, tripType, hasLaundry, activities);
    setTrip({
      destination: destination || 'Your Trip',
      days,
      weather,
      tripType,
      hasLaundry,
      activities,
      wardrobe,
      createdAt: new Date().toISOString()
    });
  };

  const toggleItem = (catIndex: number, itemIndex: number) => {
    if (!trip) return;
    const newWardrobe = [...trip.wardrobe];
    newWardrobe[catIndex].items[itemIndex].checked = !newWardrobe[catIndex].items[itemIndex].checked;
    setTrip({ ...trip, wardrobe: newWardrobe });
  };

  const clearTrip = () => {
    setTrip(null);
    setDestination('');
    setWeather(null);
    setTripType('leisure');
    setHasLaundry(false);
    setActivities([]);
    saveData('packlight_trip', null);
  };

  const totalItems = trip?.wardrobe.reduce((sum, cat) => sum + cat.items.length, 0) || 0;
  const checkedItems = trip?.wardrobe.reduce((sum, cat) => sum + cat.items.filter(i => i.checked).length, 0) || 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-white/50" />
            <span className="text-[13px] text-white/50">Back</span>
          </Link>
          <div className="w-px h-6 bg-neutral-800" />
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg font-semibold tracking-tight">PackLight</h1>
          </div>
        </div>

        {!trip ? (
          /* Trip Setup */
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
              <h3 className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                How it works
              </h3>
              <ol className="text-sm text-neutral-500 space-y-1 list-decimal list-inside">
                <li>Enter your destination and trip length</li>
                <li>Tell us about laundry access and planned activities</li>
                <li>Get a customized capsule wardrobe checklist</li>
                <li>Pack less when you can do laundry mid-trip!</li>
              </ol>
            </div>

            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-neutral-500 mb-2 block flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where are you going?"
                    className="w-full bg-black border border-neutral-800 text-white rounded-xl px-4 py-3 focus:border-sky-400/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-neutral-500 mb-2 block">Number of Days: {days}</label>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="w-full accent-sky-400"
                  />
                  <div className="flex justify-between text-xs text-neutral-600 mt-1">
                    <span>1 day</span>
                    <span>14 days</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-neutral-500 mb-2 block">Trip Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'leisure', icon: Sun, label: 'Leisure' },
                      { id: 'business', icon: Briefcase, label: 'Business' },
                      { id: 'adventure', icon: Dumbbell, label: 'Adventure' },
                      { id: 'formal', icon: Shirt, label: 'Formal' }
                    ].map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        onClick={() => setTripType(id as TripType)}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                          tripType === id ? 'bg-sky-500/20 border-sky-400' : 'border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-neutral-500 mb-2 block">Expected Weather</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setWeather('hot')}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        weather === 'hot' ? 'bg-sky-500/20 border-sky-400' : 'border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <Sun className="w-6 h-6" />
                      <span className="text-sm">Hot</span>
                    </button>
                    <button
                      onClick={() => setWeather('cold')}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        weather === 'cold' ? 'bg-sky-500/20 border-sky-400' : 'border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <Snowflake className="w-6 h-6" />
                      <span className="text-sm">Cold</span>
                    </button>
                    <button
                      onClick={() => setWeather('rainy')}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        weather === 'rainy' ? 'bg-sky-500/20 border-sky-400' : 'border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <Cloud className="w-6 h-6" />
                      <span className="text-sm">Rainy</span>
                    </button>
                  </div>
                </div>

                {/* Laundry Toggle */}
                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="hasLaundry"
                    checked={hasLaundry}
                    onChange={(e) => setHasLaundry(e.target.checked)}
                    className="w-4 h-4 accent-sky-400"
                  />
                  <label htmlFor="hasLaundry" className="text-sm text-neutral-400 cursor-pointer">
                    I&apos;ll have access to laundry (pack lighter!)
                  </label>
                </div>

                {/* Activities */}
                <div>
                  <label className="text-sm text-neutral-500 mb-2 block">Planned Activities</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'swimming', icon: Waves, label: 'Swimming' },
                      { id: 'fitness', icon: Dumbbell, label: 'Fitness' },
                      { id: 'hiking', icon: MapPin, label: 'Hiking' },
                      { id: 'beach', icon: Sun, label: 'Beach' }
                    ].map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        onClick={() => toggleActivity(id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          activities.includes(id) 
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300' 
                            : 'border-neutral-800 hover:border-neutral-700 text-neutral-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateList}
                  disabled={!weather}
                  className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Smart Packing List
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Packing List */
          <div className="space-y-6">
            {/* Trip Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-sky-300">{trip.destination}</h2>
                <p className="text-neutral-500">{trip.days} days • {trip.weather.charAt(0).toUpperCase()}{trip.weather.slice(1)}</p>
              </div>
              <button
                onClick={clearTrip}
                className="text-neutral-500 hover:text-white flex items-center gap-2 text-sm"
              >
                <X className="w-4 h-4" />
                New Trip
              </button>
            </div>

            {/* Progress */}
            <div className="bg-sky-500/10 rounded-xl p-4 border border-sky-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sky-400 font-medium">Packing Progress</span>
                <span className="text-sky-400">{checkedItems} / {totalItems} items</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div
                  className="bg-sky-400 h-2 rounded-full transition-all"
                  style={{ width: `${totalItems > 0 ? (checkedItems / totalItems) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Wardrobe Categories */}
            <div className="space-y-4">
              {trip.wardrobe.map((category, catIndex) => (
                <div key={category.category} className="bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800">
                  <h3 className="text-sm font-medium text-neutral-500 mb-3 uppercase tracking-wider flex items-center justify-between">
                    {category.category}
                    <span className="text-neutral-600">
                      {category.items.filter(i => i.checked).length}/{category.items.length}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <button
                        key={itemIndex}
                        onClick={() => toggleItem(catIndex, itemIndex)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                          item.checked
                            ? 'bg-sky-500/10 border-sky-500/30 opacity-50'
                            : 'bg-black border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                          item.checked ? 'bg-sky-500 border-sky-500' : 'border-neutral-600'
                        }`}>
                          {item.checked && <Check className="w-3 h-3 text-black" />}
                        </div>
                        <span className={item.checked ? 'line-through text-neutral-500' : 'text-white'}>
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Complete Message */}
            {checkedItems === totalItems && totalItems > 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-sky-400" />
                </div>
                <h3 className="text-xl font-medium text-sky-300 mb-2">Ready to Go!</h3>
                <p className="text-neutral-500">You&apos;ve packed everything. Have a great trip!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
