import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

export function getPgPoolConfig(rawUrl?: string) {
  const connStr = rawUrl || process.env.LOCAL_DB_URL || process.env.DATABASE_URL || "postgresql://rp_admin:therpfoundation%40321@localhost:5432/rp_db";
  
  let user = "rp_admin";
  let password = "therpfoundation@321";
  let host = "localhost";
  let port = 5432;
  let database = "rp_db";

  try {
    const u = new URL(connStr);
    if (u.username) user = decodeURIComponent(u.username);
    if (u.password) password = decodeURIComponent(u.password);
    if (u.hostname && u.hostname !== 'base' && !u.hostname.includes('base')) host = u.hostname;
    if (u.port) port = parseInt(u.port, 10);
    if (u.pathname && u.pathname !== '/') database = u.pathname.replace(/^\//, '');
  } catch {
    const match = connStr.match(/postgresql:\/\/([^:]+):([^@]+)@([^:\/]+):?(\d+)?\/(.+)/);
    if (match) {
      user = decodeURIComponent(match[1]);
      password = decodeURIComponent(match[2]);
      host = match[3] && !match[3].includes('base') ? match[3] : 'localhost';
      port = match[4] ? parseInt(match[4], 10) : 5432;
      database = match[5];
    }
  }

  if (!host || host === 'base' || host.includes('base')) {
    host = 'localhost';
  }

  return {
    user,
    password,
    host,
    port,
    database,
    ssl: false
  };
}

export const dbUrl = process.env.LOCAL_DB_URL || process.env.DATABASE_URL || "postgresql://rp_admin:therpfoundation%40321@localhost:5432/rp_db";

export const pool = new pg.Pool(getPgPoolConfig());

