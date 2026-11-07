# ZeroAuth

WebAuthn / FIDO2 experimental learning lab with actual user-initiated authenticator ceremonies. Not a production authentication service.

## Running
- Live demo: https://karma-zeroauth.vercel.app/
- Browser code: web/index.html, web/app.mjs and web/auth-core.mjs
- Requires HTTPS, WebAuthn API support and a compatible platform or roaming authenticator.
- Click Check, Register, then Authenticate. Public-key data is stored for this tab only.

## Implemented
- Real WebAuthn registration via navigator.credentials.create with P-256 ES256 public-key request.
- Real assertion ceremony via navigator.credentials.get.
- Client challenge, origin, RP ID and UP checks with ECDSA signature verification via WebCrypto.
- Local sign-counter regression check when counters are nonzero.

## Not implemented and NOT claimed
- Protected server storage, server challenges, identity verification, account binding, backend session authorization, encrypted cookie sessions, attestation trust policy, account recovery, production security auditing.
- No guarantee of eliminating credential vulnerabilities; authenticator verification happens client-side only and can be bypassed by untrusted scripts.

Test with node --test tests/zeroauth.test.mjs. Do not enter personal identifiers or rely on this site for account protection.
