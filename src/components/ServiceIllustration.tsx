import React from "react";

/** Lightweight illustrated service artwork; navigation icons deliberately stay unchanged. */
export type ServiceArt = "sanitation" | "water" | "jobs" | "pink-erickshaw" | "health" | "jan-seva-card" | "grievance" | "volunteer" | "blood";
export function serviceArtFor(value: string): ServiceArt | null {
  const s = value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (/sanitation|clean-environment|cleanliness/.test(s)) return "sanitation";
  if (/water/.test(s)) return "water";
  if (/pink|rickshaw|women-empowerment/.test(s)) return "pink-erickshaw";
  if (/job|employment|livelihood/.test(s)) return "jobs";
  if (/blood/.test(s)) return "blood";
  if (/health|medical/.test(s)) return "health";
  if (/jan-seva|^card$/.test(s)) return "jan-seva-card";
  if (/grievance|complaint/.test(s)) return "grievance";
  if (/volunteer/.test(s)) return "volunteer";
  return null;
}
export default function ServiceIllustration({kind, className = "h-16 w-16"}: {kind: ServiceArt; className?: string}) {
  const palette: Record<ServiceArt, [string,string]> = {
    sanitation:["#D7F5E4","#7BCE9B"],water:["#DBF3FF","#83C5ED"],jobs:["#FFF0D5","#E9B16D"],
    "pink-erickshaw":["#FFE0ED","#F2A1C4"],health:["#FFE7E4","#F4A7A1"],
    "jan-seva-card":["#FFF1D6","#F2C77D"],grievance:["#EDF0FA","#B5C4E7"],
    volunteer:["#E1F5E9","#A0DDB6"],blood:["#FFE6E7","#F1A0A6"]
  };
  const [light, shade] = palette[kind];
  return <svg className={className} viewBox="0 0 100 100" role="img" aria-label={kind.replaceAll("-"," ")} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={kind+"-bg"} x2="1" y2="1"><stop stopColor={light}/><stop offset="1" stopColor="#fff"/></linearGradient>
      <linearGradient id={kind+"-obj"} x2=".9" y2="1"><stop stopColor={shade}/><stop offset="1" stopColor={light}/></linearGradient>
      <filter id={kind+"-shadow"} x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="2" floodOpacity=".16"/></filter>
    </defs>
    <rect x="1" y="1" width="98" height="98" rx="22" fill={"url(#"+kind+"-bg)"} />
    <ellipse cx="51" cy="84" rx="31" ry="5" fill="#243B32" opacity=".09"/>
    <g filter={"url(#"+kind+"-shadow)"}>
    {kind==="sanitation" && <><circle cx="29" cy="34" r="12" fill="#F5BE90"/><path d="M17 28Q28 9 42 28L38 31H19Z" fill="#23844D"/><rect x="18" y="47" width="24" height="29" rx="8" fill="#399D60"/><path d="M36 54L48 78M28 76L23 86M36 76L40 86" stroke="#845B3A" strokeWidth="5" strokeLinecap="round"/><path d="M49 38L62 83" stroke="#96632F" strokeWidth="3"/><path d="M53 69L71 72L60 87Z" fill="#DCA34E"/><rect x="60" y="42" width="27" height="38" rx="4" fill="#27985D"/><rect x="57" y="39" width="33" height="6" rx="3" fill="#167C5A"/><path d="M71 54L76 62H66Z M67 67H79" stroke="#D7F5E4" strokeWidth="3" fill="none"/></>}
    {kind==="water" && <><path d="M13 68Q30 54 47 68T88 67V88H13Z" fill="#9BD9B2"/><path d="M31 27H68L73 66H27Z" fill="#3E9ED9"/><ellipse cx="49" cy="27" rx="19" ry="6" fill="#78C5F0"/><path d="M31 31H68M29 60H71" stroke="#287DB6" strokeWidth="3"/><path d="M35 66L29 85M65 66L72 85" stroke="#668C9A" strokeWidth="4"/><path d="M49 37C38 51 43 57 49 57S60 51 49 37Z" fill="#E7F9FF"/><path d="M69 49H85V61H78V69" fill="none" stroke="#A4AEB4" strokeWidth="7" strokeLinecap="round"/><path d="M78 72Q69 82 78 86Q87 82 78 72Z" fill="#54B9EA"/></>}
    {kind==="jobs" && <><rect x="43" y="18" width="45" height="53" rx="5" fill="#FFF9ED"/><rect x="49" y="26" width="31" height="6" rx="2" fill="#E5A450"/><rect x="49" y="38" width="25" height="3" rx="1" fill="#C7B79E"/><rect x="49" y="46" width="30" height="3" rx="1" fill="#C7B79E"/><circle cx="31" cy="37" r="13" fill="#F1B988"/><path d="M18 34Q18 15 35 21Q46 24 43 37L36 29L23 34Z" fill="#45362D"/><path d="M12 72Q12 51 31 51Q51 51 51 72V86H12Z" fill="#448AB3"/><path d="M28 52L31 70L35 52" fill="#fff"/><path d="M31 57L35 70L31 76L27 70Z" fill="#D97706"/><rect x="42" y="68" width="25" height="18" rx="3" fill="#8B5B35"/><path d="M49 68V64H60V68" fill="none" stroke="#8B5B35" strokeWidth="3"/></>}
    {kind==="pink-erickshaw" && <><path d="M36 40H80Q87 40 88 49V69H33Z" fill="#E971A6"/><path d="M40 42H78L82 55H38Z" fill="#FFF0F7"/><path d="M38 56H83" stroke="#B83E79" strokeWidth="3"/><circle cx="46" cy="75" r="9" fill="#374151"/><circle cx="46" cy="75" r="4" fill="#C5CAD1"/><circle cx="79" cy="75" r="9" fill="#374151"/><circle cx="79" cy="75" r="4" fill="#C5CAD1"/><circle cx="24" cy="33" r="11" fill="#F3BB96"/><path d="M13 31Q15 15 29 22L36 33L30 36L22 27Z" fill="#49312F"/><path d="M9 61Q8 44 24 44Q39 44 39 61V80H9Z" fill="#D64C88"/><path d="M15 62L29 71L36 59" fill="none" stroke="#F4BDA1" strokeWidth="5" strokeLinecap="round"/></>}
    {kind==="health" && <><rect x="43" y="21" width="44" height="57" rx="5" fill="#F8FBFF"/><path d="M60 29H69V38H78V47H69V56H60V47H51V38H60Z" fill="#E45454"/><rect x="48" y="64" width="33" height="14" rx="2" fill="#C9E1EC"/><circle cx="29" cy="34" r="12" fill="#F0B68E"/><path d="M17 31Q17 18 29 19Q40 19 41 32L34 26L20 31Z" fill="#413B3C"/><path d="M12 83V58Q13 47 29 47Q45 47 46 58V83Z" fill="#fff"/><path d="M29 49V75M20 51L29 64L38 51" stroke="#91B5C8" strokeWidth="3" fill="none"/><path d="M35 59Q49 58 44 71Q40 77 34 71" fill="none" stroke="#596E7B" strokeWidth="2"/><circle cx="34" cy="71" r="3" fill="#647989"/></>}
    {kind==="jan-seva-card" && <><rect x="15" y="25" width="70" height="49" rx="8" fill="#FFF9ED" stroke="#DBAD62" strokeWidth="2"/><rect x="21" y="31" width="22" height="25" rx="5" fill="#F0D8AA"/><circle cx="32" cy="39" r="5" fill="#C88F59"/><path d="M24 52Q25 43 32 43Q40 43 41 52Z" fill="#B9854E"/><path d="M49 36H76M49 44H69M49 52H75" stroke="#C5A372" strokeWidth="3" strokeLinecap="round"/><path d="M50 63H76" stroke="#167C5A" strokeWidth="5" strokeLinecap="round"/><circle cx="76" cy="71" r="12" fill="#F3C975"/><path d="M71 71L75 75L82 66" stroke="#167C5A" strokeWidth="3" fill="none" strokeLinecap="round"/></>}
    {kind==="grievance" && <><rect x="23" y="18" width="52" height="66" rx="6" fill="#fff" stroke="#9FAED0" strokeWidth="2"/><rect x="35" y="14" width="27" height="10" rx="4" fill="#667FAF"/><path d="M33 40H65M33 50H65M33 60H55" stroke="#AAB7CE" strokeWidth="4" strokeLinecap="round"/><circle cx="71" cy="70" r="16" fill="#E9AD52"/><path d="M71 60V73M71 79V81" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></>}
    {kind==="volunteer" && <><circle cx="36" cy="32" r="11" fill="#F1BA90"/><circle cx="65" cy="35" r="10" fill="#DDA47B"/><path d="M15 77Q14 50 36 50Q56 50 56 77Z" fill="#269765"/><path d="M49 78Q49 53 65 53Q85 53 85 78Z" fill="#E7AA55"/><path d="M39 60L51 72L63 60" fill="none" stroke="#F5C29B" strokeWidth="7" strokeLinecap="round"/><path d="M46 24Q51 15 58 24Q65 16 70 25Q71 34 58 43Q44 33 46 24Z" fill="#E96E79"/></>}
    {kind==="blood" && <><path d="M50 14C41 31 23 46 23 62A27 27 0 0 0 77 62C77 46 59 31 50 14Z" fill="#D94E57"/><path d="M50 30C45 42 35 52 35 63" fill="none" stroke="#F6B3B6" strokeWidth="6" strokeLinecap="round"/><path d="M48 50H56V58H64V66H56V74H48V66H40V58H48Z" fill="#fff"/></>}
    </g>
  </svg>;
}
