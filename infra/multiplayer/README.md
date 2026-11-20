# ShieldQuest multiplayer lobby

Phase 4C connects two players in a private room at The Mysterious House. Starting a room opens the multiplayer session screen for both players. Level 1 gameplay is available through Play Solo while shared state is in development.

## Local development

Use Node.js 22 and npm. From the repository root, install the frontend and backend dependencies. The backend has its own lockfile.

```powershell
npm ci
npm ci --prefix infra/multiplayer
npm run typecheck --prefix infra/multiplayer
npm test --prefix infra/multiplayer
npm run local --prefix infra/multiplayer
```

In a second terminal, point Vite at the explicit loopback WebSocket server.

```powershell
$env:VITE_SHIELDQUEST_LOBBY_URL = 'ws://127.0.0.1:8787'
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Use two browser profiles or private windows at http://127.0.0.1:5173. Continue or create a character, visit the house entrance, create a room on one profile, then join with its code on the other. The UI identifies the local server. This setup uses real WebSocket connections and the same lobby service as Lambda, with process-local persistence. Restarting the local server clears its rooms. Omit the endpoint variable for a solo-only build. The app never falls back to local mode after a production connection fails.

## AWS deployment

Choose a region that offers API Gateway WebSocket APIs, Lambda, DynamoDB and CloudWatch Logs. Use the same region for stack bootstrap, deployment and cleanup. The frontend can remain in its existing Amplify region. The example below uses Singapore. Configure AWS CLI access through an approved SSO session or deployment role. The deployer needs permission to bootstrap CDK or use an existing bootstrap environment, and to create or update the stack, publish Lambda assets, and pass the generated execution roles. If API Gateway access logging in the target region requires an account-level CloudWatch role, have the account administrator configure it before deployment. The stack leaves shared API Gateway account settings in place.

```powershell
$env:AWS_PROFILE = 'your-approved-profile'
$env:AWS_REGION = 'ap-southeast-1'
$frontendOrigin = 'https://your-branch.your-app.amplifyapp.com'
$account = aws sts get-caller-identity --query Account --output text

Set-Location infra/multiplayer
npm ci
npx cdk bootstrap "aws://$account/$env:AWS_REGION"
npx cdk synth -c "allowedOrigins=$frontendOrigin"
npx cdk deploy ShieldQuestLobby -c "allowedOrigins=$frontendOrigin"
```

Set the Amplify branch environment variable `VITE_SHIELDQUEST_LOBBY_URL` to the stack's `LobbyWebSocketUrl` output and rebuild that branch. The repository's Amplify build specification runs the root Vite build. Pass exact HTTPS origins without paths or trailing slashes. For multiple frontend origins, pass one comma-separated value. The frontend needs only the public `wss://` URL. Keep AWS credentials in the deployment environment.

After a staging deployment, test two browsers over the deployed endpoint. Confirm both receive the start event, room versions increase, reconnects preserve identity, the runtime IAM policies allow messages and transactions, and CloudWatch receives access metadata without message bodies. Confirm the DynamoDB TTL attribute and verify expired codes are rejected while their items still exist.

To take the lobby offline, clear the Amplify variable and rebuild. To remove the backend, use the same profile, region and origin configuration. Destroying the stack deletes its lobby table and log groups.

```powershell
npx cdk destroy ShieldQuestLobby -c "allowedOrigins=$frontendOrigin"
```

The main cost drivers are WebSocket connection minutes and JSON messages, Lambda invocation and compute, DynamoDB on-demand reads and transactional writes, and CloudWatch ingestion and retention. Each connected player sends four application heartbeats per minute, each with a server response. The throttles target small test groups. Review regional pricing and usage before opening access broadly. [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/) · [DynamoDB read and write units](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/read-write-operations.html)

## Protocol and authentication

- The Gateway connect route checks the exact browser `Origin` and throttles IP buckets. Origin is a browser control. The socket becomes an application session only after `HELLO` or a successful `RESUME`.
- `HELLO` returns a server-issued public player ID and a private, random 256-bit resume token over the WebSocket. The backend stores the token hash. The client keeps the credential in memory and tab-scoped session storage for reconnects. It travels in a message body over WSS and stays out of URLs, logs, room snapshots, and game saves. The credential expires after three hours. Closing the tab normally clears its copy. JavaScript running in the same origin can read session storage, so the hosting origin must remain trusted.
- Every action resolves the API Gateway connection ID to a current session and, for room actions, matches it to a room member. Resume validates the private token and replaces the binding. An old socket can no longer act on that session. The room code admits an authenticated guest to an available slot. Host operations require the bound host identity.
- The room key reserves a cryptographically random six-character code. A separate UUID identifies each room instance. A DynamoDB transaction atomically checks the relevant revisions and changes membership. The last 48 successful mutation identifiers per session make network retries idempotent within that window. Short heartbeats update presence and return a current snapshot to recover missed pushes. The separate public version changes for room membership, readiness, presence and status.
- A missing heartbeat marks presence stale after 45 seconds. A disconnect notification can mark it immediately. The server retains the seat for another 60 seconds and clears readiness on reconnection. An active peer's heartbeats process expired seats and closed rooms. If nobody is online, the application expiry and eventual TTL cleanup handle abandoned rooms. A waiting room expires after 30 idle minutes and has a two-hour maximum lifetime.
- DynamoDB stores room rows (`R#`) with at most two player records, session rows (`S#`), connection bindings (`C#`), and IP/message throttle rows (`RATE#`). AWS manages table encryption. Lambda has table/key-scoped access and sends callbacks only through the lobby stage. CloudWatch retains logs for 14 days.

The next phase can use the shared-case and per-player contracts in `src/multiplayer/protocol.ts` for authoritative gameplay. Multiplayer sessions never replace or merge a player's local escape-room inventory.
