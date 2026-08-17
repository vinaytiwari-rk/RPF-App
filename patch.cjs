const fs = require('fs');
let c = fs.readFileSync('src/components/VolunteerRegistrationWizard.tsx', 'utf8');
c = c.replace(/import \{([^}]+)\} from 'lucide-react';/, "import {$1, Eye, EyeOff} from 'lucide-react';");
c = c.replace(/const\[password,setPassword\]=useState\(''\),\[confirmPassword,setConfirmPassword\]=useState\(''\);/, "const[password,setPassword]=useState(''),[confirmPassword,setConfirmPassword]=useState(''),[showPassword,setShowPassword]=useState(false);");
c = c.replace(/uppercase">([^<]+)</g, 'uppercase">$1 <span className="text-red-600 ml-0.5">*</span><');

c = c.replace(
  /<input required type="password" value=\{password\} onChange=\{e=>setPassword\(e.target.value\)\} className=\{input\}\/>/g,
  '<div className="relative"><input required type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} className={input}/><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-[10px] text-slate-400">{showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div>'
);

c = c.replace(
  /<input required type="password" value=\{confirmPassword\} onChange=\{e=>setConfirmPassword\(e.target.value\)\} className=\{input\}\/>/g,
  '<div className="relative"><input required type={showPassword?"text":"password"} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className={input}/><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-[10px] text-slate-400">{showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div>'
);

fs.writeFileSync('src/components/VolunteerRegistrationWizard.tsx', c);
