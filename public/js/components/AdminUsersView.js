// AdminUsersView.js - Admin User Approval & Access Management with Theme Support
let adminUsersList = [];
let isAdminLoading = false;

async function fetchAdminUsers() {
  isAdminLoading = true;
  try {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      adminUsersList = await res.json();
    }
  } catch (e) {
    console.error(e);
  }
  isAdminLoading = false;
  renderApp();
}

function renderAdminUsersView(state) {
  const pendingUsers = adminUsersList.filter(u => u.status === 'pending');
  const approvedUsers = adminUsersList.filter(u => u.status === 'approved');

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-transparent select-none">
      ${renderHeaderBreadcrumb('Admin • User Approvals')}

      <div class="p-8 max-w-[1100px] mx-auto w-full flex flex-col gap-6 animate-fade-in">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-0.5">
            <div class="flex items-center gap-2">
              <h1 class="text-[22px] font-semibold text-app-textPrimary tracking-tight">User Access & Approvals</h1>
              <span class="text-[11px] bg-app-hoverSubtle text-app-textPrimary px-2.5 py-0.5 rounded-full border border-app-borderSubtle">Admin Only</span>
            </div>
            <p class="text-[13.5px] text-app-textSecondary font-normal">Approve or reject public registration requests before users can access CollabAI.</p>
          </div>

          <button 
            onclick="fetchAdminUsers()" 
            class="px-3.5 py-1.5 rounded-xl bg-app-surface hover:bg-app-hover border border-app-borderSubtle text-app-textPrimary text-[13px] flex items-center gap-1.5 transition-colors shadow-sm">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            <span>Refresh</span>
          </button>
        </div>

        <!-- 3 Stat Cards Row -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-4 flex flex-col gap-0.5 shadow-sm">
            <span class="text-[12px] text-amber-500 font-medium">Pending Review</span>
            <span class="text-[24px] font-semibold text-app-textPrimary">${pendingUsers.length}</span>
          </div>
          <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-4 flex flex-col gap-0.5 shadow-sm">
            <span class="text-[12px] text-emerald-500 font-medium">Approved Users</span>
            <span class="text-[24px] font-semibold text-app-textPrimary">${approvedUsers.length}</span>
          </div>
          <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-4 flex flex-col gap-0.5 shadow-sm">
            <span class="text-[12px] text-app-textSecondary font-normal">Total Registered</span>
            <span class="text-[24px] font-semibold text-app-textPrimary">${adminUsersList.length}</span>
          </div>
        </div>

        <!-- Users Table Card -->
        <div class="bg-app-surface border border-app-borderSubtle rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div class="px-5 py-3.5 border-b border-app-borderSubtle flex items-center justify-between">
            <span class="text-[14px] font-medium text-app-textPrimary">Registered Users Queue</span>
            <span class="text-[12px] text-app-textMuted">${adminUsersList.length} records</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-[13px]">
              <thead class="bg-app-input/50 text-app-textMuted uppercase text-[11px] font-normal tracking-wider border-b border-app-borderSubtle">
                <tr>
                  <th class="px-5 py-3">User</th>
                  <th class="px-5 py-3">Role</th>
                  <th class="px-5 py-3">Registered</th>
                  <th class="px-5 py-3">Status</th>
                  <th class="px-5 py-3 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-app-borderSubtle">
                ${adminUsersList.length === 0 ? `
                  <tr>
                    <td colspan="5" class="px-5 py-8 text-center text-app-textMuted">
                      No registered users found. Click refresh.
                    </td>
                  </tr>
                ` : adminUsersList.map(u => renderUserTableRow(u)).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;
}

function renderUserTableRow(u) {
  const isApproved = u.status === 'approved';
  const isPending = u.status === 'pending';
  const isRejected = u.status === 'rejected';

  return `
    <tr class="hover:bg-app-hover/40 transition-colors">
      <td class="px-5 py-3.5">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary font-medium text-xs">
            ${(u.name || u.email)[0].toUpperCase()}
          </div>
          <div class="flex flex-col">
            <span class="font-medium text-app-textPrimary">${escapeHtml(u.name || 'User')}</span>
            <span class="text-[11.5px] text-app-textMuted">${escapeHtml(u.email)}</span>
          </div>
        </div>
      </td>

      <td class="px-5 py-3.5">
        <span class="text-[11.5px] font-normal px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'bg-app-input text-app-textSecondary border border-app-borderSubtle'}">
          ${u.role === 'admin' ? 'Administrator' : 'User'}
        </span>
      </td>

      <td class="px-5 py-3.5 text-app-textMuted text-[12px]">
        ${new Date(u.createdAt).toLocaleDateString()}
      </td>

      <td class="px-5 py-3.5">
        ${isPending ? `
          <span class="text-[11.5px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20 font-medium">Pending</span>
        ` : isApproved ? `
          <span class="text-[11.5px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 font-medium">Approved</span>
        ` : `
          <span class="text-[11.5px] px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/20 font-medium">Rejected</span>
        `}
      </td>

      <td class="px-5 py-3.5 text-right">
        ${u.role === 'admin' ? `
          <span class="text-[11.5px] text-app-textMuted">Owner</span>
        ` : `
          <div class="flex items-center justify-end gap-1.5">
            ${!isApproved ? `
              <button 
                onclick="updateUserStatus('${u.id}', 'approved')" 
                title="Approve User"
                class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11.5px] transition-colors shadow-sm">
                Approve
              </button>
            ` : ''}

            ${!isRejected ? `
              <button 
                onclick="updateUserStatus('${u.id}', 'rejected')" 
                title="Reject / Revoke"
                class="px-2.5 py-1 rounded-lg bg-app-input hover:bg-red-500/20 text-red-500 font-medium text-[11.5px] border border-app-borderSubtle transition-colors">
                Reject
              </button>
            ` : ''}

            <button 
              onclick="deleteUserRecord('${u.id}')" 
              title="Delete User"
              class="p-1 text-app-textMuted hover:text-red-500 rounded-lg transition-colors">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `}
      </td>
    </tr>
  `;
}

async function updateUserStatus(userId, status) {
  try {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showToast(`User marked as ${status}!`);
      fetchAdminUsers();
    } else {
      showToast('Action failed', 'error');
    }
  } catch (e) {
    showToast('Error updating status: ' + e.message, 'error');
  }
}

async function deleteUserRecord(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  try {
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('User record removed.');
      fetchAdminUsers();
    }
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}