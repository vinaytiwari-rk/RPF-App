import re

with open('src/context/AuthContext.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the loadUser function
loadUser_regex = re.compile(r'const loadUser = async \(\) => \{.*?(?=\s*const loadLanguage)', re.DOTALL)

new_loadUser = """const loadUser = async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const token = localStorage.getItem("@rpf_token");
      
      if (stored && token) {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);

        // Fetch fresh user data with JWT
        try {
          const res = await fetch(`/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              const fresh = data.user as Partial<User>;
              const merged: User = {
                ...parsed,
                role: (fresh.role as UserRole) ?? parsed.role,
                name: fresh.name ?? parsed.name,
                displayName: fresh.displayName ?? fresh.name ?? parsed.name,
                janSevaCardStatus: fresh.janSevaCardStatus ?? parsed.janSevaCardStatus,
                janSevaCardNo: fresh.janSevaCardNo ?? parsed.janSevaCardNo,
                points: fresh.points ?? parsed.points,
                badges: fresh.badges ?? parsed.badges,
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              setUser(merged);
            } else {
               // Invalid token or user not found
               localStorage.removeItem(STORAGE_KEY);
               localStorage.removeItem("@rpf_token");
               setUser(null);
            }
          } else {
             // Expired token or auth error
             localStorage.removeItem(STORAGE_KEY);
             localStorage.removeItem("@rpf_token");
             setUser(null);
          }
        } catch {
          // Backend unreachable - use cached user silently
        }
      } else {
        // No token, ensure clean state
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("@rpf_token");
      }
    } catch {
      // Corrupted storage - clear it
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("@rpf_token");
    } finally {
      setIsLoading(false);
    }
  };
"""

content = loadUser_regex.sub(new_loadUser, content)

# Inject the token storing logic into the logout function
logout_regex = re.compile(r'const logout = async \(\) => \{')
new_logout = """const logout = async () => {
    try {
      const token = localStorage.getItem("@rpf_token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (e) {}
    localStorage.removeItem("@rpf_token");
"""
content = logout_regex.sub(new_logout, content)

# Note: We aren't fully changing `login` here because `login` typically takes the whole user object from LoginScreen.
# Wait, let's look at `login` method.
login_regex = re.compile(r'const login = async \(userData: Partial<User>\) => \{')
new_login = """const login = async (userData: Partial<User>, token?: string) => {
    if (token) {
      localStorage.setItem("@rpf_token", token);
    }
"""
content = content.replace("const login = async (userData: Partial<User>) => {", new_login)
content = content.replace("login: (userData: Partial<User>) => Promise<void>;", "login: (userData: Partial<User>, token?: string) => Promise<void>;")


with open('src/context/AuthContext.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("AuthContext patched")
