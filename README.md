# stitchbook-notifications

Booking and payment alerts for StitchBook. The service listens on port **3003**.

`GET /api/notifications/:userId` returns the signed-in user's alerts. `POST /api/push/register` stores a device token. Live alerts are emitted on Socket.IO to `user:<id>`.

`stitchbook-core` and `stitchbook-payments` create alerts by calling `POST /internal/notifications` with the shared `INTERNAL_TOKEN`. The same title for the same booking is ignored for 30 seconds.

`JWT_SECRET` must match `stitchbook-core`.

## Run

```bash
cp .env.example .env
npm install
npm start
```
