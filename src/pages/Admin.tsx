import { useState, useEffect, useRef } from 'react';
import {
  Lock,
  LogOut,
  Store,
  Users,
  IndianRupee,
  Package,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  FileSpreadsheet,
  Image as ImageIcon,
  Upload,
  Plus,
  Calendar,
  Check,
  Star,
  Folder,
  Utensils,
  BookOpen,
  Home as HomeIcon,
} from 'lucide-react';
import { login, logout, getAuthUser, checkLockout, type AuthUser } from '@/lib/auth';
import {
  useProducts,
  useStoreStatus,
  useFeedbackList,
  useGallery,
  updateStoreStatus,
  updateProduct,
  deleteFeedback,
  toggleApproveFeedback,
  addGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from '@/lib/hooks';
import { getGoogleSheetUrl, setGoogleSheetUrl } from '@/lib/googleSheets';
import { CROWD_META, type CrowdLevel, formatTime, getISTDate } from '@/lib/constants';
import { GALLERY_CATEGORIES } from '@/lib/galleryData';
import type { Page } from '@/components/Navbar';
import type { GalleryImage, GalleryCategory } from '@/lib/types';
import StarRating from '@/components/StarRating';

type Props = {
  onNavigate: (page: Page) => void;
};

export default function Admin({ onNavigate }: Props) {
  const [user, setUser] = useState<AuthUser | null>(getAuthUser());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Tab State
  const [activeTab, setActiveTab] = useState<'status' | 'products' | 'gallery' | 'feedback'>('status');

  // Status management state
  const { data: storeStatus, computed: storeComputed } = useStoreStatus();
  const [isOpen, setIsOpen] = useState(true);
  const [crowd, setCrowd] = useState<CrowdLevel>('Moderate');
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Products management state
  const { data: products } = useProducts();
  const [productForms, setProductForms] = useState<
    Record<string, { price: number; available: boolean; stock: number; description: string }>
  >({});
  const [productSaving, setProductSaving] = useState<Record<string, boolean>>({});
  const [productMessages, setProductMessages] = useState<Record<string, string>>({});

  // Gallery management state
  const { data: galleryImages, loading: loadingGallery, refetch: refetchGallery } = useGallery();
  const [uploadCategory, setUploadCategory] = useState<GalleryImage['category']>('customers');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [galleryFilterFolder, setGalleryFilterFolder] = useState<GalleryCategory>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);

  // Google Sheets state
  const [sheetUrl, setSheetUrl] = useState(getGoogleSheetUrl());
  const [sheetUrlSaved, setSheetUrlSaved] = useState(false);

  // Feedback & Reviews state
  const { data: feedbackList, loading: loadingFeedback, refetch: refetchFeedback } = useFeedbackList();
  const [feedbackActionMsg, setFeedbackActionMsg] = useState('');

  // Sync store status state
  useEffect(() => {
    if (storeStatus) {
      setIsOpen(storeStatus.is_open);
      setCrowd((storeStatus.crowd_level as CrowdLevel) || 'Moderate');
    }
  }, [storeStatus]);

  // Sync products form state
  useEffect(() => {
    if (products && products.length > 0) {
      const initial: Record<string, { price: number; available: boolean; stock: number; description: string }> = {};
      products.forEach((p) => {
        initial[p.id] = {
          price: p.price,
          available: p.available,
          stock: p.stock ?? 0,
          description: p.description,
        };
      });
      setProductForms(initial);
    }
  }, [products]);

  // Check rate limit timer
  useEffect(() => {
    const lock = checkLockout();
    if (lock.isLocked) {
      setLockoutSeconds(lock.remainingSeconds);
    }
  }, []);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setLoginError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Listen for auth state changes
  useEffect(() => {
    const checkAuth = () => {
      setUser(getAuthUser());
    };
    window.addEventListener('pk_auth_state_changed', checkAuth);
    return () => window.removeEventListener('pk_auth_state_changed', checkAuth);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setIsLoggingIn(true);
    setLoginError('');

    const res = await login(email, password);
    if (res.success && res.user) {
      setUser(res.user);
      setLoginError('');
    } else {
      setLoginError(res.error ?? 'Invalid email address or password.');
      if (res.remainingSeconds) {
        setLockoutSeconds(res.remainingSeconds);
      }
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  // 1. Store Status Actions
  const handleSaveStatus = async (forcedOpen?: boolean) => {
    setStatusSaving(true);
    setStatusMessage('');

    const targetOpen = forcedOpen !== undefined ? forcedOpen : isOpen;
    const res = await updateStoreStatus({
      is_open: targetOpen,
      crowd_level: crowd,
      closed_for_date: null,
    });

    if (res.success) {
      setIsOpen(targetOpen);
      setStatusMessage('Store status published live in real time!');
      setTimeout(() => setStatusMessage(''), 4000);
    }
    setStatusSaving(false);
  };

  const handleCloseShopForToday = async () => {
    if (
      !confirm(
        'Are you sure you want to close the shop for today? It will automatically reopen tomorrow according to the normal schedule (7:00 PM IST).'
      )
    ) {
      return;
    }

    setStatusSaving(true);
    setStatusMessage('');

    const ist = getISTDate();
    const res = await updateStoreStatus({
      is_open: false,
      crowd_level: 'Low',
      closed_for_date: ist.dateString,
    });

    if (res.success) {
      setIsOpen(false);
      setStatusMessage(
        `Shop closed for today (${ist.dateString}). The system will automatically reset tomorrow at 7:00 PM IST.`
      );
      setTimeout(() => setStatusMessage(''), 5000);
    }
    setStatusSaving(false);
  };

  // 2. Product Save Action
  const handleSaveProduct = async (productId: string) => {
    const form = productForms[productId];
    if (!form) return;

    setProductSaving((prev) => ({ ...prev, [productId]: true }));
    setProductMessages((prev) => ({ ...prev, [productId]: '' }));

    const res = await updateProduct(productId, {
      price: Number(form.price),
      available: form.available,
      stock: Number(form.stock),
      description: form.description,
    });

    if (res.success) {
      setProductMessages((prev) => ({ ...prev, [productId]: 'Price & stock updated live!' }));
      setTimeout(() => {
        setProductMessages((prev) => ({ ...prev, [productId]: '' }));
      }, 3500);
    }

    setProductSaving((prev) => ({ ...prev, [productId]: false }));
  };

  // 3. Gallery File Validation & Upload Actions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setUploadSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a JPEG, PNG, WebP, or AVIF image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('File is too large. Maximum allowed image size is 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setPreviewDataUrl(loadEvt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewDataUrl) {
      setUploadError('Please select a photo from your device to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const categoryObj = GALLERY_CATEGORIES.find((c) => c.id === uploadCategory);
    const sectionName = categoryObj ? categoryObj.label : uploadCategory;

    const res = await addGalleryImage({
      src: previewDataUrl,
      alt: uploadAlt || uploadCaption || `${sectionName} photo - Paras Kachoriwala`,
      category: uploadCategory,
      caption: uploadCaption || `${sectionName} photo`,
    });

    if (res.success) {
      setUploadSuccess(`Photo uploaded successfully to "${sectionName}" folder!`);
      setPreviewDataUrl(null);
      setUploadCaption('');
      setUploadAlt('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      refetchGallery();
      setTimeout(() => setUploadSuccess(''), 4500);
    } else {
      setUploadError(res.error ?? 'Failed to upload photo.');
    }
    setIsUploading(false);
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo from the website gallery?')) return;
    await deleteGalleryImage(id);
    refetchGallery();
  };

  const handleTriggerReplace = (id: string) => {
    setReplacingId(id);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file format. Please choose a JPEG, PNG, or WebP photo.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo is too large (max 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      await updateGalleryImage(replacingId, { src: dataUrl });
      refetchGallery();
      setReplacingId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleChangeImageCategory = async (id: string, newCategory: GalleryImage['category']) => {
    await updateGalleryImage(id, { category: newCategory });
    refetchGallery();
  };

  // 4. Feedback & Reviews Actions
  const handleToggleApprove = async (id: string, currentApproved: boolean) => {
    const res = await toggleApproveFeedback(id, !currentApproved);
    if (res.success) {
      setFeedbackActionMsg(
        !currentApproved
          ? 'Review is now FEATURED live on the website homepage!'
          : 'Review removed from homepage display.'
      );
      refetchFeedback();
      setTimeout(() => setFeedbackActionMsg(''), 3500);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review?')) return;
    await deleteFeedback(id);
    refetchFeedback();
  };

  const handleSaveSheetUrl = () => {
    setGoogleSheetUrl(sheetUrl);
    setSheetUrlSaved(true);
    setTimeout(() => setSheetUrlSaved(false), 3500);
  };

  // ----------------------------------------------------
  // RENDER: LOGIN FORM
  // ----------------------------------------------------
  if (!user) {
    return (
      <div className="pt-24 sm:pt-28 pb-16 min-h-[85vh] flex items-center justify-center container-max">
        <div className="card max-w-md w-full p-8 sm:p-10 shadow-warm animate-scale-in">
          <div className="text-center">
            <span className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-gradient-to-br from-spice-500 to-spice-700 text-white shadow-warm">
              <Lock size={28} />
            </span>
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-spice-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-spice-700">
              <ShieldCheck size={14} />
              Author Access Portal
            </div>
            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-charcoal-900">
              Author / Owner Sign-In
            </h1>
            <p className="mt-2 text-sm text-charcoal-600">
              Sign in with your authorized author email to manage store status, gallery photos, and reviews.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5" noValidate>
            {loginError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-medium text-red-700 flex items-start gap-2 animate-shake">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {lockoutSeconds > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs font-medium text-amber-800 flex items-center gap-2">
                <Clock size={16} className="shrink-0" />
                <span>Security cooldown active. Retry in {lockoutSeconds} seconds.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Author Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-spice-200 bg-spice-50/50 px-4 py-3 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-spice-500 focus:bg-white transition-colors"
                autoComplete="email"
                disabled={lockoutSeconds > 0}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-spice-200 bg-spice-50/50 px-4 py-3 pr-11 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-spice-500 focus:bg-white transition-colors"
                  autoComplete="current-password"
                  disabled={lockoutSeconds > 0}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || lockoutSeconds > 0}
              className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2 shadow-warm disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Verifying Security...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Login to Author Dashboard
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="btn-outline w-full py-2.5 text-xs text-charcoal-600 border-charcoal-200 hover:bg-charcoal-50"
            >
              ← Back to Main Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: AUTHOR CONTROL PANEL
  // ----------------------------------------------------
  const istDate = getISTDate();
  const isClosedForToday = storeStatus?.closed_for_date === istDate.dateString;

  // Folder helper list for gallery
  const folderCategories = [
    { id: 'customers', label: 'Customers / Community Section', icon: <Users size={16} />, desc: 'Happy customers & foodies' },
    { id: 'food', label: 'Food / Menu Section', icon: <Utensils size={16} />, desc: 'Kachori, Bhel & delicious ingredients' },
    { id: 'shop', label: 'Shop / Stall Location', icon: <Store size={16} />, desc: 'Food cart, night stall & setup' },
    { id: 'home', label: 'Home Page Featured Preview', icon: <HomeIcon size={16} />, desc: 'Featured hero showcase on homepage' },
    { id: 'about', label: 'About / Story Section', icon: <BookOpen size={16} />, desc: 'Heritage and story of Paras Kachoriwala' },
  ] as const;

  const filteredGallery = (galleryImages ?? []).filter((img) =>
    galleryFilterFolder === 'all' ? true : img.category === galleryFilterFolder
  );

  return (
    <div className="pt-20 sm:pt-24 pb-20 bg-spice-50/40 min-h-screen">
      {/* Hidden input for replacing image */}
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceFile}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
      />

      <div className="container-max py-8">
        {/* Author Header Bar */}
        <div className="card p-6 sm:p-8 bg-charcoal-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-warm">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-500/20 border border-leaf-500/40 px-3 py-1 text-xs font-bold text-leaf-300">
                <ShieldCheck size={14} /> Author Verified
              </span>
              <span className="text-xs text-spice-200/70">
                Timezone: IST (UTC+5:30) • {istDate.dayName}, {istDate.dateString}
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold">Author Management Portal</h1>
            <p className="mt-1 text-sm text-spice-100/70">
              Welcome, <span className="font-semibold text-marigold-300">{user.name}</span> ({user.email})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="btn bg-white/10 text-white hover:bg-white/20 text-xs py-2.5 px-4 flex items-center gap-2 border border-white/20"
            >
              View Live Website
              <ArrowRight size={14} />
            </button>
            <button
              onClick={handleLogout}
              className="btn bg-red-500/20 text-red-200 hover:bg-red-500/30 text-xs py-2.5 px-4 flex items-center gap-1.5 border border-red-500/30"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-spice-200 pb-4">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'status'
                ? 'bg-spice-600 text-white shadow-warm'
                : 'bg-white text-charcoal-700 border border-spice-200 hover:bg-spice-50'
            }`}
          >
            <Store size={17} />
            Store Status & Schedule
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'products'
                ? 'bg-spice-600 text-white shadow-warm'
                : 'bg-white text-charcoal-700 border border-spice-200 hover:bg-spice-50'
            }`}
          >
            <Package size={17} />
            Menu Prices & Stock
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'gallery'
                ? 'bg-spice-600 text-white shadow-warm'
                : 'bg-white text-charcoal-700 border border-spice-200 hover:bg-spice-50'
            }`}
          >
            <ImageIcon size={17} />
            Gallery & Folders ({galleryImages?.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'feedback'
                ? 'bg-spice-600 text-white shadow-warm'
                : 'bg-white text-charcoal-700 border border-spice-200 hover:bg-spice-50'
            }`}
          >
            <MessageSquare size={17} />
            Customer Reviews ({feedbackList?.length ?? 0})
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: STORE STATUS & AUTOMATIC NEXT-DAY OPENING */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'status' && (
          <div className="mt-8 grid gap-8 lg:grid-cols-12 animate-fade-up">
            <div className="lg:col-span-8 card p-7 sm:p-9 space-y-7">
              <div>
                <h2 className="font-display text-2xl font-bold text-charcoal-900 flex items-center gap-2">
                  <Store size={24} className="text-spice-600" />
                  Store Operating Status & Automatic Next-Day Reopening
                </h2>
                <p className="mt-1 text-sm text-charcoal-600">
                  Control whether the stall is open, or choose "Close Shop for Today" to automatically reopen on the
                  next scheduled business day without needing manual reopening.
                </p>
              </div>

              {/* Closure Notice Banner */}
              {isClosedForToday && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                  <Calendar size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Shop is currently Closed for Today ({istDate.dateString})</p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      The shop will automatically follow the next day's regular schedule (7:00 PM – 11:30 PM IST). You
                      can also click "Open Shop Now / Resume" below at any time.
                    </p>
                  </div>
                </div>
              )}

              {/* Status Action Buttons */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* 1. Close Shop for Today */}
                <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 space-y-3">
                  <p className="font-bold text-base text-red-900">Close for Today Only</p>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Immediately closes the stall for the current business day and auto-reopens tomorrow at 7:00 PM IST.
                  </p>
                  <button
                    onClick={handleCloseShopForToday}
                    disabled={statusSaving || isClosedForToday}
                    className="btn bg-red-600 hover:bg-red-700 text-white text-xs py-2.5 px-4 w-full flex items-center justify-center gap-2 shadow-sm font-bold disabled:opacity-50"
                  >
                    <Calendar size={15} />
                    {isClosedForToday ? '✓ Closed For Today Active' : 'Close Shop for Today'}
                  </button>
                </div>

                {/* 2. Open / Regular Schedule Toggle */}
                <div className="p-5 rounded-2xl bg-leaf-50/70 border border-leaf-200 space-y-3">
                  <p className="font-bold text-base text-leaf-900">Live Operating Mode</p>
                  <p className="text-xs text-leaf-700 leading-relaxed">
                    Mark stall as active and open right now, or follow standard operating hours.
                  </p>
                  <button
                    onClick={() => handleSaveStatus(true)}
                    disabled={statusSaving}
                    className="btn bg-leaf-600 hover:bg-leaf-700 text-white text-xs py-2.5 px-4 w-full flex items-center justify-center gap-2 shadow-sm font-bold"
                  >
                    <CheckCircle2 size={15} />
                    Open Shop Now / Resume
                  </button>
                </div>
              </div>

              {/* Crowd Level Selector */}
              <div>
                <label className="block font-bold text-base text-charcoal-900 mb-2 flex items-center gap-2">
                  <Users size={18} className="text-spice-600" />
                  Live Crowd Level
                </label>
                <p className="text-xs text-charcoal-600 mb-4">
                  Select the current crowd level. (Note: crowd information is automatically hidden from customers when
                  the shop is marked closed).
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['Low', 'Moderate', 'Busy', 'Very Busy'] as CrowdLevel[]).map((level) => {
                    const meta = CROWD_META[level];
                    const isSelected = crowd === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setCrowd(level)}
                        className={`p-4 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'border-spice-600 bg-spice-50 ring-2 ring-spice-500/20 shadow-md font-bold'
                            : 'border-spice-200 bg-white hover:border-spice-300 font-medium text-charcoal-700'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 rounded-full ${meta.dot} mb-2`} />
                        <p className={`text-sm ${isSelected ? 'text-spice-800' : 'text-charcoal-800'}`}>{level}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {statusMessage && (
                <div className="p-4 rounded-2xl bg-leaf-50 border border-leaf-200 text-leaf-800 text-sm font-semibold flex items-center gap-2 animate-fade-up">
                  <CheckCircle2 size={18} className="text-leaf-600" />
                  {statusMessage}
                </div>
              )}

              <button
                onClick={() => handleSaveStatus()}
                disabled={statusSaving}
                className="btn-primary w-full sm:w-auto py-3 px-8 flex items-center justify-center gap-2 shadow-warm"
              >
                {statusSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                {statusSaving ? 'Publishing Live Changes...' : 'Save & Publish Live Status'}
              </button>
            </div>

            {/* Quick Live Preview */}
            <div className="lg:col-span-4 card p-6 bg-charcoal-900 text-white space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-marigold-400">
                Live Customer View Preview
              </h3>
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-spice-200">Shop Status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      storeComputed.isOpen ? 'bg-leaf-500 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    {storeComputed.isOpen ? 'Open Now' : storeComputed.statusLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-spice-200">Next Opening Schedule</span>
                  <span className="text-xs font-bold text-marigold-300">{storeComputed.nextOpenText}</span>
                </div>

                {storeComputed.isOpen && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-spice-200">Crowd Meter</span>
                    <span className={`text-sm font-bold ${CROWD_META[crowd]?.color ?? 'text-white'}`}>{crowd}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs text-spice-200">Operating Hours</span>
                  <span className="text-xs font-semibold text-white">7:00 PM – 11:30 PM IST</span>
                </div>
              </div>
              <p className="text-xs text-spice-100/60 leading-relaxed">
                When closed, live ordering and rush metrics are hidden so customers see clean opening schedules.
              </p>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: MENU PRICES & STOCK MANAGER */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="mt-8 space-y-8 animate-fade-up">
            <div>
              <h2 className="font-display text-2xl font-bold text-charcoal-900 flex items-center gap-2">
                <Package size={24} className="text-spice-600" />
                Real-Time Menu, Stock & Price Manager
              </h2>
              <p className="mt-1 text-sm text-charcoal-600">
                Change item prices, adjust current stock, toggle availability, and edit descriptions.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {(products ?? []).map((product) => {
                const form = productForms[product.id] ?? {
                  price: product.price,
                  available: product.available,
                  stock: product.stock ?? 0,
                  description: product.description,
                };
                const saving = productSaving[product.id];
                const msg = productMessages[product.id];

                return (
                  <div key={product.id} className="card p-7 sm:p-8 space-y-6 flex flex-col justify-between">
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-20 w-20 rounded-2xl object-cover border border-spice-100 shadow-md shrink-0"
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-2xl bg-spice-100/70 border border-spice-200 grid place-items-center text-spice-600 shrink-0 text-center p-1">
                            <Utensils size={24} />
                            <span className="text-[9px] font-bold text-spice-800 leading-tight">No Photo</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-display text-2xl font-bold text-charcoal-900">{product.name}</h3>
                            <span className="text-xs font-bold uppercase tracking-wider text-spice-600 bg-spice-100 px-2.5 py-1 rounded-full">
                              {product.slug}
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-500 mt-1">
                            {product.slug.includes('jain')
                              ? '🌿 Jain Friendly (No Onion / No Garlic)'
                              : product.slug.includes('swaminarayan')
                              ? '✨ Swaminarayan (Satvik Preparation)'
                              : 'Signature Food Item'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5 flex items-center gap-1">
                            <IndianRupee size={13} className="text-spice-600" /> Live Price (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-charcoal-400">
                              ₹
                            </span>
                            <input
                              type="number"
                              min={1}
                              value={form.price}
                              onChange={(e) =>
                                setProductForms((prev) => ({
                                  ...prev,
                                  [product.id]: { ...form, price: Number(e.target.value) },
                                }))
                              }
                              className="w-full rounded-xl border border-spice-200 bg-spice-50/50 pl-7 pr-3 py-2.5 text-base font-bold text-charcoal-900 focus:border-spice-500 focus:bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5 flex items-center gap-1">
                            <Package size={13} className="text-spice-600" /> Stock Units
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={form.stock}
                            onChange={(e) =>
                              setProductForms((prev) => ({
                                ...prev,
                                [product.id]: { ...form, stock: Number(e.target.value) },
                              }))
                            }
                            className="w-full rounded-xl border border-spice-200 bg-spice-50/50 px-3 py-2.5 text-base font-bold text-charcoal-900 focus:border-spice-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-spice-50/70 border border-spice-100">
                        <div>
                          <p className="text-xs font-bold text-charcoal-800 uppercase">Availability Status</p>
                          <p className="text-xs text-charcoal-500 mt-0.5">
                            {form.available ? 'Customers see Available' : 'Marked as Sold Out on menu'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setProductForms((prev) => ({
                              ...prev,
                              [product.id]: { ...form, available: !form.available },
                            }))
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                            form.available
                              ? 'bg-leaf-500 text-white hover:bg-leaf-600'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {form.available ? '✓ In Stock' : '✕ Sold Out'}
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={form.description}
                          onChange={(e) =>
                            setProductForms((prev) => ({
                              ...prev,
                              [product.id]: { ...form, description: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-spice-200 bg-spice-50/50 p-3 text-xs text-charcoal-900 focus:border-spice-500 focus:bg-white resize-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-spice-100 flex flex-col gap-3">
                      {msg && (
                        <p className="text-xs font-bold text-leaf-700 flex items-center gap-1.5 animate-fade-up">
                          <CheckCircle2 size={15} /> {msg}
                        </p>
                      )}
                      <button
                        onClick={() => handleSaveProduct(product.id)}
                        disabled={saving}
                        className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 shadow-warm"
                      >
                        {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Updating Live Price & Stock...' : `Save ${product.name} Details`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: GALLERY & FOLDER MANAGEMENT */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'gallery' && (
          <div className="mt-8 space-y-8 animate-fade-up">
            <div>
              <h2 className="font-display text-2xl font-bold text-charcoal-900 flex items-center gap-2">
                <ImageIcon size={24} className="text-spice-600" />
                Gallery & Website Section Folder Manager
              </h2>
              <p className="mt-1 text-sm text-charcoal-600">
                Upload photos directly into target folders like <strong>Customers</strong>, <strong>Food</strong>,{' '}
                <strong>Shop</strong>, <strong>Home Page</strong>, or <strong>About</strong>.
              </p>
            </div>

            {/* Upload Box with Visual Folder Chooser */}
            <div className="card p-7 sm:p-8 bg-gradient-to-br from-spice-500/10 via-spice-50 to-white border border-spice-300">
              <h3 className="font-display text-xl font-bold text-charcoal-900 flex items-center gap-2">
                <Upload size={20} className="text-spice-600" />
                Upload New Photo into a Website Folder
              </h3>

              <form onSubmit={handleUploadImage} className="mt-5 space-y-6">
                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
                {uploadSuccess && (
                  <div className="p-3 rounded-xl bg-leaf-50 border border-leaf-200 text-xs font-medium text-leaf-700 flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0" />
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                {/* 1. Step: Select Target Folder / Section */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-2 flex items-center gap-1.5">
                    <Folder size={14} className="text-spice-600" />
                    1. Select Destination Folder / Website Section:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {folderCategories.map((folder) => {
                      const isSelected = uploadCategory === folder.id;
                      return (
                        <button
                          key={folder.id}
                          type="button"
                          onClick={() => setUploadCategory(folder.id)}
                          className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                            isSelected
                              ? 'border-spice-600 bg-white ring-2 ring-spice-500 shadow-md'
                              : 'border-spice-200 bg-white/70 hover:bg-white hover:border-spice-300'
                          }`}
                        >
                          <span
                            className={`p-2 rounded-xl shrink-0 ${
                              isSelected ? 'bg-spice-600 text-white' : 'bg-spice-100 text-spice-700'
                            }`}
                          >
                            {folder.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className={`text-xs font-bold ${isSelected ? 'text-spice-800' : 'text-charcoal-900'}`}>
                                {folder.label}
                              </p>
                              {isSelected && <Check size={14} className="text-spice-600 shrink-0 ml-1" />}
                            </div>
                            <p className="text-[11px] text-charcoal-500 mt-0.5">{folder.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Step: Choose File & Enter Caption */}
                <div className="grid gap-5 md:grid-cols-12 pt-2 border-t border-spice-200">
                  {/* File Picker & Preview */}
                  <div className="md:col-span-5 flex flex-col justify-center">
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                      2. Choose Image File
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="block w-full text-xs text-charcoal-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-spice-600 file:text-white hover:file:bg-spice-700 cursor-pointer"
                    />
                    <p className="text-[11px] text-charcoal-500 mt-1.5">
                      Allowed: JPEG, PNG, WebP, AVIF • Max size: 5MB
                    </p>

                    {previewDataUrl && (
                      <div className="mt-3 relative rounded-xl overflow-hidden border border-spice-200 aspect-[4/3] bg-charcoal-950 max-w-[220px]">
                        <img src={previewDataUrl} alt="Preview" className="h-full w-full object-cover" />
                        <span className="absolute bottom-1 left-1 right-1 bg-charcoal-950/80 text-white text-[10px] py-0.5 text-center rounded">
                          Upload Preview
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Caption & Alt */}
                  <div className="md:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                        3. Photo Caption / Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                        placeholder="e.g. Regular customers enjoying hot Kachori"
                        className="w-full rounded-xl border border-spice-200 bg-white px-3.5 py-2.5 text-sm text-charcoal-900 focus:border-spice-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                        4. Accessibility Description (Alt text)
                      </label>
                      <input
                        type="text"
                        value={uploadAlt}
                        onChange={(e) => setUploadAlt(e.target.value)}
                        placeholder="e.g. Customers smiling with plates at the stall"
                        className="w-full rounded-xl border border-spice-200 bg-white px-3.5 py-2.5 text-sm text-charcoal-900 focus:border-spice-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUploading || !previewDataUrl}
                    className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 shadow-warm disabled:opacity-50"
                  >
                    {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                    {isUploading
                      ? 'Uploading Photo...'
                      : `Save & Publish to ${folderCategories.find((f) => f.id === uploadCategory)?.label}`}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Gallery Photos List with Folder Filtering */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-xl font-bold text-charcoal-900">
                    Uploaded Photos ({filteredGallery.length})
                  </h3>

                  {/* Folder filter */}
                  <select
                    value={galleryFilterFolder}
                    onChange={(e) => setGalleryFilterFolder(e.target.value as GalleryCategory)}
                    className="rounded-xl border border-spice-200 bg-white px-3 py-1.5 text-xs font-bold text-charcoal-800"
                  >
                    <option value="all">📁 All Folders ({galleryImages?.length ?? 0})</option>
                    <option value="customers">
                      👥 Customers ({galleryImages?.filter((g) => g.category === 'customers').length ?? 0})
                    </option>
                    <option value="food">
                      🍽️ Food / Menu ({galleryImages?.filter((g) => g.category === 'food').length ?? 0})
                    </option>
                    <option value="shop">
                      🛒 Shop / Cart ({galleryImages?.filter((g) => g.category === 'shop').length ?? 0})
                    </option>
                    <option value="home">
                      🏠 Home Page ({galleryImages?.filter((g) => g.category === 'home').length ?? 0})
                    </option>
                    <option value="about">
                      📖 About ({galleryImages?.filter((g) => g.category === 'about').length ?? 0})
                    </option>
                  </select>
                </div>

                <button
                  onClick={refetchGallery}
                  className="btn-outline text-xs py-2 px-3 self-start sm:self-auto flex items-center gap-1.5"
                >
                  <RefreshCw size={13} className={loadingGallery ? 'animate-spin' : ''} />
                  Refresh Photos
                </button>
              </div>

              {loadingGallery ? (
                <div className="card p-12 text-center">
                  <RefreshCw size={24} className="animate-spin mx-auto text-spice-600" />
                  <p className="mt-3 text-sm text-charcoal-600">Loading gallery photos...</p>
                </div>
              ) : filteredGallery.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredGallery.map((img) => (
                    <div key={img.id} className="card p-4 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-charcoal-950">
                          <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
                          <span className="absolute top-2 left-2 rounded-full bg-charcoal-900/85 backdrop-blur-md text-marigold-300 text-[10px] font-bold uppercase px-2.5 py-0.5 border border-white/20">
                            {img.category === 'customers' ? '👥 Customers' : img.category}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-charcoal-900 mt-3 truncate">{img.caption || img.alt}</p>
                        <p className="text-[11px] text-charcoal-400 mt-0.5">
                          Uploaded: {img.created_at ? new Date(img.created_at).toLocaleDateString() : 'Active'}
                        </p>
                      </div>

                      {/* Move Category / Action Buttons */}
                      <div className="pt-2 border-t border-spice-100 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="text-[11px] text-charcoal-500 font-semibold">Folder:</span>
                          <select
                            value={img.category}
                            onChange={(e) =>
                              handleChangeImageCategory(img.id, e.target.value as GalleryImage['category'])
                            }
                            className="text-xs bg-spice-50 border border-spice-200 rounded-lg px-2 py-1 text-charcoal-800 font-semibold"
                          >
                            <option value="customers">👥 Customers</option>
                            <option value="food">🍽️ Food / Menu</option>
                            <option value="shop">🛒 Shop / Cart</option>
                            <option value="home">🏠 Home Page</option>
                            <option value="about">📖 About Story</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-spice-50">
                          <button
                            onClick={() => handleTriggerReplace(img.id)}
                            className="btn-outline text-[11px] py-1.5 px-2.5 text-charcoal-700 flex items-center gap-1"
                          >
                            <Upload size={12} /> Replace Photo
                          </button>
                          <button
                            onClick={() => handleDeleteGalleryImage(img.id)}
                            className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold p-1"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center max-w-md mx-auto">
                  <ImageIcon size={36} className="mx-auto text-spice-300" />
                  <h3 className="mt-4 font-display text-lg font-bold text-charcoal-900">No Photos in this Folder</h3>
                  <p className="mt-1 text-sm text-charcoal-600">
                    Upload a photo and assign it to this section above.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: CUSTOMER REVIEWS & FEEDBACK */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'feedback' && (
          <div className="mt-8 space-y-8 animate-fade-up">
            {/* Google Sheets Integration Box */}
            <div className="card p-6 sm:p-7 bg-gradient-to-br from-leaf-500/10 via-spice-50 to-white border border-leaf-500/30 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-leaf-600 text-white shadow-md shrink-0">
                    <FileSpreadsheet size={20} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-charcoal-900 flex items-center gap-2">
                      Live Google Sheets Auto-Sync
                    </h3>
                    <p className="text-xs text-charcoal-600">
                      Forward every new customer rating and review directly into your Google Sheet in real time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="Paste Google Apps Script URL here"
                  className="flex-1 rounded-xl border border-spice-200 bg-white px-4 py-2.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500"
                />
                <button
                  onClick={handleSaveSheetUrl}
                  className="btn bg-leaf-600 hover:bg-leaf-700 text-white text-xs py-2.5 px-5 flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                >
                  <Save size={14} />
                  Save Google Sheet Link
                </button>
              </div>

              {sheetUrlSaved && (
                <p className="text-xs font-bold text-leaf-700 flex items-center gap-1.5 animate-fade-up">
                  <CheckCircle2 size={14} /> Google Sheet webhook saved!
                </p>
              )}
            </div>

            {/* Header with Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-charcoal-900 flex items-center gap-2">
                  <MessageSquare size={24} className="text-spice-600" />
                  Customer Reviews & Feedback Submissions
                </h2>
                <p className="mt-1 text-sm text-charcoal-600">
                  Real feedback stored in your database. Click "Feature on Homepage" to display selected reviews on the
                  main site.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('home')}
                  className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
                >
                  View Website Reviews ↗
                </button>
                <button
                  onClick={refetchFeedback}
                  className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
                >
                  <RefreshCw size={14} className={loadingFeedback ? 'animate-spin' : ''} />
                  Refresh Reviews
                </button>
              </div>
            </div>

            {feedbackActionMsg && (
              <div className="p-3 rounded-xl bg-leaf-50 border border-leaf-200 text-xs font-bold text-leaf-800 flex items-center gap-2 animate-fade-up">
                <CheckCircle2 size={15} className="text-leaf-600" />
                <span>{feedbackActionMsg}</span>
              </div>
            )}

            {loadingFeedback ? (
              <div className="card p-12 text-center">
                <RefreshCw size={24} className="animate-spin mx-auto text-spice-600" />
                <p className="mt-3 text-sm text-charcoal-600">Loading real customer feedback...</p>
              </div>
            ) : feedbackList && feedbackList.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {feedbackList.map((f) => (
                  <div
                    key={f.id}
                    className={`card p-6 flex flex-col justify-between space-y-4 border transition-all ${
                      f.approved ? 'border-leaf-400 bg-leaf-50/20 shadow-sm' : 'border-spice-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-base text-charcoal-900">
                              {f.customer_name || 'Anonymous Customer'}
                            </p>
                            {f.approved && (
                              <span className="inline-flex items-center gap-1 bg-leaf-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <Star size={10} className="fill-white" /> Featured on Homepage
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-charcoal-400 mt-0.5">
                            {f.created_at ? formatTime(new Date(f.created_at)) : 'Recent'}
                          </p>
                        </div>
                        <StarRating value={f.overall_rating} size={16} />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {f.food_rating ? (
                          <span className="bg-spice-100 text-spice-800 px-2 py-0.5 rounded-md font-medium">
                            Food: {f.food_rating}★
                          </span>
                        ) : null}
                        {f.service_rating ? (
                          <span className="bg-spice-100 text-spice-800 px-2 py-0.5 rounded-md font-medium">
                            Service: {f.service_rating}★
                          </span>
                        ) : null}
                        {f.cleanliness_rating ? (
                          <span className="bg-spice-100 text-spice-800 px-2 py-0.5 rounded-md font-medium">
                            Cleanliness: {f.cleanliness_rating}★
                          </span>
                        ) : null}
                      </div>

                      {f.message && (
                        <p className="mt-3 text-sm text-charcoal-700 italic bg-spice-50/60 p-3 rounded-xl border border-spice-100">
                          "{f.message}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-spice-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleToggleApprove(f.id, f.approved)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                          f.approved
                            ? 'bg-leaf-100 border-leaf-300 text-leaf-800 hover:bg-leaf-200'
                            : 'bg-spice-100 border-spice-300 text-spice-800 hover:bg-spice-200'
                        }`}
                      >
                        <Check size={14} />
                        {f.approved ? 'Featured (Click to Unfeature)' : 'Feature on Homepage'}
                      </button>

                      <button
                        onClick={() => handleDeleteFeedback(f.id)}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold p-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center max-w-md mx-auto">
                <MessageSquare size={36} className="mx-auto text-spice-300" />
                <h3 className="mt-4 font-display text-lg font-bold text-charcoal-900">No Feedback Yet</h3>
                <p className="mt-1 text-sm text-charcoal-600">
                  New customer submissions from the website will appear here in real time.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
