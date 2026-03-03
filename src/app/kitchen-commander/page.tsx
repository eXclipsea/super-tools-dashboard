'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Upload, ChefHat, Plus, X, Calendar, AlertCircle, Sparkles, Trash2, Search, ArrowLeft, User, Aperture, FolderPlus, Image, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser, logout } from '@/lib/auth';
import { saveData, loadData } from '@/lib/data';
import { CameraCapture } from '@/components/CameraCapture';

interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  expiryDate?: string;
  isOpened: boolean;
  addedDate: string;
  category: string;
}

interface Pantry {
  id: string;
  name: string;
  photos: string[];
  items: PantryItem[];
  createdAt: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  availableIngredients?: string[];
  missingIngredients?: string[];
  matchScore: number;
  timeToCook: string;
  difficulty: string;
  calories: number;
  servings?: number;
  macros?: { protein: string; carbs: string; fat: string; fiber: string };
  briefDescription?: string;
  fullInstructions?: string;
  instructions?: string;
}

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Beverages', 'Condiments', 'Snacks'];

export default function KitchenCommander() {
  const [activeTab, setActiveTab] = useState<'photo' | 'pantry' | 'recipes' | 'shopping'>('photo');
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [pantries, setPantries] = useState<Pantry[]>([]);
  const [activePantryId, setActivePantryId] = useState<string | null>(null);
  const [showNewPantryForm, setShowNewPantryForm] = useState(false);
  const [newPantryName, setNewPantryName] = useState('');
  const [renamingPantryId, setRenamingPantryId] = useState<string | null>(null);
  const [renamePantryName, setRenamePantryName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', expiryDate: '', category: 'Produce' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [analyzeNotice, setAnalyzeNotice] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const [recipeError, setRecipeError] = useState('');
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [addedToList, setAddedToList] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePantry = pantries.find(p => p.id === activePantryId) || null;

  // Load user session and data on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUser(user);
    
    const init = async () => {
      const [savedPantries, savedRecipes, savedShopping] = await Promise.all([
        loadData('kitchen_pantries', []),
        loadData('kitchen_recipes', []),
        loadData('kitchen_shopping', [])
      ]);
      if (savedPantries && savedPantries.length > 0) {
        setPantries(savedPantries);
        setActivePantryId(savedPantries[0].id);
        setPantryItems(savedPantries[0].items || []);
      }
      if (savedRecipes) setRecipes(savedRecipes);
      if (savedShopping) setShoppingList(savedShopping);
      setIsInitialized(true);
    };
    init();
  }, []);

  // Persist data whenever it changes
  useEffect(() => {
    if (isInitialized) saveData('kitchen_pantries', pantries);
  }, [pantries, isInitialized]);

  useEffect(() => {
    if (isInitialized) saveData('kitchen_recipes', recipes);
  }, [recipes, isInitialized]);

  useEffect(() => {
    if (isInitialized) saveData('kitchen_shopping', shoppingList);
  }, [shoppingList, isInitialized]);

  // Sync active pantry items back to pantries array
  useEffect(() => {
    if (activePantryId && isInitialized) {
      setPantries(prev => prev.map(p => p.id === activePantryId ? { ...p, items: pantryItems } : p));
    }
  }, [pantryItems, activePantryId, isInitialized]);

  const createPantry = (name: string) => {
    const newPantry: Pantry = { id: Date.now().toString(), name, photos: [], items: [], createdAt: new Date().toISOString() };
    setPantries(prev => [...prev, newPantry]);
    setActivePantryId(newPantry.id);
    setPantryItems([]);
    setShowNewPantryForm(false);
    setNewPantryName('');
  };

  const switchPantry = (id: string) => {
    const pantry = pantries.find(p => p.id === id);
    if (pantry) {
      setActivePantryId(id);
      setPantryItems(pantry.items || []);
    }
  };

  const deletePantry = (id: string) => {
    setPantries(prev => prev.filter(p => p.id !== id));
    if (activePantryId === id) {
      const remaining = pantries.filter(p => p.id !== id);
      if (remaining.length > 0) {
        setActivePantryId(remaining[0].id);
        setPantryItems(remaining[0].items || []);
      } else {
        setActivePantryId(null);
        setPantryItems([]);
      }
    }
  };

  const renamePantry = (id: string, name: string) => {
    setPantries(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    setRenamingPantryId(null);
    setRenamePantryName('');
  };

  const addPhotoToPantry = (photo: string) => {
    if (activePantryId) {
      setPantries(prev => prev.map(p => p.id === activePantryId ? { ...p, photos: [...p.photos, photo] } : p));
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    window.location.href = '/';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageData: string) => {
    setSelectedImage(imageData);
    setShowCamera(false);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalyzeError('');
    setAnalyzeNotice('');

    // Show progressive loading steps while waiting
    setLoadingStep('Sending image to GPT-4o...');
    const t1 = setTimeout(() => setLoadingStep('Scanning for food items...'), 1800);
    const t2 = setTimeout(() => setLoadingStep('Estimating quantities and expiry dates...'), 3500);

    try {
      const res = await fetch('/api/kitchen-commander/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: selectedImage }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (!data.canDetect || (data.items || []).length === 0) {
        setAnalyzeNotice(
          data.reason
            ? `AI couldn't identify food items: ${data.reason}`
            : 'No food items detected. Try a clearer, well-lit photo directly facing your fridge or pantry.'
        );
        return;
      }

      const newItems: PantryItem[] = (data.items || []).map((item: Omit<PantryItem, 'id' | 'isOpened' | 'addedDate'>) => ({
        ...item,
        id: `${Date.now()}-${Math.random()}`,
        isOpened: false,
        addedDate: new Date().toISOString(),
      }));
      setPantryItems(prev => [...prev, ...newItems]);
      if (selectedImage) addPhotoToPantry(selectedImage);
      setActiveTab('pantry');
    } catch (err: any) {
      console.error('Analyze error:', err);
      setAnalyzeError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsAnalyzing(false);
      setLoadingStep('');
    }
  };

  const generateRecipes = async () => {
    if (pantryItems.length === 0) return;
    setIsGeneratingRecipes(true);
    try {
      const res = await fetch('/api/kitchen-commander/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: pantryItems }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const newRecipes: Recipe[] = (data.recipes || []).map((r: Omit<Recipe, 'id'>, idx: number) => ({
        ...r,
        id: `${Date.now()}-${idx}`,
      }));
      setRecipes(newRecipes);
    } catch (err: any) {
      console.error('Recipes error:', err);
      setRecipeError(err.message || 'Failed to generate recipes. Please try again.');
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  const addPantryItem = () => {
    if (!newItem.name) return;
    
    const item: PantryItem = {
      id: Date.now().toString(),
      ...newItem,
      isOpened: false,
      addedDate: new Date().toISOString(),
    };
    
    setPantryItems(prev => [...prev, item]);
    setNewItem({ name: '', quantity: '', expiryDate: '', category: 'Produce' });
    setShowAddForm(false);
  };

  const deleteItem = (id: string) => {
    setPantryItems(prev => prev.filter(item => item.id !== id));
  };

  const addToShoppingList = (item: string) => {
    if (!shoppingList.includes(item)) {
      setShoppingList(prev => [...prev, item]);
      setAddedToList(item);
      setTimeout(() => setAddedToList(null), 2000);
    }
  };

  const getExpiringSoon = () => {
    const today = new Date();
    const threeDays = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    return pantryItems.filter(item => {
      if (!item.expiryDate) return false;
      const expiry = new Date(item.expiryDate);
      return expiry <= threeDays;
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-4 h-4 text-white/50" />
              <span className="text-[13px] text-white/50">Back</span>
            </Link>
            <div className="w-px h-6 bg-neutral-800" />
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-green-400" />
              <h1 className="text-lg font-semibold tracking-tight">Kitchen Commander</h1>
            </div>
          </div>
          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">{currentUser.name.charAt(0).toUpperCase()}</span>
              </div>
              <button onClick={handleLogout} className="text-white/50 hover:text-white text-sm">Logout</button>
            </div>
          )}
        </div>

        {/* Pantry Selector */}
        <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
          {pantries.map(p => (
            <button
              key={p.id}
              onClick={() => switchPantry(p.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activePantryId === p.id
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {renamingPantryId === p.id ? (
                <form onSubmit={(e) => { e.preventDefault(); renamePantry(p.id, renamePantryName); }} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={renamePantryName}
                    onChange={(e) => setRenamePantryName(e.target.value)}
                    className="bg-transparent border-b border-green-400 text-white text-sm w-24 focus:outline-none"
                    autoFocus
                  />
                  <button type="submit" className="text-green-400 text-xs">Save</button>
                </form>
              ) : (
                <>
                  <Image className="w-3.5 h-3.5" />
                  {p.name}
                  {activePantryId === p.id && (
                    <span className="text-xs text-green-400/60">({p.items.length})</span>
                  )}
                </>
              )}
            </button>
          ))}
          {showNewPantryForm ? (
            <form onSubmit={(e) => { e.preventDefault(); if (newPantryName.trim()) createPantry(newPantryName.trim()); }} className="flex items-center gap-2">
              <input
                type="text"
                value={newPantryName}
                onChange={(e) => setNewPantryName(e.target.value)}
                placeholder="Pantry name"
                className="bg-neutral-900 border border-neutral-700 text-white text-sm rounded-lg px-3 py-2 w-32 focus:outline-none focus:border-green-500"
                autoFocus
              />
              <button type="submit" className="text-green-400 text-sm font-medium">Add</button>
              <button type="button" onClick={() => setShowNewPantryForm(false)} className="text-neutral-500 text-sm">Cancel</button>
            </form>
          ) : (
            <button
              onClick={() => setShowNewPantryForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-neutral-900 text-neutral-500 border border-dashed border-neutral-700 hover:border-green-500/50 hover:text-green-400 transition-colors whitespace-nowrap"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              New Pantry
            </button>
          )}
        </div>

        {/* Active Pantry Actions */}
        {activePantry && (
          <div className="mb-4 flex items-center gap-3 text-xs">
            <button onClick={() => { setRenamingPantryId(activePantry.id); setRenamePantryName(activePantry.name); }} className="text-neutral-500 hover:text-white flex items-center gap-1 transition-colors"><Edit2 className="w-3 h-3" /> Rename</button>
            <button onClick={() => deletePantry(activePantry.id)} className="text-red-400/60 hover:text-red-400 flex items-center gap-1 transition-colors"><Trash2 className="w-3 h-3" /> Delete Pantry</button>
            {activePantry.photos.length > 0 && <span className="text-neutral-600">{activePantry.photos.length} photo(s)</span>}
          </div>
        )}

        {!activePantry && pantries.length === 0 && (
          <div className="text-center py-16">
            <FolderPlus className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-400 mb-2">Create your first pantry</h3>
            <p className="text-neutral-600 text-sm mb-6">Organize your food by location — fridge, pantry shelf, freezer, etc.</p>
            <button
              onClick={() => setShowNewPantryForm(true)}
              className="bg-green-500 hover:bg-green-600 text-black font-medium py-2.5 px-6 rounded-lg text-sm"
            >
              Create Pantry
            </button>
          </div>
        )}

        {activePantry && (<>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-10 border-b border-neutral-800">
          {[
            { id: 'photo', label: 'Add Photo', icon: Camera },
            { id: 'pantry', label: 'My Pantry', icon: Search },
            { id: 'recipes', label: 'Recipes', icon: Sparkles },
            { id: 'shopping', label: 'Shopping List', icon: Plus },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === id
                  ? 'border-green-400 text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Photo Tab */}
        {activeTab === 'photo' && (
          <div className="space-y-6">
            {/* Instructions Card */}
            <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
              <h3 className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-400" />
                How it works
              </h3>
              <ol className="text-sm text-neutral-500 space-y-1 list-decimal list-inside">
                <li>Take a photo of your fridge, pantry, or grocery items</li>
                <li>AI will automatically identify items and suggest quantities</li>
                <li>Review and add items to your pantry with expiry dates</li>
                <li>Get recipe suggestions based on what you have</li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Upload or Capture Photo</h3>
                
                {!selectedImage ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-neutral-800 hover:border-neutral-600 rounded-xl p-6 text-center transition-colors"
                    >
                      <Upload className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                      <p className="text-neutral-400 text-sm">Upload Photo</p>
                      <p className="text-neutral-600 text-xs mt-1">From device</p>
                    </button>
                    <button
                      onClick={() => setShowCamera(true)}
                      className="border-2 border-dashed border-green-400/50 hover:border-green-400 rounded-xl p-6 text-center transition-colors"
                    >
                      <Aperture className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 text-sm">Take Photo</p>
                      <p className="text-neutral-600 text-xs mt-1">Use camera</p>
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-neutral-800 rounded-xl p-4 text-center">
                    <div className="space-y-3">
                      <div className="relative">
                        <img src={selectedImage} alt="Uploaded" className="w-full h-64 object-cover rounded-lg" />
                        {/* White detection zone overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-[70%] h-[70%] border-2 border-white/40 rounded-xl">
                            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-white rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-white rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-white rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-white rounded-br-lg" />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-600">AI scans the highlighted area for food items</p>
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
                {isAnalyzing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-green-400">
                      <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">{loadingStep || 'Analyzing...'}</span>
                    </div>
                    <p className="text-xs text-neutral-600">This may take 5–10 seconds</p>
                  </div>
                ) : selectedImage ? (
                  <div className="space-y-4">
                    <button
                      onClick={analyzeImage}
                      className="w-full bg-green-500 hover:bg-green-600 text-black font-medium py-3 px-4 rounded-lg"
                    >
                      Analyze Image
                    </button>
                    <p className="text-sm text-neutral-500">
                      AI will identify items, quantities, and suggest expiry dates
                    </p>
                    {analyzeNotice && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-amber-400 text-sm font-medium mb-1 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          AI couldn't detect items
                        </p>
                        <p className="text-amber-300 text-sm">{analyzeNotice}</p>
                        <div className="mt-3 text-xs text-neutral-500 space-y-1">
                          <p className="font-medium text-neutral-400">Tips for better results:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            <li>Use good lighting - avoid shadows and glare</li>
                            <li>Photo facing directly into the fridge/pantry</li>
                            <li>Make sure item labels are visible</li>
                            <li>Include multiple items in one photo</li>
                            <li>Try a different angle if detection fails</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    {analyzeError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm font-medium mb-1 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Something went wrong
                        </p>
                        <p className="text-red-300 text-sm">{analyzeError}</p>
                        <div className="mt-3 text-xs text-neutral-500 space-y-1">
                          <p className="font-medium text-neutral-400">Try these steps:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            <li>Check your internet connection</li>
                            <li>Try uploading a smaller image file</li>
                            <li>Ensure the image format is JPG or PNG</li>
                            <li>Refresh the page and try again</li>
                            <li>If problems persist, try manual entry</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-800">
                    <p className="text-neutral-500 mb-3">Upload an image to get started</p>
                    <div className="text-xs text-neutral-600 space-y-1">
                      <p className="font-medium text-neutral-500">Photo tips:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Take photos in good lighting</li>
                        <li>Include the whole item/label</li>
                        <li>Hold camera steady for clear shots</li>
                        <li>Works best with packaged groceries</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pantry Tab */}
        {activeTab === 'pantry' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">My Pantry ({pantryItems.length} items)</h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-500 hover:bg-green-600 text-black font-medium py-2 px-4 rounded-lg text-sm"
              >
                Add Item
              </button>
            </div>

            {showAddForm && (
              <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                <h4 className="font-medium mb-4">Add New Item</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-black border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Quantity"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                    className="bg-black border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="bg-black border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm"
                  />
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    className="bg-black border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={addPantryItem}
                    className="bg-green-500 hover:bg-green-600 text-black font-medium py-2 px-4 rounded-lg text-sm"
                  >
                    Add Item
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {getExpiringSoon().length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Expiring Soon
                </div>
                <div className="space-y-2">
                  {getExpiringSoon().map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.name} - {item.expiryDate}</span>
                      <button
                        onClick={() => addToShoppingList(item.name)}
                        className={`transition-colors ${
                          addedToList === item.name 
                            ? 'text-green-400 font-medium' 
                            : 'text-green-400 hover:text-green-300'
                        }`}
                      >
                        {addedToList === item.name ? '✓ Added!' : 'Add to List'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {pantryItems.map(item => (
                <div key={item.id} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-neutral-500">{item.quantity} • {item.category}</p>
                    {item.expiryDate && (
                      <p className="text-xs text-neutral-600">Expires: {item.expiryDate}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => addToShoppingList(item.name)}
                      className={`transition-colors text-sm ${
                        addedToList === item.name 
                          ? 'text-green-400 font-medium' 
                          : 'text-green-400 hover:text-green-300'
                      }`}
                    >
                      {addedToList === item.name ? '✓ Added!' : 'Add to List'}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recipe Suggestions</h3>
              <button
                onClick={generateRecipes}
                disabled={isGeneratingRecipes || pantryItems.length === 0}
                className="bg-green-500 hover:bg-green-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-medium py-2 px-4 rounded-lg text-sm flex items-center gap-2"
              >
                {isGeneratingRecipes && <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                {isGeneratingRecipes ? 'Generating...' : 'Generate Recipes'}
              </button>
            </div>

            {recipeError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {recipeError}
              </div>
            )}

            {recipes.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500">Generate recipes based on your pantry items</p>
                {pantryItems.length === 0 && <p className="text-neutral-600 text-sm mt-1">Add items to your pantry first</p>}
              </div>
            ) : (
              <div className="grid gap-4">
                {recipes.map(recipe => {
                  const isExpanded = expandedRecipeId === recipe.id;
                  return (
                  <div key={recipe.id} className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{recipe.name}</h4>
                        {recipe.briefDescription && (
                          <p className="text-sm text-neutral-400 italic mt-0.5">{recipe.briefDescription}</p>
                        )}
                        <p className="text-sm text-neutral-500 mt-1">{recipe.timeToCook} • {recipe.difficulty} • {recipe.calories} cal{recipe.servings ? ` • ${recipe.servings} servings` : ''}</p>
                      </div>
                      <div className={`font-semibold text-sm px-3 py-1 rounded-full ${
                        recipe.matchScore >= 80 ? 'bg-green-500/20 text-green-400' :
                        recipe.matchScore >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{recipe.matchScore}% Match</div>
                    </div>

                    {recipe.macros && (
                      <div className="flex gap-3 mb-4">
                        {Object.entries(recipe.macros).map(([key, val]) => (
                          <span key={key} className="text-xs bg-neutral-800 px-2.5 py-1 rounded-lg">
                            <span className="text-neutral-500 capitalize">{key}</span> <span className="text-white font-medium">{val}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mb-3">
                      <h5 className="font-medium mb-2 text-sm">Ingredients:</h5>
                      <div className="flex flex-wrap gap-2">
                        {recipe.ingredients.map((ing, idx) => {
                          const isAvailable = recipe.availableIngredients?.some(a => 
                            ing.toLowerCase().includes(a.toLowerCase())
                          );
                          return (
                            <span key={idx} className={`px-3 py-1 rounded-full text-sm ${
                              isAvailable ? 'bg-green-500/15 text-green-300 border border-green-500/20' : 'bg-neutral-800 text-neutral-400'
                            }`}>{ing}</span>
                          );
                        })}
                      </div>
                      {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                        <p className="text-xs text-neutral-500 mt-2">
                          Missing: {recipe.missingIngredients.join(', ')}
                        </p>
                      )}
                    </div>

                    {!isExpanded ? (
                      <button
                        onClick={() => setExpandedRecipeId(recipe.id)}
                        className="text-green-400 hover:text-green-300 text-sm font-medium mt-2 transition-colors"
                      >
                        Read More →
                      </button>
                    ) : (
                      <div className="mt-4 border-t border-neutral-800 pt-4 space-y-4">
                        {(recipe.fullInstructions || recipe.instructions) && (
                          <div>
                            <h5 className="font-medium mb-3 text-sm">Step-by-Step Instructions:</h5>
                            <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                              {recipe.fullInstructions || recipe.instructions}
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => setExpandedRecipeId(null)}
                          className="text-neutral-500 hover:text-neutral-300 text-sm font-medium transition-colors"
                        >
                          Show Less ↑
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Shopping List Tab */}
        {activeTab === 'shopping' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Shopping List ({shoppingList.length} items)</h3>

            {shoppingList.length === 0 ? (
              <div className="text-center py-12">
                <Plus className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500">Add items from your pantry to create a shopping list</p>
              </div>
            ) : (
              <div className="space-y-2">
                {shoppingList.map((item, idx) => (
                  <div key={idx} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 flex items-center justify-between">
                    <span>{item}</span>
                    <button
                      onClick={() => setShoppingList(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pantry Photos Gallery */}
        {activePantry && activePantry.photos.length > 0 && activeTab === 'pantry' && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-neutral-400 mb-3">Pantry Photos</h4>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {activePantry.photos.map((photo, idx) => (
                <div key={idx} className="relative shrink-0">
                  <img src={photo} alt={`Pantry photo ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg border border-neutral-800" />
                  <button
                    onClick={() => setPantries(prev => prev.map(p => p.id === activePantryId ? { ...p, photos: p.photos.filter((_, i) => i !== idx) } : p))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        </>)}
      </div>
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
