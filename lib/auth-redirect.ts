/** Build auth redirects from the public site address, not Next's internal server URL. */
export function getAuthRedirectUrl(
  request: { url: string; headers: Headers },
  pathname: '/login' | '/chat',
) {
  const canonical = new URL('https://vigil.basalthq.com');
  const incoming = new URL(request.url);
  const isLoopback = (hostname: string) => ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
  let configured = canonical;
  try {
    const candidate = new URL(process.env.NEXT_PUBLIC_APP_URL || canonical.origin);
    if (['http:', 'https:'].includes(candidate.protocol) && !candidate.username && !candidate.password && !isLoopback(candidate.hostname)) {
      configured = candidate;
    }
  } catch {
    // An absent or invalid deployment setting must not expose an internal host.
  }

  const knownOrigins = new Map([
    [canonical.host, canonical.origin],
    [configured.host, configured.origin],
  ]);
  let origin: string | undefined;
  // Only recognized deployment hosts can override the address via proxy headers.
  for (const name of ['x-forwarded-host', 'host']) {
    const host = request.headers.get(name)?.toLowerCase();
    if (host && knownOrigins.has(host)) {
      origin = knownOrigins.get(host);
      break;
    }
  }

  if (!origin) {
    const host = request.headers.get('host');
    if (host && !/[\s,\\/@?#]/.test(host)) {
      try {
        const local = new URL(`http://${host}`);
        if (isLoopback(local.hostname)) {
          const forwardedProtocol = request.headers.get('x-forwarded-proto');
          local.protocol = forwardedProtocol === 'https' ? 'https:' : forwardedProtocol === 'http' ? 'http:' : incoming.protocol;
          origin = local.origin;
        }
      } catch {
        // Fall back to the known public site if Host is malformed.
      }
    }
  }

  const destination = new URL(origin || configured.origin);
  destination.pathname = pathname;
  destination.search = incoming.search;
  return destination;
}
