// LoginView.js - Sign In & Sign Up with Admin Approval Flow
let activeAuthTab = 'signin';
let registrationPendingUser = null;

function renderLoginView() {
  if (registrationPendingUser) {
    return `
      <div class="h-screen w-screen flex items-center justify-center bg-app-canvas p-4 select-none">
        <div class="w-full max-w-md bg-app-surface border border-app-borderSubtle rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center gap-5 animate-fade-in">
          
          <div class="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white">
            <i data-lucide="clock" class="w-6 h-6 text-amber-400"></i>
          </div>

          <div class="flex flex-col gap-1.5">
            <h2 class="text-[18px] font-semibold text-white">Registration Submitted</h2>
            <p class="text-[13px] text-app-textSecondary leading-relaxed">
              Your account (<strong class="text-white">${escapeHtml(registrationPendingUser.email)}</strong>) is pending administrator approval.
            </p>
          </div>

          <div class="w-full bg-app-input border border-app-borderSubtle rounded-xl p-3.5 text-[12.5px] text-app-textSecondary text-left flex flex-col gap-1">
            <div class="flex items-center gap-2 text-amber-400 font-medium">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Status: Pending Review</span>
            </div>
            <span class="text-[11.5px] text-app-textMuted">The administrator (Sadman) will review and approve your account shortly.</span>
          </div>

          <button 
            onclick="registrationPendingUser = null; activeAuthTab = 'signin'; renderApp()"
            class="w-full btn-primary text-[13.5px] py-2.5 rounded-xl transition-all shadow-md">
            Back to Sign In
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="h-screen w-screen flex items-center justify-center bg-app-canvas p-4 select-none">
      <div class="w-full max-w-md bg-app-surface border border-app-borderSubtle rounded-2xl p-8 shadow-2xl flex flex-col gap-6 animate-fade-in">
        
        <!-- Logo & Title -->
        <div class="flex flex-col items-center text-center gap-3">
          <img src="/logo.png" class="h-8 object-contain" alt="Collab AI" />
          <div class="flex flex-col gap-0.5">
            <h1 class="text-[20px] font-semibold text-white tracking-tight">
              ${activeAuthTab === 'signin' ? 'Sign in to CollabAI' : 'Create an Account'}
            </h1>
            <p class="text-[13px] text-app-textSecondary font-normal">
              ${activeAuthTab === 'signin' ? 'Collaborate with AI agents & orchestrated workflows' : 'Register for access to CollabAI workspace'}
            </p>
          </div>
        </div>

        <!-- Auth Tabs (Sign In / Sign Up) -->
        <div class="flex items-center bg-app-input p-1 rounded-xl border border-app-borderSubtle text-[13px]">
          <button 
            onclick="setAuthTab('signin')"
            class="flex-1 py-1.5 rounded-lg font-medium transition-all ${activeAuthTab === 'signin' ? 'bg-app-surface text-white shadow-sm' : 'text-app-textMuted hover:text-white'}">
            Sign In
          </button>
          <button 
            onclick="setAuthTab('signup')"
            class="flex-1 py-1.5 rounded-lg font-medium transition-all ${activeAuthTab === 'signup' ? 'bg-app-surface text-white shadow-sm' : 'text-app-textMuted hover:text-white'}">
            Sign Up
          </button>
        </div>

        ${activeAuthTab === 'signin' ? `
          <!-- Sign In Form -->
          <form onsubmit="handleLoginSubmit(event)" class="flex flex-col gap-4 text-[13px]">
            <div class="flex flex-col gap-1">
              <label class="font-normal text-white">Email address</label>
              <input 
                type="email" 
                id="login-email" 
                required 
                value="sadman@collabai.dev"
                placeholder="name@company.com" 
                class="bg-app-input border border-app-borderSubtle text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-app-borderActive transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <label class="font-normal text-white">Password</label>
              </div>
              <input 
                type="password" 
                id="login-password" 
                required 
                value="admin123"
                placeholder="••••••••" 
                class="bg-app-input border border-app-borderSubtle text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-app-borderActive transition-colors font-mono"
              />
            </div>

            <button 
              type="submit" 
              class="w-full btn-primary text-[13.5px] py-2.5 rounded-xl transition-all shadow-md mt-1">
              Sign In
            </button>
          </form>
        ` : `
          <!-- Sign Up Form -->
          <form onsubmit="handleRegisterSubmit(event)" class="flex flex-col gap-3.5 text-[13px]">
            <div class="flex flex-col gap-1">
              <label class="font-normal text-white">Full Name</label>
              <input 
                type="text" 
                id="reg-name" 
                required 
                placeholder="e.g. Sarah Connor" 
                class="bg-app-input border border-app-borderSubtle text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-app-borderActive transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-normal text-white">Email address</label>
              <input 
                type="email" 
                id="reg-email" 
                required 
                placeholder="name@company.com" 
                class="bg-app-input border border-app-borderSubtle text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-app-borderActive transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-normal text-white">Password</label>
              <input 
                type="password" 
                id="reg-password" 
                required 
                minlength="6"
                placeholder="At least 6 characters" 
                class="bg-app-input border border-app-borderSubtle text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-app-borderActive transition-colors font-mono"
              />
            </div>

            <button 
              type="submit" 
              class="w-full btn-primary text-[13.5px] py-2.5 rounded-xl transition-all shadow-md mt-1">
              Create Account
            </button>
          </form>
        `}

        <div class="text-center text-[11.5px] text-app-textMuted">
          Protected by CollabAI Workspace Admin Verification.
        </div>

      </div>
    </div>
  `;
}

function setAuthTab(tab) {
  activeAuthTab = tab;
  renderApp();
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Login failed', 'error');
      return;
    }

    appStore.login(data.user);
    showToast(`Welcome back, ${data.user.name}!`);
  } catch (err) {
    showToast('Network error: ' + err.message, 'error');
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Registration failed', 'error');
      return;
    }

    if (data.status === 'approved') {
      appStore.login(data.user);
      showToast('Account created and logged in!');
    } else {
      registrationPendingUser = { email, name };
      renderApp();
    }
  } catch (err) {
    showToast('Network error: ' + err.message, 'error');
  }
}