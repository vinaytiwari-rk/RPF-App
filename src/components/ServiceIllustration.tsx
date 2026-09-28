import React from "react";

/** Lightweight illustrated service artwork; navigation icons deliberately stay unchanged. */
export type ServiceArt = "sanitation" | "water" | "jobs" | "pink-erickshaw" | "health" | "jan-seva-card" | "grievance" | "volunteer" | "blood" | "radio" | "epaper" | "directory" | "university" | "fact-check" | "disaster" | "youth" | "nation" | "women-safety" | "live-tv";
export function serviceArtFor(value: string): ServiceArt | null {
  const s = value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (/internet-radio|^radio$/.test(s)) return "radio";
  if (/epaper|newspaper/.test(s)) return "epaper";
  if (/directory/.test(s)) return "directory";
  if (/university/.test(s)) return "university";
  if (/fact-check/.test(s)) return "fact-check";
  if (/disaster/.test(s)) return "disaster";
  if (/youth/.test(s)) return "youth";
  if (/nation/.test(s)) return "nation";
  if (/women-safety/.test(s)) return "women-safety";
  if (/live-tv/.test(s)) return "live-tv";
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
    volunteer:["#E1F5E9","#A0DDB6"],blood:["#FFE6E7","#F1A0A6"],
    radio:["#E0F5EA","#7ACCA5"],epaper:["#E9F4FF","#8DBBDD"],directory:["#FFF0D9","#E3B575"],university:["#EAF0FC","#99AFD7"],
    "fact-check":["#E4F7EE","#86D0AD"],disaster:["#FFF0DB","#E9BB76"],youth:["#E6F6F1","#86CDB9"],nation:["#FFF0D9","#E9BB76"],
    "women-safety":["#FFE8EC","#ECA5B7"],"live-tv":["#E9F0FC","#A6B6DE"]
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
    {kind==="radio" && <><rect x="18" y="35" width="65" height="43" rx="9" fill="#278B66"/><rect x="25" y="43" width="34" height="19" rx="4" fill="#C9F5E3"/><path d="M23 34L69 18" stroke="#506C66" strokeWidth="4" strokeLinecap="round"/><circle cx="70" cy="56" r="9" fill="#E8D2A0"/><circle cx="70" cy="56" r="4" fill="#9C714A"/><path d="M28 69H52" stroke="#C9F5E3" strokeWidth="3" strokeLinecap="round"/></>}
    {kind==="epaper" && <><rect x="25" y="19" width="53" height="63" rx="4" fill="#D2E5F5" transform="rotate(7 50 50)"/><rect x="18" y="16" width="54" height="65" rx="4" fill="#fff" stroke="#90B2CC" strokeWidth="2"/><rect x="24" y="23" width="42" height="9" rx="2" fill="#377B9F"/><rect x="24" y="38" width="20" height="21" rx="2" fill="#B7D9E7"/><path d="M48 39H65M48 46H65M48 53H62M25 65H65M25 71H59" stroke="#8BAABB" strokeWidth="3" strokeLinecap="round"/></>}
    {kind==="directory" && <><path d="M50 26Q33 15 18 24V73Q35 66 50 78Q65 66 82 73V24Q65 15 50 26Z" fill="#D4A55D" stroke="#A67434" strokeWidth="2"/><path d="M50 29Q35 20 23 27V66Q39 62 50 72Z" fill="#FFF8E9"/><path d="M50 29Q65 20 77 27V66Q61 62 50 72Z" fill="#FFF8E9"/><path d="M29 37H43M29 45H43M57 37H71M57 45H71" stroke="#D3B17C" strokeWidth="2"/></>}
    {kind==="university" && <><path d="M13 43L50 22L87 43L50 63Z" fill="#374B72"/><path d="M29 54V70Q50 85 71 70V54L50 66Z" fill="#6386B2"/><path d="M84 44V69" stroke="#C99D47" strokeWidth="3"/><circle cx="84" cy="73" r="5" fill="#E8B35B"/><path d="M33 75Q50 84 67 75" fill="none" stroke="#A7C6DF" strokeWidth="3"/></>}
    {kind==="fact-check" && <><path d="M50 15L77 25V49Q75 70 50 84Q25 70 23 49V25Z" fill="#4AA981" stroke="#257956" strokeWidth="3"/><path d="M36 48L46 59L65 38" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="75" cy="74" r="13" fill="#E5C579"/><path d="M84 83L92 91" stroke="#B48A46" strokeWidth="5" strokeLinecap="round"/></>}
    {kind==="disaster" && <><path d="M16 69L50 29L84 69Z" fill="#D4B18B"/><path d="M25 68L50 38L75 68Z" fill="#FFF4E4"/><path d="M44 68V54H57V68" fill="#8C745E"/><path d="M13 75Q25 66 38 75T63 75T89 75" fill="none" stroke="#4BADD2" strokeWidth="6" strokeLinecap="round"/><path d="M50 15L59 29H41Z" fill="#E78C38"/><path d="M50 19V24" stroke="#fff" strokeWidth="2"/></>}
    {kind==="youth" && <><circle cx="34" cy="34" r="11" fill="#F3BB94"/><path d="M17 76Q16 50 34 50Q52 50 52 76Z" fill="#3A9D80"/><path d="M54 28L72 19L83 39L66 48Z" fill="#DFA65C"/><path d="M61 41L47 60" stroke="#8D6D4C" strokeWidth="4"/><path d="M54 66L68 52L79 66L68 80Z" fill="#E7B969"/><path d="M66 59V73M60 66H73" stroke="#fff" strokeWidth="3"/></>}
    {kind==="nation" && <><path d="M28 82V23" stroke="#98734E" strokeWidth="5" strokeLinecap="round"/><path d="M31 25Q51 15 76 27V62Q53 52 31 61Z" fill="#fff"/><path d="M31 25Q53 15 76 27V39Q53 28 31 38Z" fill="#F1A94B"/><path d="M31 49Q53 39 76 51V62Q53 52 31 61Z" fill="#4AA679"/><circle cx="54" cy="44" r="6" fill="none" stroke="#557EA3" strokeWidth="2"/><path d="M15 82H44" stroke="#98734E" strokeWidth="5" strokeLinecap="round"/></>}
    {kind==="women-safety" && <><path d="M50 15L78 26V48Q76 69 50 84Q24 69 22 48V26Z" fill="#E58FA9" stroke="#C55E7D" strokeWidth="3"/><circle cx="50" cy="43" r="10" fill="#F9D6B6"/><path d="M39 43Q36 28 50 30Q63 30 61 43L55 37L43 42Z" fill="#593F48"/><path d="M34 68Q35 52 50 52Q65 52 66 68" fill="#FFF1F3"/><path d="M45 64L50 69L58 59" fill="none" stroke="#B7496B" strokeWidth="3"/></>}
    {kind==="live-tv" && <><rect x="15" y="29" width="70" height="48" rx="8" fill="#516D9E"/><rect x="22" y="36" width="56" height="32" rx="4" fill="#C4E0F0"/><path d="M45 42L61 52L45 62Z" fill="#D97706"/><path d="M35 22L50 30L65 22" fill="none" stroke="#516D9E" strokeWidth="3"/><path d="M39 80H61" stroke="#516D9E" strokeWidth="4" strokeLinecap="round"/></>}
    {kind==="blood" && <><path d="M50 14C41 31 23 46 23 62A27 27 0 0 0 77 62C77 46 59 31 50 14Z" fill="#D94E57"/><path d="M50 30C45 42 35 52 35 63" fill="none" stroke="#F6B3B6" strokeWidth="6" strokeLinecap="round"/><path d="M48 50H56V58H64V66H56V74H48V66H40V58H48Z" fill="#fff"/></>}
    </g>
  </svg>;
}
