import dotenv from 'dotenv';

dotenv.config();

// Shared MySQL connection settings. Works locally AND on Railway.
//
// Precedence (first one found wins, per field):
//   1. DB_HOST / DB_PORT / DB_USER / DB_PASS / DB_NAME      (explicit, e.g. local .env)
//   2. MYSQL_URL or DATABASE_URL  (mysql://user:pass@host:port/db)
//   3. MYSQLHOST / MYSQLPORT / MYSQLUSER / MYSQLPASSWORD / MYSQLDATABASE   (Railway's MySQL service variables)
//   4. localhost defaults
//
// TLS: set DB_SSL=true (and optionally DB_SSL_CA with the CA certificate) for providers that require it.
// Not needed on Railway's private network.

function fromUrl() {
  const raw = process.env.MYSQL_URL || process.env.DATABASE_URL;
  if (!raw) return {};
  try {
    const u = new URL(raw);
    return {
      host: u.hostname,
      port: u.port ? Number(u.port) : undefined,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, '') || undefined,
    };
  } catch {
    console.warn('⚠️  MYSQL_URL / DATABASE_URL could not be parsed; ignoring it.');
    return {};
  }
}

export const baseConfig = () => {
  const e = process.env;
  const url = fromUrl();
  return {
    host: e.DB_HOST || url.host || e.MYSQLHOST || 'localhost',
    port: Number(e.DB_PORT || url.port || e.MYSQLPORT) || 3306,
    user: e.DB_USER || url.user || e.MYSQLUSER || 'root',
    password: e.DB_PASS ?? url.password ?? e.MYSQLPASSWORD ?? '',
    ...(e.DB_SSL === 'true' || e.DB_SSL_CA
      ? {
          ssl: {
            rejectUnauthorized: true,
            ...(e.DB_SSL_CA ? { ca: e.DB_SSL_CA.replace(/\\n/g, '\n') } : {}),
          },
        }
      : {}),
  };
};

export const dbName = () =>
  process.env.DB_NAME || fromUrl().database || process.env.MYSQLDATABASE || 'readingradical';
