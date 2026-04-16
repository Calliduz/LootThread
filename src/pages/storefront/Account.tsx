import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getMyOrders,
  updatePassword,
  getProfile,
  updateAddresses,
} from "../../api/endpoints";
import { useCart } from "../../contexts/CartContext";
import Navbar from "../../components/Navbar";
import CartDrawer from "../../components/storefront/CartDrawer";
import toast from "react-hot-toast";
import {
  LogOut,
  User as UserIcon,
  Package,
  Settings,
  ShieldAlert,
  ShoppingBag,
  CheckCircle,
  KeyRound,
  ChevronDown,
  Eye,
  EyeOff,
  Clock,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Zap,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "../../components/Skeleton";
import { getAssetUrl } from "../../utils/assetHelper";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  gameTag?: string;
  status: string;
  createdAt: string;
}

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { cartItems, cartCount, isCartOpen, setIsCartOpen } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // --- Loyalty State ---
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  // XP formula: same as backend
  const XP_PER_LEVEL = 5000;
  const xpIntoCurrentLevel = xp % XP_PER_LEVEL;
  const progressPercent = (xpIntoCurrentLevel / XP_PER_LEVEL) * 100;
  const xpToNextLevel = XP_PER_LEVEL - xpIntoCurrentLevel;

  // Rank name based on level
  const getRankName = (lvl: number) => {
    if (lvl >= 20) return 'Mythic Operative';
    if (lvl >= 15) return 'Elite Phantom';
    if (lvl >= 10) return 'Shadow Veteran';
    if (lvl >= 5) return 'Tactical Agent';
    return 'Recruit';
  };

  // --- Change Password State ---
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // --- Address State ---
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: "",
    street: "",
    city: "",
    zip: "",
    country: "",
  });
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    getMyOrders()
      .then((data) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));

    getProfile()
      .then((data) => {
        if (data.deliveryAddresses) setAddresses(data.deliveryAddresses);
        if (typeof data.xp === 'number') setXp(data.xp);
        if (typeof data.level === 'number') setLevel(data.level);
      })
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    setSavingPw(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      toast.success("Passcode updated successfully!");
      setShowPwForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 400) {
        toast.error("Current passcode is incorrect or invalid.");
      } else {
        toast.error(
          err?.response?.data?.message || "Failed to update passcode.",
        );
      }
    } finally {
      setSavingPw(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddr(true);
    const updated = [
      ...addresses,
      { ...newAddr, isDefault: addresses.length === 0 },
    ];
    try {
      await updateAddresses(updated);
      setAddresses(updated);
      setNewAddr({ label: "", street: "", city: "", zip: "", country: "" });
      toast.success("Address added successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add address.");
    } finally {
      setSavingAddr(false);
    }
  };

  const handleRemoveAddress = async (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    try {
      await updateAddresses(updated);
      setAddresses(updated);
      toast.success("Address removed.");
    } catch (err: any) {
      toast.error("Failed to remove address.");
    }
  };

  const OrderBadge = ({ status }: { status: string }) => {
    const config: Record<string, { label: string; icon: any; class: string }> =
      {
        completed: {
          label: "Completed",
          icon: CheckCircle,
          class:
            "text-[#00ffcc] border-[#00ffcc]/20 bg-[#00ffcc]/5 shadow-[0_0_15px_rgba(0,255,204,0.1)]",
        },
        pending: {
          label: "Pending",
          icon: Clock,
          class:
            "text-[#facc15] border-[#facc15]/20 bg-[#facc15]/5 shadow-[0_0_15px_rgba(250,204,21,0.1)]",
        },
        processing: {
          label: "Processing",
          icon: RefreshCw,
          class:
            "text-[#3b82f6] border-[#3b82f6]/20 bg-[#3b82f6]/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
        },
        cancelled: {
          label: "Cancelled",
          icon: XCircle,
          class:
            "text-[#f87171] border-[#f87171]/20 bg-[#f87171]/5 shadow-[0_0_15px_rgba(248,113,113,0.1)]",
        },
      };

    const current = config[status.toLowerCase()] || {
      label: status,
      icon: AlertTriangle,
      class: "text-white/40 border-white/10 bg-white/5",
    };
    const Icon = current.icon;

    return (
      <span
        className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-2 transition-all duration-300 ${current.class}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {current.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Full site Navbar */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={(view) => {
          navigate("/");
          // After navigation, the Storefront component handles the view
          setTimeout(
            () =>
              window.dispatchEvent(
                new CustomEvent("navigate-view", { detail: view }),
              ),
            100,
          );
        }}
      />

      <div className="pt-8 pb-12 px-6 relative">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-bg-card border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <UserIcon className="w-64 h-64 text-brand-primary" />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full md:w-auto">
              {/* Tactical Profile Frame */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/50 to-brand-accent/50 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-32 h-32 rounded-2xl bg-bg-dark border-2 border-white/10 flex items-center justify-center p-1.5 overflow-hidden shadow-2xl">
                  <img
                    src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                    alt="Avatar"
                    className="w-full h-full rounded-xl object-cover bg-black"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 bg-brand-primary rounded-full border-4 border-bg-dark shadow-[0_0_15px_rgba(0,255,204,0.5)]" />
                </div>
              </motion.div>

              <div className="text-center md:text-left space-y-2">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white break-all max-w-[200px] md:max-w-md lg:max-w-lg">
                    {user?.name}
                  </h1>
                  <div className="flex items-center gap-2 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,255,204,0.1)]">
                    <CheckCircle className="w-3 h-3" />
                    Identity Verified
                  </div>
                </div>
                <p className="text-white/30 font-mono text-xs tracking-widest">{user?.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Rank</span>
                    <span className="text-[10px] font-bold text-white/80 uppercase">{getRankName(level)}</span>
                  </div>
                  <div className="w-px h-6 bg-white/5" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Level</span>
                    <span className="text-[10px] font-bold text-brand-primary uppercase">LVL {level}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* ═══ LOYALTY RANK SECTION ══════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-bg-card border border-brand-primary/20 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_60px_rgba(0,255,204,0.05)]"
          >
            {/* Background glow */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand-primary/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-brand-primary/10 border border-brand-primary/20 rounded-xl flex items-center justify-center">
                      <Zap className="w-4 h-4 text-brand-primary" />
                    </div>
                    <h2 className="text-sm font-black uppercase italic tracking-widest text-white">Loyalty Rank</h2>
                  </div>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest ml-11">Earn 1 XP per ₱1 spent · Level up every 5,000 XP</p>
                </div>

                {/* Level Badge */}
                <div className="flex items-center gap-4">
                  <div className="text-center bg-brand-primary/10 border border-brand-primary/20 rounded-2xl px-6 py-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary/60 mb-1">Level</p>
                    <p className="text-4xl font-black text-brand-primary tracking-tighter leading-none">{level}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-1">{getRankName(level)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Total XP</p>
                    <p className="text-2xl font-black text-white tracking-tighter">{xp.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/40">{xpIntoCurrentLevel.toLocaleString()} XP this level</span>
                  <span className="text-brand-primary">{xpToNextLevel.toLocaleString()} XP to Level {level + 1}</span>
                </div>
                <div className="relative h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-primary/80 to-brand-primary rounded-full shadow-[0_0_12px_rgba(0,255,204,0.6)]"
                  />
                  {/* Pulse dot at progress end */}
                  <motion.div
                    initial={{ left: 0 }}
                    animate={{ left: `${Math.max(progressPercent - 1, 0)}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(0,255,204,1)] border-2 border-white"
                  />
                </div>
                <p className="text-[10px] text-white/20 text-center">
                  Use promo codes at checkout to get loyalty discounts. New codes unlock as you level up!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main — Order History */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-bg-card border border-white/5 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-brand-primary" />
                    <h2 className="text-xl font-black uppercase italic tracking-widest text-white">
                      Order History
                    </h2>
                  </div>
                  {orders.length > 0 && (
                    <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {orders.length} order{orders.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {loadingOrders ? (
                  <div className="space-y-3 py-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} height={72} />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="border border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.02]">
                    <ShieldAlert className="w-12 h-12 text-white/20" />
                    <h3 className="text-white/60 font-bold uppercase tracking-widest">
                      No Active Orders
                    </h3>
                    <p className="text-white/30 text-sm max-w-sm">
                      You haven't acquired any loot yet. Your secure transaction
                      log will appear here.
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="mt-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Return to Market
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {orders.map((order, index) => (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            type: "spring",
                            damping: 25,
                            stiffness: 200,
                          }}
                          className="bg-bg-card border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden group hover:border-brand-primary/30 transition-all duration-500 shadow-2xl"
                        >
                          {/* Background subtle gradient */}
                          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                                  <ShoppingBag className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block">
                                    Acquisition ID
                                  </span>
                                  <span className="text-sm font-black uppercase tracking-tight text-white line-clamp-1 truncate max-w-[200px]">
                                    #{order._id.slice(-12).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-white/20" />
                                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                    {new Date(
                                      order.createdAt,
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                                {order.gameTag && (
                                  <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                                    <Zap className="w-3 h-3 text-brand-primary/60" />
                                    <p className="text-[10px] text-brand-primary font-black uppercase tracking-tighter mt-0.5">
                                      {order.gameTag}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                              <OrderBadge status={order.status} />
                              <div className="text-right">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block">
                                  Payload Total
                                </span>
                                <span className="text-3xl font-black text-white tracking-tighter leading-none">
                                  <span className="text-brand-primary/50 text-sm mr-1">
                                    ₱
                                  </span>
                                  {order.totalAmount.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-brand-primary/20 hover:bg-black/60 transition-all duration-300 group/item"
                              >
                                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center group-hover/item:scale-105 transition-transform duration-500">
                                  {item.imageUrl ? (
                                    <img
                                      src={getAssetUrl(item.imageUrl)}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="w-6 h-6 text-brand-primary/20" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black text-white uppercase tracking-wide truncate group-hover/item:text-brand-primary transition-colors">
                                    {item.name}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                                      Qty: {item.quantity}
                                    </span>
                                    <span className="text-[11px] font-black text-white/90">
                                      ₱{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end pt-4 border-t border-white/5 relative z-10">
                            <button
                              onClick={() => navigate(`/receipt/${order._id}`)}
                              className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-brand-primary transition-colors flex items-center gap-2 group/btn"
                            >
                              View Secure Receipt
                              <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="bg-bg-card border border-white/5 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-5 h-5 text-brand-primary" />
                  <h2 className="text-sm font-black uppercase italic tracking-widest text-white">
                    Security & Auth
                  </h2>
                </div>
                <div className="space-y-4">
                  {/* Update Passcode – Expandable */}
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowPwForm((v) => !v)}
                      className="w-full text-left p-4 hover:bg-white/[0.03] transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-white mb-1 flex items-center gap-2">
                          <KeyRound className="w-3.5 h-3.5 text-brand-primary" />
                          Update Passcode
                        </div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">
                          Change your entry key
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-white/30 transition-transform ${showPwForm ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showPwForm && (
                      <form
                        onSubmit={handlePasswordUpdate}
                        className="px-4 pb-4 space-y-3 border-t border-white/5 pt-4"
                      >
                        {/* Current Password */}
                        <div className="relative">
                          <input
                            type={showCurrent ? "text" : "password"}
                            placeholder="Current passcode"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white pr-9 outline-none focus:border-brand-primary/40 placeholder-white/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrent((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-primary transition-colors"
                            tabIndex={-1}
                          >
                            {showCurrent ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* New Password */}
                        <div className="relative">
                          <input
                            type={showNew ? "text" : "password"}
                            placeholder="New passcode (min 8 chars)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white pr-9 outline-none focus:border-brand-primary/40 placeholder-white/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-primary transition-colors"
                            tabIndex={-1}
                          >
                            {showNew ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                          <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm new passcode"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white pr-9 outline-none focus:border-brand-primary/40 placeholder-white/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-primary transition-colors"
                            tabIndex={-1}
                          >
                            {showConfirm ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={savingPw}
                          className="w-full bg-brand-primary text-black text-xs font-black uppercase tracking-widest py-2.5 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {savingPw ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />{" "}
                              Saving...
                            </>
                          ) : (
                            "Update Passcode"
                          )}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Address Book */}
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden mt-4">
                    <button
                      onClick={() => setShowAddressForm((v) => !v)}
                      className="w-full text-left p-4 hover:bg-white/[0.03] transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-white mb-1 flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-brand-primary" />
                          Address Book
                        </div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">
                          Manage delivery addresses
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-white/30 transition-transform ${showAddressForm ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showAddressForm && (
                      <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                        {addresses.length > 0 ? (
                          <div className="space-y-2">
                            {addresses.map((addr, idx) => (
                              <div
                                key={idx}
                                className="bg-black/30 border border-white/10 rounded-lg p-3 flex justify-between items-start"
                              >
                                <div>
                                  <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">
                                    {addr.label}
                                  </p>
                                  <p className="text-[10px] text-white/40 font-mono">
                                    {addr.street}, {addr.city}, {addr.zip},{" "}
                                    {addr.country}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleRemoveAddress(idx)}
                                  className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold tracking-widest"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-white/40 text-center py-2">
                            No addresses saved.
                          </p>
                        )}

                        <form
                          onSubmit={handleAddAddress}
                          className="space-y-3 pt-3 border-t border-white/5"
                        >
                          <input
                            type="text"
                            placeholder="Label (e.g. Home)"
                            value={newAddr.label}
                            onChange={(e) =>
                              setNewAddr({ ...newAddr, label: e.target.value })
                            }
                            required
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/40 placeholder-white/20"
                          />
                          <input
                            type="text"
                            placeholder="Street Address"
                            value={newAddr.street}
                            onChange={(e) =>
                              setNewAddr({ ...newAddr, street: e.target.value })
                            }
                            required
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/40 placeholder-white/20"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="City"
                              value={newAddr.city}
                              onChange={(e) =>
                                setNewAddr({ ...newAddr, city: e.target.value })
                              }
                              required
                              className="w-1/2 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/40 placeholder-white/20"
                            />
                            <input
                              type="text"
                              placeholder="ZIP"
                              value={newAddr.zip}
                              onChange={(e) =>
                                setNewAddr({ ...newAddr, zip: e.target.value })
                              }
                              required
                              className="w-1/2 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/40 placeholder-white/20"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Country"
                            value={newAddr.country}
                            onChange={(e) =>
                              setNewAddr({
                                ...newAddr,
                                country: e.target.value,
                              })
                            }
                            required
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/40 placeholder-white/20"
                          />

                          <button
                            type="submit"
                            disabled={savingAddr}
                            className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest py-2.5 rounded-lg active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
                          >
                            {savingAddr ? "Adding..." : "Add Address"}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              {!loadingOrders && orders.length > 0 && (
                <div className="bg-bg-card border border-white/5 rounded-3xl p-6 space-y-4">
                  <h2 className="text-xs font-black uppercase italic tracking-widest text-white/60">
                    Activity
                  </h2>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-xs text-white/40 uppercase tracking-widest">
                      Total Orders
                    </span>
                    <span className="text-sm font-black text-white">
                      {orders.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs text-white/40 uppercase tracking-widest">
                      Total Spent
                    </span>
                    <span className="text-sm font-black text-brand-primary">
                      ₱
                      {orders
                        .reduce((sum, o) => sum + o.totalAmount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
