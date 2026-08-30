// LoginView.js - Matches Screenshot 3 with brand logo and #171717 surface
function renderLoginView() {
  return `
    <div class="min-h-screen w-full bg-app-canvas flex items-center justify-center p-4 select-none">
      <div class="w-full max-w-[420px] bg-app-surface border border-app-borderSubtle rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-6">
        
        <!-- Brand Logo & Title -->
        <div class="flex flex-col items-center gap-3">
          <img src="/logo.png" class="h-10 object-contain" alt="Collab AI" />
          <p class="text-[13.5px] text-app-textSecondary mt-1">Sign in to your AI collaboration platform</p>
        </div>

        <!-- Login Form -->
        <form onsubmit="handleLoginSubmit(event)" class="w-full flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-app-textSecondary">Email or Username</label>
            <input 
              type="text" 
              id="login-username"
              required 
              value="sadman@collabai.dev"
              placeholder="Enter your email or username" 
              class="w-full bg-app-input border border-app-borderSubtle text-white text-[14px] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-app-borderActive transition-colors placeholder-app-textMuted"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-app-textSecondary">Password</label>
            <div class="relative flex items-center">
              <input 
                type="password" 
                id="login-password"
                required 
                value="••••••••••••"
                placeholder="Enter your password" 
                class="w-full bg-app-input border border-app-borderSubtle text-white text-[14px] rounded-lg px-3.5 py-2.5 pr-10 focus:outline-none focus:border-app-borderActive transition-colors placeholder-app-textMuted"
              />
              <button type="button" onclick="togglePasswordVisibility()" class="absolute right-3 text-app-textMuted hover:text-white">
                <i data-lucide="eye" id="password-eye-icon" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            class="w-full bg-app-accent hover:bg-app-accentHover text-white font-semibold text-[14.5px] py-2.5 rounded-lg transition-all shadow-md mt-2">
            Sign In
          </button>
        </form>

        <div class="w-full flex items-center gap-3">
          <div class="flex-1 h-[1px] bg-app-borderSubtle"></div>
          <span class="text-[12px] text-app-textMuted uppercase tracking-wider font-medium">Or continue with</span>
          <div class="flex-1 h-[1px] bg-app-borderSubtle"></div>
        </div>

        <button 
          onclick="handleGoogleSignIn()" 
          class="w-full flex items-center justify-center gap-2.5 bg-app-input hover:bg-app-hover border border-app-borderSubtle text-white text-[13.5px] font-medium py-2.5 rounded-lg transition-colors">
          <i data-lucide="chrome" class="w-4 h-4 text-white"></i>
          <span>Sign in with Google</span>
        </button>

        <a href="javascript:void(0)" onclick="showToast('Password reset link sent to your registered email.')" class="text-[12.5px] text-app-accent hover:underline font-medium">
          Forgot your password?
        </a>
      </div>
    </div>
  `;
}

function togglePasswordVisibility() {
  const input = document.getElementById('login-password');
  const icon = document.getElementById('password-eye-icon');
  if (input) {
    if (input.type === 'password') {
      input.type = 'text';
      icon.setAttribute('data-lucide', 'eye-off');
    } else {
      input.type = 'password';
      icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  appStore.login();
  showToast('Welcome back, Sadman Zaman Khan!');
}

function handleGoogleSignIn() {
  appStore.login();
  showToast('Signed in via Google OAuth');
}