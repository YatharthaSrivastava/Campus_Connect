'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { marketplaceAPI, exchangeAPI } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import { getCollegeShortName } from '@/lib/colleges';

interface ListingItem {
  _id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  collegeName?: string;
  title: string;
  description: string;
  category: 'textbook' | 'lab_coat' | 'tool' | 'electronics';
  priceOrKarma: number;
  status: 'active' | 'reserved' | 'sold';
  condition?: string;
  conditionNotes?: string;
  images?: string[];
  createdAt: string;
}

const PRESET_IMAGES = [
  { label: '📖 Textbook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80' },
  { label: '🥼 Lab Coat', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80' },
  { label: '📐 Drafting Kit', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&q=80' },
  { label: '⚡ Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&q=80' },
];

export default function MarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [initiatingId, setInitiatingId] = useState<string | null>(null);

  // Detail Modal state
  const [detailItem, setDetailItem] = useState<ListingItem | null>(null);

  // Add Listing Modal state
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'textbook' | 'lab_coat' | 'tool' | 'electronics'>('textbook');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCondition, setNewCondition] = useState('Like New');
  const [newConditionNotes, setNewConditionNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'all', label: 'All Gear' },
    { id: 'textbook', label: '📖 Textbooks' },
    { id: 'lab_coat', label: '🥼 Lab Coats' },
    { id: 'tool', label: '📐 Drafting & Tools' },
    { id: 'electronics', label: '⚡ Electronics' },
  ];

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params: { category?: string } = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      const res = await marketplaceAPI.getListings(params);
      setListings(res.data.data || []);
    } catch (err) {
      console.error('Failed to load listings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  const handleInitiateExchange = async (listing: ListingItem) => {
    try {
      setInitiatingId(listing._id);
      const res = await exchangeAPI.initiate({
        listingId: listing._id,
        buyerId: user?.id,
      });

      if (res.data?.data) {
        localStorage.setItem('active_handshake', JSON.stringify(res.data.data));
        setDetailItem(null);
        router.push('/handshake');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to initiate exchange';
      alert(msg);
    } finally {
      setInitiatingId(null);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    try {
      setIsSubmitting(true);
      await marketplaceAPI.createListing({
        title: newTitle,
        category: newCategory,
        price: Number(newPrice),
        description: newDesc,
        condition: newCondition,
        conditionNotes: newConditionNotes,
        images: imageUrl ? [imageUrl] : [],
        collegeName: user?.collegeName || 'General Campus',
      });

      setShowModal(false);
      setNewTitle('');
      setNewPrice('');
      setNewDesc('');
      setNewConditionNotes('');
      setImageUrl('');
      fetchListings();
    } catch (err) {
      console.error('Failed to create listing', err);
      alert('Error creating listing. Check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter listings by status and search
  const filteredListings = listings.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.conditionNotes && item.conditionNotes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getConditionColor = (cond?: string) => {
    switch (cond) {
      case 'Brand New':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Like New':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Gently Used':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Fair':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Heavily Used':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-[#005F73] tracking-tight">
            Inter-Campus Marketplace
          </h1>
          <p className="text-sm text-[#334155] mt-1 font-medium">
            Verified peer-to-peer exchange for textbooks, lab kits, drafters, and calculators across all colleges.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-[#005F73] hover:bg-[#0A9396] text-white font-bold rounded-2xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span>＋</span> List Academic Gear (+5 Karma)
        </button>
      </div>

      {/* ── Search & Filter Controls ──────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-xs space-y-3">
        {/* Search input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search textbooks, drafters, calculators, notes, editions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#005F73] transition"
            />
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {(['all', 'active', 'sold'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition capitalize cursor-pointer ${
                  statusFilter === s
                    ? 'bg-white text-[#005F73] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {s === 'all' ? 'All Status' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#005F73] text-white shadow-xs'
                  : 'bg-gray-100 text-[#334155] hover:bg-[#E9D8A6]/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Listings Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl h-72 p-6 border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 space-y-3">
          <span className="text-4xl">📦</span>
          <h3 className="text-lg font-bold text-gray-700">No items match your criteria</h3>
          <p className="text-xs text-gray-400">Try changing the category or search terms, or be the first to list!</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#005F73] text-white text-xs font-bold rounded-xl"
          >
            ＋ List An Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => {
            const hasImage = item.images && item.images.length > 0 && item.images[0];
            const collegeLabel = getCollegeShortName(item.collegeName);
            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                {/* Product Image Thumbnail */}
                <div
                  className="relative h-44 bg-gray-100 overflow-hidden cursor-pointer flex items-center justify-center"
                  onClick={() => setDetailItem(item)}
                >
                  {hasImage ? (
                    <img
                      src={item.images![0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#005F73]/20 to-[#0A9396]/20 flex flex-col items-center justify-center text-gray-500">
                      <span className="text-4xl mb-1">
                        {item.category === 'textbook'
                          ? '📖'
                          : item.category === 'lab_coat'
                          ? '🥼'
                          : item.category === 'electronics'
                          ? '⚡'
                          : '📐'}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        {item.category.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  {/* Status Overlay Badge */}
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs ${
                      item.status === 'active'
                        ? 'bg-emerald-500 text-white'
                        : item.status === 'reserved'
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </span>

                  {/* Condition Tag */}
                  {item.condition && (
                    <span
                      className={`absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-xs ${getConditionColor(
                        item.condition
                      )}`}
                    >
                      {item.condition}
                    </span>
                  )}
                </div>

                <div className="p-5 cursor-pointer" onClick={() => setDetailItem(item)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#E9D8A6] text-[#334155] uppercase tracking-wider">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500" title={item.collegeName}>
                      🏫 {collegeLabel}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#005F73] group-hover:text-[#0A9396] transition line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#334155] mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Detail preview: Condition notes */}
                  {item.conditionNotes && (
                    <div className="mt-2.5 p-2 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-600 line-clamp-1">
                      <strong className="text-gray-700">Condition Note:</strong> {item.conditionNotes}
                    </div>
                  )}
                </div>

                <div className="p-5 pt-0 border-t border-gray-100 mt-2">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-[11px] text-gray-400 block font-medium">Price / Karma</span>
                      <span className="text-xl font-black text-[#005F73]">
                        ₹{item.priceOrKarma}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#334155] block">
                        {item.sellerName}
                      </span>
                      <span className="text-[10px] text-[#0A9396] font-bold">
                        ✓ Verified Student
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setDetailItem(item)}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#334155] text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleInitiateExchange(item)}
                      disabled={initiatingId === item._id || item.status !== 'active'}
                      className="flex-1 py-2.5 bg-[#005F73] hover:bg-[#0A9396] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {initiatingId === item._id ? (
                        'Generating...'
                      ) : item.status === 'sold' ? (
                        'Sold'
                      ) : (
                        '🤝 Handshake'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Item Detail Modal ─────────────────────────────────────────── */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E9D8A6] text-[#334155] uppercase">
                  {detailItem.category.replace('_', ' ')}
                </span>
                <h2 className="text-xl font-black text-[#005F73] mt-1">{detailItem.title}</h2>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Product Photo */}
            {detailItem.images && detailItem.images.length > 0 && (
              <div className="h-56 rounded-2xl overflow-hidden border border-gray-200">
                <img
                  src={detailItem.images[0]}
                  alt={detailItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              {/* Product Condition Section */}
              <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Product Condition
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${getConditionColor(
                      detailItem.condition
                    )}`}
                  >
                    {detailItem.condition || 'Good'}
                  </span>
                </div>

                {detailItem.conditionNotes && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-[11px] font-bold text-[#005F73] block mb-0.5">
                      Seller&apos;s Condition Report:
                    </span>
                    <p className="text-xs text-[#334155] leading-relaxed">
                      &ldquo;{detailItem.conditionNotes}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* General Description */}
              <div className="p-4 bg-gray-50 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 uppercase block mb-1">
                  Item Description
                </span>
                <p className="text-xs text-[#334155] leading-relaxed">{detailItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#faf8f5] border border-[#0A9396]/30 rounded-xl">
                  <span className="text-gray-400 block font-medium">Price / Karma</span>
                  <span className="text-lg font-black text-[#005F73]">₹{detailItem.priceOrKarma}</span>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-gray-400 block font-medium">College Campus</span>
                  <span className="text-xs font-bold text-[#334155] truncate block">
                    {getCollegeShortName(detailItem.collegeName)}
                  </span>
                </div>
              </div>

              {/* Safe Meetup Protocol */}
              <div className="p-4 bg-[#E9D8A6]/20 border border-[#E9D8A6] rounded-2xl text-xs space-y-1">
                <div className="font-bold text-[#334155] flex items-center gap-1.5">
                  <span>🛡️</span> Zero-Trust Meetup Protocol
                </div>
                <p className="text-gray-600 text-[11px]">
                  Meet in designated Safe Exchange Zones (Library Pods, Academic Foyer).
                  Verify the physical item before showing or entering the 6-digit OTP to earn +15 Karma tokens.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs">
                <span className="text-gray-500">Seller: <strong>{detailItem.sellerName}</strong></span>
                <span className="text-[#0A9396] font-bold">✓ Verified Student</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setDetailItem(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-[#334155] text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => handleInitiateExchange(detailItem)}
                disabled={initiatingId === detailItem._id || detailItem.status !== 'active'}
                className="flex-2 py-3 bg-[#005F73] hover:bg-[#0A9396] text-white text-xs font-black rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {initiatingId === detailItem._id ? (
                  'Initiating Handshake...'
                ) : detailItem.status === 'sold' ? (
                  'Item Sold'
                ) : (
                  '🤝 Initiate Handshake & Meet'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Listing Modal ──────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-xl font-black text-[#005F73]">List Academic Item</h2>
                <p className="text-xs text-gray-400">Earn +5 Karma for every gear item you list</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Engineering Mechanics (AKTU) 2nd Year"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#005F73] bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm outline-none focus:border-[#005F73] bg-gray-50"
                  >
                    <option value="textbook">Textbook</option>
                    <option value="lab_coat">Lab Coat</option>
                    <option value="tool">Drafting / Tool</option>
                    <option value="electronics">Electronics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Price (₹ or Karma) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 250"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#005F73] bg-gray-50"
                  />
                </div>
              </div>

              {/* Product Image Section */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <label className="block text-xs font-black text-[#005F73] uppercase tracking-wider">
                  📷 Product Image *
                </label>

                {/* Upload or URL options */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image URL (or upload below)..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#005F73]"
                    />
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="px-2.5 py-1 text-xs text-red-500 font-bold hover:bg-red-50 rounded-lg"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-[#334155] hover:bg-gray-100 cursor-pointer shadow-2xs">
                      📁 Upload Photo from Device
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-gray-400">or pick quick preset:</span>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex gap-1.5 flex-wrap">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                          imageUrl === preset.url
                            ? 'bg-[#005F73] text-white border-[#005F73]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#005F73]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Image Preview */}
                  {imageUrl && (
                    <div className="mt-2 relative h-32 w-full rounded-xl overflow-hidden border border-gray-200 bg-white">
                      <img src={imageUrl} alt="Product Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-md">
                        ✓ Image Attached
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Condition Selection */}
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Condition of the Product *
                </label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm outline-none focus:border-[#005F73] bg-gray-50"
                >
                  <option value="Brand New">Brand New / Sealed (Never used)</option>
                  <option value="Like New">Like New (Flawless, no marks or creases)</option>
                  <option value="Gently Used">Gently Used (Minor pencil notes or light cover wear)</option>
                  <option value="Good">Good (Functional, normal semester wear)</option>
                  <option value="Fair">Fair (Highlighted/annotated, complete pages)</option>
                  <option value="Heavily Used">Heavily Used (Functional with substantial wear)</option>
                </select>
              </div>

              {/* How the product is - Detail description */}
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Tell how the product is (Specific details & notes) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. AKTU 2024 revised syllabus edition. No torn pages, pen markings only on Unit 2 formulas. Includes solved sample papers."
                  value={newConditionNotes}
                  onChange={(e) => setNewConditionNotes(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-[#005F73] bg-gray-50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  General Overview & Meetup Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Available for meetup at campus library pods or computer labs..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-[#005F73] bg-gray-50 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#005F73] hover:bg-[#0A9396] text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Listing (+5 Karma)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
