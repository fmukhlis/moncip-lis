# OpenCode Remote Access

This setup exposes the OpenCode web UI from the development container to a
Tailscale tailnet. Tailscale does not need to be installed inside the
container; the host's Tailscale daemon proxies to a loopback port published by
Docker.

This applies to `compose.dev.yaml` only. `compose.prod.yaml` builds the
production `runner` stage and is unaffected.

## How it works

- The `dev` image starts the shared OpenCode service on `0.0.0.0:49374`.
- `compose.dev.yaml` publishes that port on the host loopback only:
  `127.0.0.1:49374:49374`.
- The host's `tailscale serve` proxies a tailnet port to that host loopback
  port.
- The phone opens the tailnet URL and pairs once. The session cookie lasts 30
  days.

OpenCode state is stored in named volumes so the password and sessions survive
container recreation:

- `opencode-config` → `/root/.config/opencode`
- `opencode-data` → `/root/.local/share/opencode`
- `opencode-state` → `/root/.local/state/opencode`
- `opencode-cache` → `/root/.cache/opencode`

## Start

```bash
docker compose -f compose.dev.yaml up -d --build
```

The service starts after `pnpm install`, so the web UI becomes available a
little after the container is up.

## Expose through Tailscale

Port `8080` is already used by Adminer in `compose.dev.yaml`, so use `8081`
here:

```bash
sudo tailscale serve --bg --http=8081 http://127.0.0.1:49374
sudo tailscale serve status
```

The phone URL is:

```text
http://<host>.<tailnet>.ts.net:8081
```

If MagicDNS is disabled, use the host's `100.x.y.z` Tailscale IP instead.

For HTTPS instead of HTTP (requires HTTPS certificates in the Tailscale admin
console):

```bash
sudo tailscale serve --bg --https=8443 http://127.0.0.1:49374
```

## Pair a phone

Inside the container:

```bash
opencode pair --url http://<host>.<tailnet>.ts.net:8081
```

Scan the QR code with the OpenCode app, or open the printed link in the phone
browser. Links are one-time and expire after 5 minutes.

OpenCode generates a password on the first start and stores it in the
`opencode-config` volume. No manual password is required. To use a known
password instead, set it once before pairing:

```bash
opencode service set password 'a-long-random-secret'
opencode service start
```

Do not set the password on every container start; changing it signs out all
paired sessions. To retrieve the generated password:

```bash
opencode service get password
```

## Persistence

`docker compose down` followed by `up` does not require repeating this setup as
long as the volumes are kept. `docker compose down -v` deletes the volumes,
which regenerates the password and requires pairing again.

When switching from a container that did not use these volumes, the existing
`/root` state is not migrated automatically. Copy it out before recreating the
container if you need the current password or sessions.

## Security notes

- Keep the host binding on loopback: `127.0.0.1:49374:49374`. Do not use
  `0.0.0.0` or an unqualified `49374:49374`.
- Use `tailscale serve`, not `tailscale funnel`. Funnel exposes the service to
  the internet.
- The web UI is a full OpenCode agent. It can edit files and run commands as
  the container user, currently `root`. Review the `permissions` configuration
  in `opencode.json` before exposing it to a phone.
- Consider a Tailscale ACL grant restricting access to the host and port
  `8081`, and disable key expiry for the host in the Tailscale admin console.
- Keep `NO_PROXY=127.0.0.1,localhost,::1` if an HTTP proxy is configured.
  OpenCode's CLI-to-service connection is local HTTP and must bypass it.
