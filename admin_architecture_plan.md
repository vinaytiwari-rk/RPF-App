# 🏰 Supreme Command Center (New Admin Hub) - Architectural Plan

App ke naye 5-pillar structure (**Home, Impact, Live TV, Explore, aur Profile**) ke aadhar par naye Admin Hub ka layout aur architecture puri tarah se modular aur organized banaya jayega. 

Pehle ki tarah saare actions (Add, Edit, Delete, Approve) wahi rahenge, lekin unhe app ke flow ke hisaab se categorize kiya jayega taaki Super Admin ko content manage karne me aasani ho.

---

## 🎨 UI/UX Layout Structure
Admin Hub me ek **Sidebar Menu** hoga jisme app ke 5 main tabs reflect honge. Har tab ke andar us section se related saara control hoga.

### 1. 🏠 Home (Main CMS)
Yahan se app ke Home screen ka har ek section control kiya jayega:
* **Greetings & Weather:** Welcome message aur location-based settings.
* **Live Market & Panchang:** API sources, default mandi prices, fuel updates.
* **Thought of the Day:** Daily quotes add/edit karna.
* **News Tickers (Marquee):** Breaking news ya updates (Hindi/English) set karna.
* **Carousel Management:** "Discover RP Foundation" me banner images, titles aur unke links manage karna.
* **Vision & Leadership:** Founder messages aur roadmap updates.
* **Quick Access Grid:** Jan Seva Card, Healthcare, Employment aadi icons ko show/hide ya reorder karna.

### 2. ❤️ Impact (Reels & Ground Action)
Volunteer aur foundation ke ground level work ko manage karne ka center:
* **Reels / Videos Manager:** Naye short videos/reels add karna, purane delete ya hide karna.
* **Community & Care:** Field initiatives aur campaigns ki report manage karna.
* **Duty Tracker & Reports:** Volunteers dwara submit ki gayi duty reports ko review aur approve karna.
* **Impact Stats:** Total volunteers, beneficiaries aur activities ka data update karna.

### 3. 📺 Live TV & Radio (Media Control)
App ke entertainment aur media section ko control karne ka dedicated hub:
* **Live TV Channels:** Naye TV channels add karna, logo upload karna, aur m3u8/YouTube streaming links update/fix karna.
* **Internet Radio Stations:** Radio stations ki list manage karna (Add/Edit/Delete).
* **Category Management:** TV aur Radio ke liye categories (News, Devotional, Regional) manage karna.

### 4. 🧭 Explore (Services & Utilities)
App ke sabhi tools aur public services ka backend:
* **Core Services:** Healthcare (Camps, Medicine), Employment (Jobs upload), Blood Network aur Donations ki requests manage karna.
* **Grievance System:** Public complaints ko dekhna, unka status (Pending, Resolved) update karna aur reply karna.
* **Utilities Management:** SOS numbers, E-paper links, aur Fact Check database ko update karna.

### 5. 👤 Profile (User & Security Hub)
Yeh sabse critical admin section hoga jahan users aur roles manage honge:
* **Jan Seva Card Desk:** Naye cards ki requests dekhna, documents verify karna aur unhe Approve/Reject karna.
* **User Management:** Registered users ki list dekhna, kisi ko "Volunteer", "Admin" ya "Super Admin" ka role assign ya revoke karna.
* **Certificates:** Volunteers ko badges aur certificates issue karna.
* **App Settings & Legal:** App ki Privacy Policy, Terms & Conditions, aur About section ka text update karna.

---

## ⚙️ Backend Architecture (API Strategy)
Frontend ke saath-saath backend API architecture bhi isi 5-pillar structure me refactor kiya jayega taaki code maintainable rahe.

* \`/api/admin/home/...\` (Carousels, Tickers, Quotes)
* \`/api/admin/impact/...\` (Reels, Field Reports, Duty)
* \`/api/admin/media/...\` (Live TV, Radio Streams)
* \`/api/admin/explore/...\` (Grievances, Services, Links)
* \`/api/admin/users/...\` (Roles, Jan Seva Card Approvals)

## 🚀 Execution Strategy
1. **Step 1:** Pehle Naye Layout/Sidebar ka UI component banayenge jo in 5 categories me divided hoga.
2. **Step 2:** Existing Admin components (jaise Carousel Manager, Instagram Reels manager, Jan Seva Card approvals) ko utha kar unke respective naye tabs me shift karenge.
3. **Step 3:** Jo cheezein abhi admin me missing hain (jaise Live TV stream management), unke naye forms banayenge.
4. **Step 4:** API routes ko secure aur modular banayenge taaki sirf Super Admin / Admin in changes ko apply kar sakein.
