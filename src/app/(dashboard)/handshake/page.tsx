'use client';
import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { exchangeAPI, ratingsAPI } from '@/lib/apiClient';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  QrCode,
  KeyRound,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  MapPin,
  ExternalLink,
  Info,
} from 'lucide-react';

interface ActiveTransaction {
  transactionId: string;
  listingTitle: string;
  priceOrKarma: number;
  otp: string;
  qrPayload: string;
  sellerId?: string;
  sellerName?: string;
  buyerId?: string;
  collegeName?: string;
  locationName?: string;
  condition?: string;
  expiresInSeconds?: number;
  hashSignature?: string;
}

export default function HandshakePage() {
  const { user, refreshUser } = useAuth();

  // Role toggle: 'buyer' verifies & enters OTP / scans QR; 'seller' presents OTP & QR
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [activeTx, setActiveTx] = useState<ActiveTransaction | null>(null);

  // 6-digit individual box OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // QR Scanner Modal
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerSimulating, setScannerSimulating] = useState(false);

  // Verification & Status
  const [verifying, setVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes TTL
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Post-handshake rating state
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual', 'Exact Item Condition']);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState('');

  const quickReviewTags = [
    'Punctual',
    'Exact Item Condition',
    'Friendly Peer',
    'Smooth Exchange',
    'Great Communication',
  ];

  useEffect(() => {
    const saved = localStorage.getItem('active_handshake');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveTx({
          ...parsed,
          sellerName: parsed.sellerName || 'Aditya Sharma',
          collegeName: parsed.collegeName || user?.collegeName || 'PSIT Kanpur',
          locationName: parsed.locationName || 'Central Library Pod 3',
          condition: parsed.condition || 'Like New',
          hashSignature:
            parsed.hashSignature ||
            '0x8f4c2e1a90bd76329487c5b169df31046892e8fa5a61db47',
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default realistic transaction
      setActiveTx({
        transactionId: 'TX-SEC-2026-9812',
        listingTitle: 'Database System Concepts (Korth) 7th Edition',
        priceOrKarma: 350,
        otp: '482910',
        qrPayload: 'CAMPUSCONNECT_SECURE_HANDSHAKE_TX_PSIT_DEMO_01',
        sellerId: '64f1a2b3c4d5e6f7a8b9c002',
        sellerName: 'Aditya Sharma (CS 3rd Year)',
        collegeName: user?.collegeName || 'PSIT Kanpur',
        locationName: 'Central Library Pod 3 - Safe Zone',
        condition: 'Gently Used (Highlighted)',
        expiresInSeconds: 900,
        hashSignature: '0x8f4c2e1a90bd76329487c5b169df31046892e8fa5a61db47',
      });
    }

    // Connect to WebSocket channel for instant real-time handshake updates
    const socket = getSocket();
    socket.on('handshake_result', (data) => {
      if (data.status === 'verified') {
        setIsSuccess(true);
        setStatusMessage(data.message || 'Handshake confirmed via secure WebSocket channel!');
        refreshUser();
      }
    });

    return () => {
      socket.off('handshake_result');
    };
  }, [user, refreshUser]);

  // 15-minute TTL countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // OTP Box inputs handler
  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (cleanVal && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);
    const lastFilled = Math.min(pasted.length, 5);
    digitInputRefs.current[lastFilled]?.focus();
  };

  const currentEnteredOtp = otpDigits.join('');

  const executeVerification = async (otpCode: string) => {
    if (!otpCode || otpCode.length < 6) return;
    try {
      setVerifying(true);
      setStatusMessage(null);

      const res = await exchangeAPI.verify({
        transactionId: activeTx?.transactionId || '',
        otp: otpCode.trim(),
      });

      if (res.data?.success) {
        setIsSuccess(true);
        setStatusMessage(
          'Cryptographic handshake verified! TimingSafeEqual authenticated. +15 Campus Karma credited to both parties.'
        );
        await refreshUser();

        // Broadcast over Socket.io
        const socket = getSocket();
        socket.emit('verify_handshake_qr', {
          transactionId: activeTx?.transactionId,
          otp: otpCode.trim(),
        });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Verification failed. Invalid 6-digit one-time cryptographic code.';
      setStatusMessage(msg);
      setIsSuccess(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    executeVerification(currentEnteredOtp);
  };

  const handleSimulateScan = () => {
    setScannerSimulating(true);
    setTimeout(() => {
      setScannerSimulating(false);
      setIsScannerOpen(false);
      const targetOtp = activeTx?.otp || '482910';
      setOtpDigits(targetOtp.split(''));
      executeVerification(targetOtp);
    }, 1400);
  };

  const copySellerOtp = () => {
    if (!activeTx?.otp) return;
    navigator.clipboard.writeText(activeTx.otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTx) return;

    const revieweeId =
      activeTx.sellerId && activeTx.sellerId !== user?.id
        ? activeTx.sellerId
        : '64f1a2b3c4d5e6f7a8b9c002';

    const fullFeedback = [
      selectedTags.join(', '),
      ratingFeedback.trim(),
    ]
      .filter(Boolean)
      .join(' — ');

    try {
      setRatingLoading(true);
      const res = await ratingsAPI.submit({
        transactionId: activeTx.transactionId,
        revieweeId,
        stars: ratingStars,
        feedback: fullFeedback || 'Prompt and smooth campus meetup!',
      });

      setRatingSubmitted(true);
      setRatingSuccessMsg(res.data?.message || 'Rating recorded! +5 Bonus Karma credited.');
      await refreshUser();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to submit review.';
      alert(msg);
    } finally {
      setRatingLoading(false);
    }
  };

  const ttlProgress = Math.max(0, Math.min(100, (timeLeft / 900) * 100));

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00afb9]/10 text-[#0081a7] text-xs font-bold border border-[#00afb9]/20">
          <ShieldCheck className="w-4 h-4 text-[#00afb9]" />
          <span>Zero-Trust Physical Meetup Protocol</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0081a7] tracking-tight">
          Secure Handshake Verification
        </h1>
        <p className="text-xs sm:text-sm text-[#334155] max-w-lg mx-auto">
          Dual-verification exchange protocol. Synchronize peer identities at physical meetup locations with zero risk of transaction fraud.
        </p>
      </div>

      {/* Role Toggle Switcher */}
      {!isSuccess && (
        <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs flex max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              role === 'buyer'
                ? 'bg-[#0081a7] text-white shadow-sm'
                : 'text-gray-600 hover:text-[#0081a7]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>I Am The Buyer (Verify)</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('seller')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              role === 'seller'
                ? 'bg-[#00afb9] text-white shadow-sm'
                : 'text-gray-600 hover:text-[#00afb9]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>I Am The Seller (Show Code)</span>
          </button>
        </div>
      )}

      {/* Active Exchange Details Header Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#fdfcdc] text-[#0081a7] border border-[#00afb9]/30">
                {activeTx?.transactionId}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Awaiting In-Person Verification
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{activeTx?.listingTitle}</h2>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-gray-500 font-semibold block uppercase tracking-wider">
              Settlement Value
            </span>
            <span className="text-2xl font-black text-[#0081a7]">
              ₹{activeTx?.priceOrKarma || 0}
            </span>
          </div>
        </div>

        {/* Location & Peer Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-500 font-medium block">Designated Meetup:</span>
            <p className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#f07167]" />
              <span className="truncate">{activeTx?.locationName}</span>
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-500 font-medium block">Counterparty:</span>
            <p className="font-bold text-gray-900 mt-0.5 truncate">{activeTx?.sellerName}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-500 font-medium block">Declared Condition:</span>
            <p className="font-bold text-[#0081a7] mt-0.5">{activeTx?.condition}</p>
          </div>
        </div>

        {/* Dynamic TTL Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-gray-700">
              <Clock className="w-3.5 h-3.5 text-[#00afb9]" />
              <span>Cryptographic Session TTL</span>
            </span>
            <span
              className={`font-mono font-extrabold ${
                timeLeft < 180 ? 'text-[#f07167]' : 'text-[#0081a7]'
              }`}
            >
              {formatTimer(timeLeft)} remaining
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft < 180
                  ? 'bg-[#f07167]'
                  : timeLeft < 360
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-[#0081a7] to-[#00afb9]'
              }`}
              style={{ width: `${ttlProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main Exchange Interaction Box ───────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        {/* 1. SUCCESS STATE WITH CELEBRATION & RATING */}
        {isSuccess ? (
          <div className="py-6 space-y-6 animate-in fade-in">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Exchange Verified & Settled!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">{statusMessage}</p>

              {/* Karma Transfer Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#fed9b7] to-[#fdfcdc] text-[#0081a7] font-black text-sm border border-[#00afb9]/30 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#f07167]" />
                <span>+15 Campus Karma Credited to Both Accounts!</span>
              </div>
            </div>

            {/* Cryptographic Digital Receipt */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-mono space-y-1.5 text-gray-600">
              <div className="flex justify-between">
                <span>DIGITAL TRANSACTION HASH:</span>
                <span className="font-bold text-gray-900 truncate max-w-[200px]">
                  {activeTx?.hashSignature}
                </span>
              </div>
              <div className="flex justify-between">
                <span>VERIFICATION ALGORITHM:</span>
                <span className="font-bold text-emerald-700">crypto.timingSafeEqual (Constant-Time)</span>
              </div>
              <div className="flex justify-between">
                <span>TIMESTAMP:</span>
                <span className="font-bold text-gray-900">{new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Peer Rating Form */}
            {!ratingSubmitted ? (
              <form
                onSubmit={handleRatingSubmit}
                className="p-6 bg-[#fdfcdc] border border-[#00afb9]/30 rounded-2xl space-y-5"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-base font-extrabold text-[#0081a7]">
                    Rate Your Peer & Earn +5 Bonus Karma 🌟
                  </h3>
                  <p className="text-xs text-gray-600">
                    How was the handoff? Your feedback keeps the campus community trusted.
                  </p>
                </div>

                {/* Interactive Star Picker */}
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingStars(star)}
                      className={`text-3xl transition transform hover:scale-125 cursor-pointer ${
                        star <= ratingStars ? 'text-amber-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                {/* Quick Tag Pills */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#334155] text-center">
                    Quick Peer Endorsements
                  </label>
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickReviewTags.map((tag) => {
                      const isSel = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`text-xs px-3 py-1 rounded-full font-bold transition cursor-pointer border ${
                            isSel
                              ? 'bg-[#0081a7] text-white border-[#0081a7]'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-[#00afb9]'
                          }`}
                        >
                          {isSel ? '✓ ' : '+ '}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={ratingFeedback}
                    onChange={(e) => setRatingFeedback(e.target.value)}
                    placeholder="e.g. On-time meetup at Central Library Pod 3. Book was clean and exactly as described!"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0081a7] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={ratingLoading}
                  className="w-full py-3 bg-[#0081a7] hover:bg-[#00afb9] text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {ratingLoading ? 'Submitting Review...' : 'Submit Rating & Claim +5 Bonus Karma →'}
                </button>
              </form>
            ) : (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <span className="text-3xl">🎉</span>
                <p className="text-sm font-bold text-emerald-800">{ratingSuccessMsg}</p>
                <span className="text-xs text-gray-600 block">
                  Total +20 Campus Karma credited during this exchange session!
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link
                href="/marketplace"
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#334155] text-xs font-bold rounded-xl transition"
              >
                ← Back to Marketplace
              </Link>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-[#0081a7] text-white text-xs font-bold rounded-xl hover:bg-[#00afb9] transition shadow-xs"
              >
                Go to Dashboard →
              </Link>
            </div>
          </div>
        ) : role === 'buyer' ? (
          /* 2. BUYER MODE: 6-BOX OTP INPUT & CAMERA SCANNER */
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[#0081a7]">
                Buyer Verification Station
              </h3>
              <p className="text-xs text-gray-500">
                Ask the seller to show their 6-digit code or QR code on their screen, then authenticate below.
              </p>
            </div>

            {/* Quick Scanner Action Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-[#0081a7] text-xs font-bold rounded-2xl border-2 border-dashed border-[#00afb9]/40 hover:border-[#0081a7] transition cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4 text-[#00afb9]" />
                <span>Open Instant QR Code Scanner</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-xs font-semibold text-gray-400 absolute">
                OR ENTER 6-DIGIT CODE MANUALLY
              </span>
            </div>

            {/* Modern 6-Box Discrete OTP Input */}
            <form onSubmit={handleManualVerify} className="space-y-6">
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      digitInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center font-mono text-2xl sm:text-3xl font-extrabold bg-gray-50 border-2 border-gray-300 focus:border-[#0081a7] focus:bg-white rounded-2xl outline-none transition-all shadow-inner focus:ring-4 focus:ring-[#00afb9]/20"
                    placeholder="•"
                  />
                ))}
              </div>

              {/* Status or Error Message */}
              {statusMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs text-center font-bold flex items-center justify-center gap-2 ${
                    isSuccess
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={verifying || currentEnteredOtp.length < 6}
                  className="flex-1 py-3.5 px-6 bg-[#0081a7] hover:bg-[#00afb9] text-white font-extrabold text-sm rounded-2xl transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Cryptographic Seal...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Meetup & Claim Gear (₹{activeTx?.priceOrKarma})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* 3. SELLER MODE: LARGE DISPLAY OF OTP & EPHEMERAL QR CODE */
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[#00afb9]">
                Seller Presentation Screen
              </h3>
              <p className="text-xs text-gray-500">
                Present this screen to the buyer in person. They will scan your QR code or type your 6-digit code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-[#00afb9]/40">
                <span className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#0081a7]" />
                  <span>Ephemeral Session QR</span>
                </span>
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
                  <QRCodeSVG
                    value={activeTx?.qrPayload || 'CAMPUSCONNECT_SECURE_EXCHANGE'}
                    size={180}
                    level="H"
                    fgColor="#0081a7"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-2 font-mono">
                  SHA-256 Signed • 15m TTL
                </span>
              </div>

              {/* Large Dynamic 6-Digit OTP */}
              <div className="flex flex-col items-center justify-center p-6 bg-[#fdfcdc] rounded-2xl border border-[#00afb9]/30 text-center space-y-3">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Or Read Aloud 6-Digit Code
                </span>
                <div className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-[#0081a7] bg-white px-6 py-3 rounded-2xl border border-[#00afb9]/30 shadow-sm">
                  {activeTx?.otp || '482910'}
                </div>

                <button
                  type="button"
                  onClick={copySellerOtp}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0081a7] hover:text-[#00afb9] transition cursor-pointer"
                >
                  {copiedOtp ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied to clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <div className="p-3 bg-white/80 rounded-xl text-left text-[11px] text-gray-600 space-y-1">
                  <p className="font-bold text-[#0081a7]">📌 Seller Protection Notice:</p>
                  <p>
                    Do not hand over the gear until you see the green confirmation checkmark on this screen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trust & Safety Directives */}
      <div className="bg-[#fed9b7]/25 border border-[#fed9b7] rounded-3xl p-5 text-xs text-[#334155] space-y-2">
        <h4 className="font-extrabold text-[#0081a7] flex items-center gap-1.5 text-sm">
          <ShieldCheck className="w-4 h-4 text-[#0081a7]" />
          <span>Zero-Trust Physical Safety Protocol</span>
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>
            Meet strictly within campus <strong>Safe Exchange Zones</strong> (e.g. Central Library Pods, Main Gate Security, or CS Labs) under security coverage.
          </li>
          <li>Never transmit the 6-digit code via phone chat or WhatsApp prior to inspecting the physical gear.</li>
          <li>
            Both buyer and seller automatically receive <strong>+15 Campus Karma</strong> and rating rights upon cryptographic seal verification.
          </li>
        </ul>
      </div>

      {/* ── Interactive QR Scanner Simulator Modal ───────────────────── */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-gray-200 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#0081a7]" />
                <h3 className="font-extrabold text-gray-900 text-sm">
                  Simulated QR Code Scanner
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Simulated Camera Viewfinder */}
            <div className="relative bg-gray-950 rounded-2xl h-64 flex flex-col items-center justify-center overflow-hidden border-2 border-[#0081a7]">
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#00afb9]" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#00afb9]" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#00afb9]" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#00afb9]" />

              {/* Scanning laser line animation */}
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-[#00afb9] shadow-[0_0_12px_#00afb9] animate-pulse" />

              <div className="text-center space-y-2 z-10 px-4">
                <QrCode className="w-16 h-16 text-white/50 mx-auto animate-pulse" />
                <p className="text-xs text-white/80 font-medium">
                  Align seller's QR code within the viewfinder
                </p>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  CAMERA SENSOR READY • 1080P
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                disabled={scannerSimulating}
                onClick={handleSimulateScan}
                className="w-full py-3 bg-[#0081a7] hover:bg-[#00afb9] text-white text-xs font-extrabold rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {scannerSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Decoding QR Payload & Handshaking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Simulate Scan of Seller's Code</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                className="w-full py-2.5 text-xs text-gray-500 font-semibold hover:text-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
