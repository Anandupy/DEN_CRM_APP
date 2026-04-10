'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import {
  Eye, EyeOff, Shield, Dumbbell, User, Copy, Check,
  MapPin, Clock, Phone, Users, TrendingUp, Award, ChevronRight
} from 'lucide-react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { signInWithSupabase, fetchProfileByUserId, getCurrentSession, syncSessionCookies } from '@/lib/auth/client';
import { getHomeRouteForRole } from '@/lib/auth/roles';


type Role = 'owner' | 'senior_trainer' | 'trainer' | 'member';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface AccountOption {
  role: Role;
  email: string;
  password: string;
  name: string;
}

const demoCredentials: Record<Role, AccountOption & { desc: string }> = {
  owner: {
    role: 'owner',
    email: 'denzil.dsoza@denfitness.in',
    password: 'DenFitness@2026',
    name: 'Owner Account',
    desc: 'Full admin access — all modules',
  },
  senior_trainer: {
    role: 'senior_trainer',
    email: 'raj.vishwakarma@denfitness.in',
    password: 'DenFitness@2026',
    name: 'Senior Trainer Account',
    desc: 'Manage trainer operations and collections',
  },
  trainer: {
    role: 'trainer',
    email: 'raj.gupta@denfitness.in',
    password: 'DenFitness@2026',
    name: 'Trainer Account',
    desc: 'Mark attendance, view members',
  },
  member: {
    role: 'member',
    email: 'member@denfitness.in',
    password: 'Member@DEN2026',
    name: 'Member Account',
    desc: 'Personal dashboard & history',
  },
};

const roleConfig: Record<Role, { label: string; icon: React.ElementType; color: string; route: string }> = {
  owner: { label: 'Owner / Admin', icon: Shield, color: 'text-amber-400', route: '/owner/dashboard' },
  senior_trainer: { label: 'Senior Trainer', icon: Award, color: 'text-violet-400', route: '/senior/dashboard' },
  trainer: { label: 'Trainer', icon: Dumbbell, color: 'text-blue-400', route: '/trainer/dashboard' },
  member: { label: 'Member', icon: User, color: 'text-emerald-400', route: '/member/dashboard' },
};

const gymStats = [
  { label: 'Active Members', value: '247', icon: Users },
  { label: 'Trainers', value: '8', icon: Dumbbell },
  { label: 'Avg Rating', value: '4.8★', icon: Award },
  { label: 'Est. 2018', value: '8 yrs', icon: TrendingUp },
];

export default function LoginForm() {
  const router = useRouter();
  const supabaseReady = isSupabaseConfigured();
  const [activeRole, setActiveRole] = useState<Role>('owner');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [liveAccounts, setLiveAccounts] = useState<AccountOption[]>([]);
  const visibleAccounts = supabaseReady
    ? liveAccounts
    : (Object.keys(demoCredentials) as Role[]).map((role) => demoCredentials[role]);

  React.useEffect(() => {
    if (!supabaseReady) return;

    getCurrentSession().then(async (session) => {
      if (!session?.user?.id) return;
        const profile = await fetchProfileByUserId(session.user.id);
        if (profile?.is_active) {
          router.replace(getHomeRouteForRole(profile.role));
      }
    });
  }, [supabaseReady, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  React.useEffect(() => {
    if (!supabaseReady) return;

    const client = getSupabaseBrowserClient();
    if (!client) return;

    client
      .from('profiles')
      .select('full_name, email, role')
      .in('role', ['owner', 'senior_trainer', 'trainer'])
      .order('role', { ascending: true })
      .then(({ data, error }) => {
        if (error || !data) return;

        const nextAccounts = (data as Array<{ full_name: string; email: string; role: Role }>)
          .filter((account) => account.email)
          .map((account) => ({
            role: account.role,
            email: account.email,
            password: 'DenFitness@2026',
            name: account.full_name || roleConfig[account.role].label,
          }));

        setLiveAccounts(nextAccounts);

        const preferredAccount = nextAccounts.find((account) => account.role === activeRole) ?? nextAccounts[0];
        if (preferredAccount) {
          setValue('email', preferredAccount.email);
          setValue('password', preferredAccount.password);
        }
      });
  }, [activeRole, setValue, supabaseReady]);

  const handleRoleChange = (role: Role) => {
    setActiveRole(role);
    const account = visibleAccounts.find((item) => item.role === role) ?? demoCredentials[role];
    setValue('email', account?.email ?? '');
    setValue('password', account?.password ?? '');
    clearErrors();
  };

  const handleUseCredentials = (account: AccountOption) => {
    setActiveRole(account.role);
    setValue('email', account.email);
    setValue('password', account.password);
    clearErrors();
    toast.success(`${account.name}'s credentials loaded`);
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    if (supabaseReady) {
      const { error } = await signInWithSupabase(data.email, data.password);

      if (error) {
        setIsLoading(false);
        setError('email', { message: error.message || 'Unable to sign in with Supabase' });
        toast.error('Supabase sign-in failed');
        return;
      }

      const session = await getCurrentSession();
      await syncSessionCookies(session);
      const profile = session?.user?.id ? await fetchProfileByUserId(session.user.id) : null;

      if (!profile) {
        setIsLoading(false);
        toast.error('Login succeeded, but no profile record was found. Run the ERP schema and staff seed setup first.');
        return;
      }

      if (!profile.is_active) {
        setIsLoading(false);
        toast.error('This account is inactive. Please contact the owner.');
        return;
      }

      setIsLoading(false);
      toast.success(`Welcome back, ${profile.full_name}!`);
      router.push(getHomeRouteForRole(profile.role));
      return;
    }

    await new Promise((r) => setTimeout(r, 1200));
    const creds = demoCredentials[activeRole];
    if (data.email !== creds.email || data.password !== creds.password) {
      setIsLoading(false);
      setError('email', { message: 'Invalid credentials - use the demo accounts below to sign in' });
      toast.error('Login failed - check credentials');
      return;
    }
    setIsLoading(false);
    toast.success(`Welcome back, ${creds.name}!`);
    setTimeout(() => {
      router.push(roleConfig[activeRole].route);
    }, 600);
  };

  return (
    <>
      <Toaster position="bottom-right" theme="dark" richColors />
      <div className="min-h-screen bg-zinc-950 flex">
        {/* Left panel — branding */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative bg-zinc-900 border-r border-zinc-800 flex-col justify-between p-10 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-amber-500 blur-3xl" />
            <div className="absolute bottom-40 right-10 w-48 h-48 rounded-full bg-orange-600 blur-3xl" />
          </div>

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsl(38 92% 50% / 1) 1px, transparent 1px), linear-gradient(90deg, hsl(38 92% 50% / 1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <AppLogo size={48} />
              <div>
                <span className="font-bold text-2xl text-zinc-100 tracking-tight">DEN Fitness</span>
                <p className="text-xs text-amber-500/80 font-medium tracking-wider uppercase">Gym Management System</p>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl xl:text-4xl font-bold text-zinc-100 leading-tight mb-4">
                Manage Your Gym
                <span className="block text-amber-400">Like a Pro.</span>
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                Complete ERP & CRM for fitness businesses — members, attendance, fees, trainers, and reports in one place.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {gymStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={`stat-${stat.label}`} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={14} className="text-amber-500" />
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{stat.label}</span>
                    </div>
                    <p className="text-xl font-bold text-zinc-100 stat-value">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gym info */}
          <div className="relative z-10 space-y-2.5">
            <div className="flex items-start gap-2 text-xs text-zinc-500">
              <MapPin size={13} className="text-amber-500/60 mt-0.5 shrink-0" />
              <span>Shop No. 2, New Kailas Niwas 2, Near 90 Feet Rd, Netaji Nagar, Ashok Nagar, Saki Naka, Mumbai 400072</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock size={13} className="text-amber-500/60 shrink-0" />
              <span>Mon – Sat: 6:00 AM – 10:00 PM &nbsp;·&nbsp; Sun: 7:00 AM – 1:00 PM</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Phone size={13} className="text-amber-500/60 shrink-0" />
              <span>+91 98765 43210</span>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <AppLogo size={36} />
              <span className="font-bold text-lg text-zinc-100">DEN Fitness</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-zinc-100 mb-1">Sign in to your account</h2>
              <p className="text-sm text-zinc-500">
                {supabaseReady ? 'Enter your email and password. Your dashboard opens automatically based on your role.' : 'Select your role and enter your credentials'}
                <span className="ml-2 text-[11px] uppercase tracking-wide text-amber-500/80">
                  {supabaseReady ? 'Supabase auth enabled' : 'Demo auth fallback'}
                </span>
              </p>
            </div>

            {/* Role tabs */}
            <div className={`flex gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-6 ${supabaseReady ? 'opacity-70' : ''}`}>
              {(Object.keys(roleConfig) as Role[]).map((role) => {
                const config = roleConfig[role];
                const Icon = config.icon;
                const isActive = activeRole === role;
                return (
                  <button
                    key={`role-tab-${role}`}
                    onClick={() => handleRoleChange(role)}
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Icon size={14} className={isActive ? config.color : ''} />
                    <span className="hidden sm:inline">{config.label}</span>
                    <span className="sm:hidden capitalize">{role}</span>
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                  })}
                  className="form-input"
                  placeholder="your@email.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' },
                    })}
                    className="form-input pr-10"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Remember me + forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0"
                  />
                  <span className="text-sm text-zinc-400">Remember me</span>
                </label>
                <button type="button" className="text-sm text-amber-500 hover:text-amber-400 transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full justify-center py-3 text-base mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as {roleConfig[activeRole].label}</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {supabaseReady ? 'Sample Accounts' : 'Demo Accounts'}
                </p>
              </div>
              {supabaseReady && (
                <p className="text-[11px] text-zinc-500 mb-3">
                  Supabase is configured. Accounts shown below are loaded from your live staff records. Default seeded password is `DenFitness@2026` unless changed manually.
                </p>
              )}
              <div className="space-y-2">
                {visibleAccounts.map((account) => {
                  const creds = { email: account.email, password: account.password, name: account.name };
                  const config = roleConfig[account.role];
                  const Icon = config.icon;
                  const isCurrentRole = activeRole === account.role;
                  return (
                    <div
                      key={`demo-${account.email}`}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-150 ${
                        isCurrentRole
                          ? 'bg-amber-500/8 border-amber-500/20' :'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isCurrentRole ? 'bg-amber-500/15' : 'bg-zinc-800'
                      }`}>
                        <Icon size={14} className={isCurrentRole ? config.color : 'text-zinc-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-300">{creds.name}</p>
                        <p className="text-[10px] text-zinc-600 truncate">{creds.email}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(creds.email, `${account.email}-email`)}
                          className="p-1.5 rounded text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors"
                          title="Copy email"
                        >
                          {copiedField === `${account.email}-email` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUseCredentials(account);
                          }}
                          className="text-[10px] font-semibold text-amber-500 hover:text-amber-400 px-2 py-1 rounded hover:bg-amber-500/10 transition-colors whitespace-nowrap"
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-xs text-zinc-600 mt-6">
              DEN Fitness Management System v2.1 &nbsp;·&nbsp; Mumbai, Maharashtra
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
