import React, { useState } from "react";
import { 
  Code, Binary, Hash, Key, ShieldCheck, 
  Copy, Download, RefreshCw, AlertCircle, Check, 
  Terminal, Globe, Lock, Cpu, Database
} from "lucide-react";

interface Props {
  toolId: string;
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

export default function DevEncodingToolsEngine({ toolId, isHi, downloadBlob, copyToClipboard }: Props) {
  const [inputText, setInputText] = useState("");
  const [secondText, setSecondText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Extra inputs
  const [shiftKey, setShiftKey] = useState(3);
  const [secretKey, setSecretKey] = useState("");
  const [pwdLength, setPwdLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  // Self-contained CRC32 implementation
  const calcCRC32 = (str: string): string => {
    let crc = 0 ^ (-1);
    for (let i = 0; i < str.length; i++) {
      let byte = str.charCodeAt(i);
      for (let j = 0; j < 8; j++) {
        const mask = -(byte & 1);
        crc = (crc >>> 1) ^ (0xEDB88320 & mask);
        byte = byte >>> 1;
      }
    }
    return ((crc ^ (-1)) >>> 0).toString(16).toUpperCase().padStart(8, "0");
  };

  // Self-contained MD5 implementation
  const calcMD5 = (string: string): string => {
    function rotateLeft(lValue: number, iShiftBits: number) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    function addUnsigned(lX: number, lY: number) {
      const lX4 = (lX & 0x40000000);
      const lY4 = (lY & 0x40000000);
      const lX8 = (lX & 0x80000000);
      const lY8 = (lY & 0x80000000);
      const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
      if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
      if (lX4 | lY4) {
        if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
        else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ lX8 ^ lY8);
      }
    }
    function F(x: number, y: number, z: number) { return (x & y) | ((~x) & z); }
    function G(x: number, y: number, z: number) { return (x & z) | (y & (~z)); }
    function H(x: number, y: number, z: number) { return (x ^ y ^ z); }
    function I(x: number, y: number, z: number) { return (y ^ (x | (~z))); }

    function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
      a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
      a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
      a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
      a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    const words: number[] = [];
    const messageLength = string.length;
    for (let i = 0; i < messageLength; i++) {
      words[i >> 2] |= (string.charCodeAt(i) & 0xFF) << ((i % 4) * 8);
    }
    words[messageLength >> 2] |= 0x80 << ((messageLength % 4) * 8);
    words[(((messageLength + 8) >> 6) * 16) + 14] = messageLength * 8;

    let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
    for (let i = 0; i < words.length; i += 16) {
      const AA = a, BB = b, CC = c, DD = d;
      a = FF(a, b, c, d, words[i + 0], 7, 0xD76AA478);
      d = FF(d, a, b, c, words[i + 1], 12, 0xE8C7B756);
      c = FF(c, d, a, b, words[i + 2], 17, 0x242070DB);
      b = FF(b, c, d, a, words[i + 3], 22, 0xC1BDCEEE);
      a = FF(a, b, c, d, words[i + 4], 7, 0xF57C0FAF);
      d = FF(d, a, b, c, words[i + 5], 12, 0x4787C62A);
      c = FF(c, d, a, b, words[i + 6], 17, 0xA8304613);
      b = FF(b, c, d, a, words[i + 7], 22, 0xFD469501);
      a = FF(a, b, c, d, words[i + 8], 7, 0x698098D8);
      d = FF(d, a, b, c, words[i + 9], 12, 0x8B44F7AF);
      c = FF(c, d, a, b, words[i + 10], 17, 0xFFFF5BB1);
      b = FF(b, c, d, a, words[i + 11], 22, 0x895CD7BE);
      a = FF(a, b, c, d, words[i + 12], 7, 0x6B901122);
      d = FF(d, a, b, c, words[i + 13], 12, 0xFD987193);
      c = FF(c, d, a, b, words[i + 14], 17, 0xA679438E);
      b = FF(b, c, d, a, words[i + 15], 22, 0x49B40821);

      a = GG(a, b, c, d, words[i + 1], 5, 0xF61E2562);
      d = GG(d, a, b, c, words[i + 6], 9, 0xC040B340);
      c = GG(c, d, a, b, words[i + 11], 14, 0x265E5A51);
      b = GG(b, c, d, a, words[i + 0], 20, 0xE9B6C7AA);
      a = GG(a, b, c, d, words[i + 5], 5, 0xD62F105D);
      d = GG(d, a, b, c, words[i + 10], 9, 0x02441453);
      c = GG(c, d, a, b, words[i + 15], 14, 0xD8A1E681);
      b = GG(b, c, d, a, words[i + 4], 20, 0xE7D3FBC8);
      a = GG(a, b, c, d, words[i + 9], 5, 0x21E1CDE6);
      d = GG(d, a, b, c, words[i + 14], 9, 0xC33707D6);
      c = GG(c, d, a, b, words[i + 3], 14, 0xF4D50D87);
      b = GG(b, c, d, a, words[i + 8], 20, 0x455A14ED);
      a = GG(a, b, c, d, words[i + 13], 5, 0xA9E3E905);
      d = GG(d, a, b, c, words[i + 2], 9, 0xFCEFA3F8);
      c = GG(c, d, a, b, words[i + 7], 14, 0x676F02D9);
      b = GG(b, c, d, a, words[i + 12], 20, 0x8D2A4C8A);

      a = HH(a, b, c, d, words[i + 5], 4, 0xFFFA3942);
      d = HH(d, a, b, c, words[i + 8], 11, 0x8771F681);
      c = HH(c, d, a, b, words[i + 11], 16, 0x6D9D6122);
      b = HH(b, c, d, a, words[i + 14], 23, 0xFDE5380C);
      a = HH(a, b, c, d, words[i + 1], 4, 0xA4BEEA44);
      d = HH(d, a, b, c, words[i + 4], 11, 0x4BDECFA9);
      c = HH(c, d, a, b, words[i + 7], 16, 0xF6BB4B60);
      b = HH(b, c, d, a, words[i + 10], 23, 0xBEBFBC70);
      a = HH(a, b, c, d, words[i + 13], 4, 0x289B7EC6);
      d = HH(d, a, b, c, words[i + 0], 11, 0xEAA127FA);
      c = HH(c, d, a, b, words[i + 3], 16, 0xD4EF3085);
      b = HH(b, c, d, a, words[i + 6], 23, 0x04881D05);
      a = HH(a, b, c, d, words[i + 9], 4, 0xD9D4D039);
      d = HH(d, a, b, c, words[i + 12], 11, 0xE6DB99E5);
      c = HH(c, d, a, b, words[i + 15], 16, 0x1FA27CF8);
      b = HH(b, c, d, a, words[i + 2], 23, 0xC4AC5665);

      a = II(a, b, c, d, words[i + 0], 6, 0xF4292244);
      d = II(d, a, b, c, words[i + 7], 10, 0x432AFF97);
      c = II(c, d, a, b, words[i + 14], 15, 0xAB9423A7);
      b = II(b, c, d, a, words[i + 5], 21, 0xFC93A039);
      a = II(a, b, c, d, words[i + 12], 6, 0x655B59C3);
      d = II(d, a, b, c, words[i + 3], 10, 0x8F0CCC92);
      c = II(c, d, a, b, words[i + 10], 15, 0xFFEFF47D);
      b = II(b, c, d, a, words[i + 1], 21, 0x85845DD1);
      a = II(a, b, c, d, words[i + 8], 6, 0x6FA87E4F);
      d = II(d, a, b, c, words[i + 15], 10, 0xFE2CE6E0);
      c = II(c, d, a, b, words[i + 6], 15, 0xA3014314);
      b = II(b, c, d, a, words[i + 13], 21, 0x4E0811A1);
      a = II(a, b, c, d, words[i + 4], 6, 0xF7537E82);
      d = II(d, a, b, c, words[i + 11], 10, 0xBD3AF235);
      c = II(c, d, a, b, words[i + 2], 15, 0x2AD7D2BB);
      b = II(b, c, d, a, words[i + 9], 21, 0xEB86D391);

      a = addUnsigned(a, AA);
      b = addUnsigned(b, BB);
      c = addUnsigned(c, CC);
      d = addUnsigned(d, DD);
    }
    const hexWord = (num: number) => {
      let str = "";
      for (let j = 0; j <= 3; j++) {
        str += ((num >> (j * 8)) & 255).toString(16).padStart(2, "0");
      }
      return str;
    };
    return (hexWord(a) + hexWord(b) + hexWord(c) + hexWord(d)).toLowerCase();
  };

  const processTool = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      let result = "";

      switch (toolId) {
        case "dev_base64_encode": {
          result = btoa(unescape(encodeURIComponent(inputText)));
          break;
        }

        case "dev_base64_decode": {
          result = decodeURIComponent(escape(atob(inputText.trim())));
          break;
        }

        case "dev_base64url_encode": {
          const b64 = btoa(unescape(encodeURIComponent(inputText)));
          result = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
          break;
        }

        case "dev_base64url_decode": {
          let b64 = inputText.trim().replace(/-/g, "+").replace(/_/g, "/");
          while (b64.length % 4) b64 += "=";
          result = decodeURIComponent(escape(atob(b64)));
          break;
        }

        case "dev_hex_encode": {
          result = Array.from(new TextEncoder().encode(inputText))
            .map(b => b.toString(16).padStart(2, "0"))
            .join(" ");
          break;
        }

        case "dev_hex_decode": {
          const clean = inputText.replace(/\s+/g, "");
          const bytes = new Uint8Array(clean.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
          result = new TextDecoder().decode(bytes);
          break;
        }

        case "dev_binary_encode": {
          result = Array.from(new TextEncoder().encode(inputText))
            .map(b => b.toString(2).padStart(8, "0"))
            .join(" ");
          break;
        }

        case "dev_binary_decode": {
          const clean = inputText.trim().split(/\s+/);
          const bytes = new Uint8Array(clean.map(bin => parseInt(bin, 2)));
          result = new TextDecoder().decode(bytes);
          break;
        }

        case "dev_ascii_to_hex": {
          result = Array.from(inputText).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" ");
          break;
        }

        case "dev_hex_to_ascii": {
          const hexes = inputText.trim().split(/\s+/);
          result = hexes.map(h => String.fromCharCode(parseInt(h, 16))).join("");
          break;
        }

        case "dev_decimal_to_binary": {
          const num = BigInt(inputText.trim());
          result = num.toString(2);
          break;
        }

        case "dev_binary_to_decimal": {
          const clean = inputText.trim().replace(/\s+/g, "");
          const num = BigInt("0b" + clean);
          result = num.toString(10);
          break;
        }

        case "dev_rot13": {
          result = inputText.replace(/[a-zA-Z]/g, c => {
            const code = c.charCodeAt(0);
            const base = code >= 97 ? 97 : 65;
            return String.fromCharCode(((code - base + 13) % 26) + base);
          });
          break;
        }

        case "dev_caesar_encode": {
          const s = (Number(shiftKey) % 26 + 26) % 26;
          result = inputText.replace(/[a-zA-Z]/g, c => {
            const code = c.charCodeAt(0);
            const base = code >= 97 ? 97 : 65;
            return String.fromCharCode(((code - base + s) % 26) + base);
          });
          break;
        }

        case "dev_caesar_decode": {
          const s = (26 - (Number(shiftKey) % 26)) % 26;
          result = inputText.replace(/[a-zA-Z]/g, c => {
            const code = c.charCodeAt(0);
            const base = code >= 97 ? 97 : 65;
            return String.fromCharCode(((code - base + s) % 26) + base);
          });
          break;
        }

        case "dev_url_encode": {
          result = encodeURIComponent(inputText);
          break;
        }

        case "dev_url_decode": {
          result = decodeURIComponent(inputText);
          break;
        }

        case "dev_html_entity_encode": {
          result = inputText.replace(/[\u00A0-\u9999<>\&"']/g, i => "&#" + i.charCodeAt(0) + ";");
          break;
        }

        case "dev_html_entity_decode": {
          const doc = new DOMParser().parseFromString(inputText, "text/html");
          result = doc.body.textContent || "";
          break;
        }

        case "dev_unicode_escape": {
          result = Array.from(inputText).map(c => {
            const code = c.charCodeAt(0);
            return code > 127 ? "\\u" + code.toString(16).padStart(4, "0") : c;
          }).join("");
          break;
        }

        case "dev_unicode_unescape": {
          result = inputText.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
          break;
        }

        case "dev_jwt_decoder":
        case "dev_jwt_inspector": {
          const parts = inputText.trim().split(".");
          if (parts.length < 2) throw new Error(isHi ? "अमान्य JWT टोकन (कम से कम 2 हिस्से होने चाहिए)" : "Invalid JWT (must have at least 2 parts separated by dots)");
          const decodePart = (str: string) => {
            let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
            while (b64.length % 4) b64 += "=";
            return JSON.parse(decodeURIComponent(escape(atob(b64))));
          };
          const header = decodePart(parts[0]);
          const payload = decodePart(parts[1]);
          result = `--- HEADER ---\n${JSON.stringify(header, null, 2)}\n\n--- PAYLOAD ---\n${JSON.stringify(payload, null, 2)}`;
          if (payload.exp) {
            const expDate = new Date(payload.exp * 1000);
            const isExpired = Date.now() > expDate.getTime();
            result += `\n\nExpiration (समाप्ति): ${expDate.toLocaleString()} (${isExpired ? "EXPIRED" : "VALID"})`;
          }
          break;
        }

        case "dev_uuid_generator": {
          const count = Number(secondText) || 5;
          const uuids: string[] = [];
          for (let i = 0; i < count; i++) {
            uuids.push(crypto.randomUUID());
          }
          result = uuids.join("\n");
          break;
        }

        case "dev_sha256_hash": {
          const data = new TextEncoder().encode(inputText);
          const hashBuffer = await crypto.subtle.digest("SHA-256", data);
          result = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
          break;
        }

        case "dev_sha512_hash": {
          const data = new TextEncoder().encode(inputText);
          const hashBuffer = await crypto.subtle.digest("SHA-512", data);
          result = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
          break;
        }

        case "dev_md5_hash": {
          result = calcMD5(inputText);
          break;
        }

        case "dev_crc32_checksum": {
          result = calcCRC32(inputText);
          break;
        }

        case "dev_hmac_sha256": {
          if (!secretKey) throw new Error(isHi ? "HMAC के लिए सीक्रेट की (Secret Key) दर्ज करें" : "Secret Key is required for HMAC");
          const enc = new TextEncoder();
          const key = await crypto.subtle.importKey(
            "raw",
            enc.encode(secretKey),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const signature = await crypto.subtle.sign("HMAC", key, enc.encode(inputText));
          result = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");
          break;
        }

        case "dev_password_generator": {
          const charsUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          const charsLower = "abcdefghijklmnopqrstuvwxyz";
          const charsNum = "0123456789";
          const charsSym = "!@#$%^&*()_+-=[]{}|;:,.<>?";
          let charPool = charsUpper + charsLower + charsNum;
          if (includeSymbols) charPool += charsSym;
          const len = Math.max(8, Math.min(64, pwdLength));
          const array = new Uint32Array(len);
          crypto.getRandomValues(array);
          result = Array.from(array).map(n => charPool[n % charPool.length]).join("");
          break;
        }

        case "dev_bcrypt_validator": {
          const trimmed = inputText.trim();
          const isBcrypt = /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/.test(trimmed);
          if (isBcrypt) {
            const parts = trimmed.split("$");
            result = `✓ वैध (Valid) Bcrypt Hash!\n\nPrefix: $${parts[1]}\nCost Factor: ${parts[2]} (2^${parts[2]} iterations)\nSalt + Hash: ${parts[3]}`;
          } else {
            result = `✗ अमान्य Bcrypt Hash.\nBcrypt hash मानक रूप से $2a$, $2b$ या $2y$ से शुरू होता है और 60 वर्णों का होता है।`;
          }
          break;
        }

        case "dev_timestamp_to_date": {
          const raw = Number(inputText.trim());
          if (Number.isNaN(raw)) throw new Error("Enter valid numeric timestamp");
          const ms = raw < 1e11 ? raw * 1000 : raw;
          const d = new Date(ms);
          result = `ISO: ${d.toISOString()}\nUTC: ${d.toUTCString()}\nLocal: ${d.toString()}`;
          break;
        }

        case "dev_date_to_timestamp": {
          const d = new Date(inputText.trim() || Date.now());
          result = `Seconds (Epoch): ${Math.floor(d.getTime() / 1000)}\nMilliseconds: ${d.getTime()}\nISO String: ${d.toISOString()}`;
          break;
        }

        case "dev_ip_validator": {
          const ip = inputText.trim();
          const isIpv4 = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(ip);
          const isIpv6 = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(ip);
          if (isIpv4) result = `✓ मान्य IPv4 एड्रेस: ${ip}`;
          else if (isIpv6) result = `✓ मान्य IPv6 एड्रेस: ${ip}`;
          else result = `✗ अमान्य IP एड्रेस format.`;
          break;
        }

        case "dev_cidr_calc": {
          const match = inputText.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
          if (!match) throw new Error("Enter format like 192.168.1.0/24");
          const ip = match[1];
          const bits = Number(match[2]);
          if (bits < 0 || bits > 32) throw new Error("CIDR bits must be 0-32");
          const mask = ~(2 ** (32 - bits) - 1);
          const maskStr = [
            (mask >>> 24) & 255,
            (mask >>> 16) & 255,
            (mask >>> 8) & 255,
            mask & 255
          ].join(".");
          const hostCount = bits === 32 ? 1 : bits === 31 ? 2 : Math.max(0, 2 ** (32 - bits) - 2);
          result = `IP: ${ip}\nPrefix: /${bits}\nSubnet Mask: ${maskStr}\nUsable Hosts (उपयोगी होस्ट): ${hostCount.toLocaleString()}`;
          break;
        }

        case "dev_mac_formatter": {
          const raw = inputText.trim().replace(/[^a-fA-F0-9]/g, "").toUpperCase();
          if (raw.length !== 12) throw new Error("MAC address must have 12 hex characters");
          const pairs = raw.match(/.{1,2}/g) || [];
          result = `Colon (:) Format: ${pairs.join(":")}\nHyphen (-) Format: ${pairs.join("-")}\nCisco (.) Format: ${pairs[0] + pairs[1]}.${pairs[2] + pairs[3]}.${pairs[4] + pairs[5]}`;
          break;
        }

        case "dev_sql_formatter": {
          const keywords = ["SELECT", "FROM", "WHERE", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "JOIN", "ON", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM"];
          let sql = inputText.replace(/\s+/g, " ");
          keywords.forEach(kw => {
            const re = new RegExp(`\\b${kw}\\b`, "gi");
            sql = sql.replace(re, `\n${kw}`);
          });
          result = sql.trim();
          break;
        }

        case "dev_css_minifier": {
          result = inputText
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/\s*([\{\}:;,])\s*/g, "$1")
            .replace(/;\}/g, "}")
            .trim();
          break;
        }

        case "dev_js_minifier": {
          result = inputText
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/\/\/.*$/gm, "")
            .replace(/^\s+|\s+$/gm, "")
            .replace(/\n+/g, "\n");
          break;
        }

        case "dev_html_minifier": {
          result = inputText
            .replace(/<!--[\s\S]*?-->/g, "")
            .replace(/>\s+</g, "><")
            .trim();
          break;
        }

        default:
          result = inputText;
      }

      setOutputText(result);
      setSuccessMsg(isHi ? "परिणाम तैयार है!" : "Result generated!");
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const handleDownloadOutput = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `output_${toolId}.txt`);
  };

  return (
    <div className="space-y-4">
      {/* Config Controls */}
      {(toolId === "dev_caesar_encode" || toolId === "dev_caesar_decode") && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isHi ? "शिफ्ट स्टेप्स (Shift Steps)" : "Shift Steps"}: {shiftKey}
          </label>
          <input
            type="range"
            min="1"
            max="25"
            value={shiftKey}
            onChange={e => setShiftKey(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
      )}

      {toolId === "dev_hmac_sha256" && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isHi ? "सीक्रेट कुंजी (HMAC Secret Key)" : "HMAC Secret Key"}
          </label>
          <input
            type="text"
            value={secretKey}
            onChange={e => setSecretKey(e.target.value)}
            placeholder="my-secret-key-123"
            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
      )}

      {toolId === "dev_password_generator" && (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>{isHi ? "पासवर्ड लंबाई" : "Length"}: {pwdLength}</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={e => setIncludeSymbols(e.target.checked)}
                className="rounded accent-emerald-600"
              />
              <span>{isHi ? "विशेष चिन्ह (!@#)" : "Symbols"}</span>
            </label>
          </div>
          <input
            type="range"
            min="8"
            max="64"
            value={pwdLength}
            onChange={e => setPwdLength(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
      )}

      {toolId === "dev_uuid_generator" && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isHi ? "UUIDs की संख्या" : "Number of UUIDs"}
          </label>
          <input
            type="number"
            value={secondText || "5"}
            onChange={e => setSecondText(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
      )}

      {/* Input Textarea */}
      {toolId !== "dev_uuid_generator" && toolId !== "dev_password_generator" && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isHi ? "इनपुट टेक्स्ट / कोड" : "Input Text / Code"}
          </label>
          <textarea
            rows={5}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={
              toolId.includes("jwt") ? "eyJhbGciOi..." :
              toolId.includes("cidr") ? "192.168.1.0/24" :
              toolId.includes("mac") ? "00:1A:2B:3C:4D:5E" :
              toolId.includes("sql") ? "SELECT * FROM users WHERE active = 1" :
              isHi ? "यहाँ टेक्स्ट या कोड पेस्ट करें..." : "Paste code or text here..."
            }
            className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800"
          />
        </div>
      )}

      {/* Run Button */}
      <button
        type="button"
        onClick={processTool}
        disabled={loading || (toolId !== "dev_uuid_generator" && toolId !== "dev_password_generator" && !inputText.trim())}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-800 disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>{isHi ? "प्रोसेसिंग..." : "Processing..."}</span>
          </>
        ) : (
          <>
            <Code className="h-4 w-4" />
            <span>{isHi ? "चलाएं (Generate / Run)" : "Generate / Run"}</span>
          </>
        )}
      </button>

      {/* Output Results */}
      {outputText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">{isHi ? "परिणाम (Output)" : "Output Result"}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(outputText)}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Copy className="h-3 w-3" />
                <span>{isHi ? "कॉपी" : "Copy"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadOutput}
                className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <Download className="h-3 w-3" />
                <span>{isHi ? "डाउनलोड" : "Download"}</span>
              </button>
            </div>
          </div>
          <textarea
            readOnly
            rows={7}
            value={outputText}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-800"
          />
        </div>
      )}

      {/* Status Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-800 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
