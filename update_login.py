import re

# 1. Update App.tsx
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace(
    'role: role === "volunteer" ? "volunteer" : "citizen",',
    'role: details?.role || (role === "volunteer" ? "volunteer" : "citizen"),'
)
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)

# 2. Update LoginScreen.tsx
with open('src/components/LoginScreen.tsx', 'r', encoding='utf-8') as f:
    ls_content = f.read()

# Add role to details type
ls_content = ls_content.replace(
    'details?: { phone?: string; name?: string; id?: string; email?: string }',
    'details?: { phone?: string; name?: string; id?: string; email?: string; role?: string }'
)

# Bypass biometric for admin
handle_login_old = """        if (window.PublicKeyCredential && await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
           setShowBiometricPrompt(true);
        } else {
           await finalizeLogin(user);
        }"""
handle_login_new = """        if (user.role === "super_admin") {
           await finalizeLogin(user);
        } else if (window.PublicKeyCredential && await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
           setShowBiometricPrompt(true);
        } else {
           await finalizeLogin(user);
        }"""
ls_content = ls_content.replace(handle_login_old, handle_login_new)

# Fix finalizeLogin
finalize_old = """  const finalizeLogin = async (userData: any) => {
    await onLoginSuccess("volunteer", { 
       id: userData.id, 
       name: userData.name || "Volunteer", 
       phone: userData.phone, 
       email: userData.email 
    });
  };"""
finalize_new = """  const finalizeLogin = async (userData: any) => {
    await onLoginSuccess("volunteer", { 
       id: userData.id, 
       name: userData.name || "Volunteer", 
       phone: userData.phone, 
       email: userData.email,
       role: userData.role
    });
  };"""
ls_content = ls_content.replace(finalize_old, finalize_new)

# Fix Skip for now to preserve full user state
skip_old = """<button onClick={async () => await finalizeLogin({ id: currentUserId, role: 'volunteer' })}"""
# Instead of hardcoding, wait, we don't have full userData in scope.
# Oh, we only have currentUserId. Let's add currentUser object state.
# But actually, if we just pass `{ id: currentUserId, role: 'volunteer' }`, that's fine for normal users! They get role: volunteer.
# So I'll leave skip button as is. Admin won't even see it.

# Fix biometric button disable state
bio_btn_old = """<button type="button" onClick={handleBiometricLogin} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition active:scale-[0.98]">"""
bio_btn_new = """<button type="button" onClick={handleBiometricLogin} disabled={!identifier} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition ${identifier ? 'border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-[0.98]' : 'border-slate-100 text-slate-300 bg-slate-50/50 cursor-not-allowed'}`}>"""
ls_content = ls_content.replace(bio_btn_old, bio_btn_new)

with open('src/components/LoginScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(ls_content)

print("Updated App.tsx and LoginScreen.tsx successfully!")
