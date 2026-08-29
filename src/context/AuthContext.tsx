import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

export type UserRole = "guest" | "citizen" | "volunteer" | "donor" | "admin" | "super_admin";
export interface User { id:string; name:string; username?:string; phone?:string; email?:string; avatar?:string; role:UserRole; displayName?:string; janSevaCardNo?:string; registration_number?:string; janSevaCardStatus?:"none"|"pending"|"approved"|"rejected"; gender?:string; dob?:string; address?:string; isVolunteer?:boolean; isDonor?:boolean; volunteerData?:any; blood_group?:string; interests?:string[]; onboardingCompleted?:boolean; points?:number; badges?:number; cover?:string; }
interface AuthContextType { user:User|null; token:string|null; isLoading:boolean; isAuthenticated:boolean; language:"en"|"hi"; setLanguage:(lang:"en"|"hi")=>void; login:(userData:Partial<User>,token?:string,remember?:boolean)=>Promise<void>; loginAsGuest:()=>Promise<void>; logout:()=>Promise<void>; updateUser:(updates:Partial<User>)=>Promise<boolean>; completeOnboarding:(interests:string[])=>Promise<void>; hasAdminAccess:boolean; }

const AuthContext=createContext<AuthContextType|null>(null);
const STORAGE_KEY="@rpf_user", TOKEN_KEY="@rpf_token", LANG_KEY="@rpf_lang";
const API_BASE=Capacitor.isNativePlatform()?"https://appapi.therpfoundation.org":"";
const apiUrl=(path:string)=>`${API_BASE}${path}`;

const setPersistentItem=async(key:string,value:string)=>{
  localStorage.setItem(key,value);
  if(Capacitor.isNativePlatform()) {
    try {
      const {Preferences}=await import('@capacitor/preferences');
      await Preferences.set({key,value});
    } catch(e) { console.error('Preferences write failed:',e); }
  }
};
const getPersistentItem=async(key:string):Promise<string|null>=>{
  if(Capacitor.isNativePlatform()) {
    try {
      const {Preferences}=await import('@capacitor/preferences');
      const {value}=await Preferences.get({key});
      if(value!==null)return value;
    } catch(e) { console.error('Preferences read failed:',e); }
  }
  return localStorage.getItem(key);
};
const removePersistentItem=async(key:string)=>{
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
  if(Capacitor.isNativePlatform()) {
    try {
      const {Preferences}=await import('@capacitor/preferences');
      await Preferences.remove({key});
    } catch(e) { console.error('Preferences remove failed:',e); }
  }
};

export function AuthProvider({children}:{children:React.ReactNode}){
  const[user,setUser]=useState<User|null>(null);
  const[token,setToken]=useState<string|null>(null);
  const[language,setLanguageState]=useState<'en'|'hi'>('en');
  const[isLoading,setIsLoading]=useState(true);

  const clearSession=useCallback(async()=>{
    await removePersistentItem(STORAGE_KEY);
    await removePersistentItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  },[]);

  const saveUser=useCallback(async(u:User,remember=true)=>{
    if(remember) await setPersistentItem(STORAGE_KEY,JSON.stringify(u));
    else sessionStorage.setItem(STORAGE_KEY,JSON.stringify(u));
    setUser(u);
  },[]);

  async function loadUser(){
    try {
      const stored=(await getPersistentItem(STORAGE_KEY))??sessionStorage.getItem(STORAGE_KEY);
      const storedToken=(await getPersistentItem(TOKEN_KEY))??sessionStorage.getItem(TOKEN_KEY);
      if(!stored){
        setToken(null);
        setUser(null);
        return;
      }
      const parsed:User=JSON.parse(stored);
      setToken(storedToken);
      setUser(parsed);
      if(storedToken){
        try {
          const res=await fetch(apiUrl('/api/auth/me'),{headers:{Authorization:`Bearer ${storedToken}`}});
          if(res.ok){
            const data=await res.json();
            if(data.success&&data.user){
              const fresh=data.user as Partial<User>;
              const merged={...parsed,...fresh,role:(fresh.role as UserRole)??parsed.role,name:fresh.name??parsed.name,displayName:fresh.displayName??fresh.name??parsed.name,janSevaCardStatus:(fresh.janSevaCardStatus as User['janSevaCardStatus'])||parsed.janSevaCardStatus||'none'} as User;
              await setPersistentItem(STORAGE_KEY,JSON.stringify(merged));
              setUser(merged);
            }
          }
        } catch {
          /* cached session remains authoritative; network or refresh failures must not force logout */
        }
      }
    } catch {
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(()=>{
    void loadUser();
    const stored=localStorage.getItem(LANG_KEY) as 'en'|'hi'|null;
    if(stored==='en'||stored==='hi')setLanguageState(stored);
  },[]);

  const setLanguage=(lang:'en'|'hi')=>{
    localStorage.setItem(LANG_KEY,lang);
    setLanguageState(lang);
  };
  const login=useCallback(async(userData:Partial<User>,tokenArg?:string,remember=true)=>{
    if(tokenArg){
      if(remember)await setPersistentItem(TOKEN_KEY,tokenArg);
      else sessionStorage.setItem(TOKEN_KEY,tokenArg);
      setToken(tokenArg);
    } else {
      setToken(null);
      await removePersistentItem(TOKEN_KEY);
    }
    await saveUser({janSevaCardStatus:'none',...userData} as User,remember);
  },[saveUser]);
  const loginAsGuest=useCallback(async()=>{
    const res=await fetch(apiUrl('/api/auth/login'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'guest'})});
    if(!res.ok)throw new Error(`Backend guest login failed (${res.status})`);
    const data=await res.json();
    if(!data.success||!data.user)throw new Error(data.error||'Backend guest login failed');
    if(data.token){await setPersistentItem(TOKEN_KEY,data.token);setToken(data.token);}
    await saveUser({janSevaCardStatus:'none',...data.user},true);
  },[saveUser]);
  const logout=useCallback(async()=>{await clearSession();},[clearSession]);
  const updateUser=useCallback(async(updates:Partial<User>)=>{
    if(!user)return false;
    const response=await fetch(apiUrl(`/api/users/${user.id}/update`),{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(updates)});
    const data=await response.json();
    if(!response.ok||!data.success)throw new Error(data.error||'User update failed');
    await saveUser({...user,...updates,...(data.user||{})});
    return true;
  },[user,token,saveUser]);
  const completeOnboarding=useCallback(async(interests:string[])=>{
    if(!user)return;
    const response=await fetch(apiUrl(`/api/users/${user.id}/update`),{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({interests,onboardingCompleted:true})});
    const data=await response.json();
    if(!response.ok||!data.success)throw new Error(data.error||'Onboarding update failed');
    await saveUser({...user,interests,onboardingCompleted:true,...(data.user||{})});
  },[user,token,saveUser]);
  const hasAdminAccess=!!user&&(user.role==='admin'||user.role==='super_admin');

  return <AuthContext.Provider value={{token,user,isLoading,isAuthenticated:!!user,language,setLanguage,login,loginAsGuest,logout,updateUser,completeOnboarding,hasAdminAccess}}>{children}</AuthContext.Provider>;
}

export function useAuth(){
  const ctx=useContext(AuthContext);
  if(!ctx)throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
