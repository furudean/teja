# teja

Shared land bans for Second Life parcels.

## Server

```bash
npm install
npm run build  # outputs a build in the build directory
cp .env.example .env  # edit the file and fill in the secrets
node --env-file=.env build
```

put nginx in front of it on a subdomain. `/status` shows the client map.

the server refuses requests for a secret that isn't set. use long random
secrets, e.g. `openssl rand -hex 32`.

## Second Life

| script                    | goes in                                         | edit                             |
| ------------------------- | ----------------------------------------------- | -------------------------------- |
| scripts/teja-admin.lsl    | one prim, with a notecard named `bans`          | `API_BASE_URL` + `ADMIN_SECRET`  |
| scripts/teja-receiver.lsl | a prim on each parcel, deeded to the land owner | `API_BASE_URL` + `CLIENT_SECRET` |

The `bans` notecard takes one uuid per line. Saving it pushes the new list.

After teja-receiver.lsl has been configured, you may distribute it to other
users. Keep modify permission off, so the secret stays hidden.

Never share teja-admin.lsl with anyone.
