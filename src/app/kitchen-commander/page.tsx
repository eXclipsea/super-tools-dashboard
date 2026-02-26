'use client';

import { useState } from 'react';
import { Camera, Upload, ChefHat, Plus, X, Calendar, AlertCircle, BookOpen, Sparkles, Trash2, Search, Filter, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  expiryDate?: string;
  isOpened: boolean;
  addedDate: string;
  category: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  matchScore: number;
  timeToCook: string;
  difficulty: string;
  calories: number;
}

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Beverages'];

export default function KitchenCommander() {
  const [activeTab, setActiveTab] = useState<'photo' | 'pantry' | 'recipes' | 'shopping'>('photo');
  const [showBanner, setShowBanner] = useState(true);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', expiryDate: '', category: 'Produce' });
  const [showAddForm, setShowAddForm] = useState(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      const newItems: PantryItem[] = [
        { id: '1', name: 'Milk', quantity: '1 gallon', expiryDate: '2024-03-15', isOpened: false, addedDate: new Date().toISOString(), category: 'Dairy' },
        { id: '2', name: 'Eggs', quantity: '12 count', expiryDate: '2024-03-20', isOpened: false, addedDate: new Date().toISOString(), category: 'Dairy' },
        { id: '3', name: 'Bread', quantity: '1 loaf', expiryDate: '2024-03-10', isOpened: false, addedDate: new Date().toISOString(), category: 'Pantry' },
      ];
      setPantryItems(prev => [...prev, ...newItems]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const generateRecipes = async () => {
    // Simulate recipe generation
    setTimeout(() => {
      const newRecipes: Recipe[] = [
        { id: '1', name: 'Scrambled Eggs', ingredients: ['Eggs', 'Milk', 'Butter'], matchScore: 95, timeToCook: '10 min', difficulty: 'Easy', calories: 250 },
        { id: '2', name: 'French Toast', ingredients: ['Bread', 'Eggs', 'Milk'], matchScore: 88, timeToCook: '15 min', difficulty: 'Easy', calories: 320 },
      ];
      setRecipes(newRecipes);
    }, 1500);
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
      {/* Download Popup */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-500/10 backdrop-blur-xl border-b border-green-400/20">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <a
              href="https://github.com/eXclipsea/kitchen-commander/releases/download/v0.1.0/KitchenCommander_0.1.0_aarch64.dmg"
              className="flex items-center gap-2 text-[13px] text-white/80 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-green-400" />
              <span>Get <strong>Kitchen Commander</strong> for Mac</span>
              <span className="text-green-400 font-medium ml-1">Download &rarr;</span>
            </a>
            <button
              onClick={() => setShowBanner(false)}
              className="text-white/30 hover:text-white/60 transition-colors p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity inline-block">
            <ArrowLeft className="w-4 h-4 text-white/50" />
            <span className="text-[13px] text-white/50">Back to Super Tools</span>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="w-6 h-6 text-green-400" />
            <h1 className="text-2xl font-semibold tracking-tight">Kitchen Commander</h1>
          </div>
          <p className="text-neutral-500">AI-powered pantry & recipe management</p>
        </div>

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
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Upload Photo</h3>
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    isDragging 
                      ? 'border-green-400 bg-green-400/5' 
                      : 'border-neutral-800'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {selectedImage ? (
                    <div className="space-y-4">
                      <img src={selectedImage} alt="Uploaded" className="w-full h-64 object-cover rounded-lg" />
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                      <p className="text-neutral-400 mb-2">Drag & drop your fridge photo here</p>
                      <p className="text-neutral-500 text-sm mb-4">or click to browse</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-block bg-green-500 hover:bg-green-600 text-black font-medium py-2 px-4 rounded-lg cursor-pointer text-sm"
                      >
                        Choose Image
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
                {isAnalyzing ? (
                  <div className="flex items-center gap-3 text-green-400">
                    <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing your items...</span>
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
                  </div>
                ) : (
                  <p className="text-neutral-500">Upload an image to get started</p>
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
                        className="text-green-400 hover:text-green-300"
                      >
                        Add to List
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
                      className="text-green-400 hover:text-green-300 text-sm"
                    >
                      Add to List
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
                className="bg-green-500 hover:bg-green-600 text-black font-medium py-2 px-4 rounded-lg text-sm"
              >
                Generate Recipes
              </button>
            </div>

            {recipes.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500">Generate recipes based on your pantry items</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {recipes.map(recipe => (
                  <div key={recipe.id} className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{recipe.name}</h4>
                        <p className="text-sm text-neutral-500">{recipe.timeToCook} • {recipe.difficulty} • {recipe.calories} cal</p>
                      </div>
                      <div className="text-green-400 font-medium">{recipe.matchScore}% Match</div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Ingredients:</h5>
                      <div className="flex flex-wrap gap-2">
                        {recipe.ingredients.map((ing, idx) => (
                          <span key={idx} className="bg-neutral-800 px-3 py-1 rounded-full text-sm">{ing}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
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
      </div>
    </div>
  );
}
