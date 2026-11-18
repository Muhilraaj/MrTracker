# MrTracker

## Run locally

Use JDK 21 and Node.js 22.12 or newer with npm. Start from the repository root. The frontend runs on `127.0.0.1:5173`, and Vite forwards `/api` and `/auth` to Spring Boot on port `8080`.

Spring Boot uses the MongoDB connection and database in [application.properties](backend/src/main/resources/application.properties). You need network access to that MongoDB server and an existing MrTracker account. Event updates are saved to the configured database.

### 1. Start Spring Boot in terminal 1

In PowerShell, build the backend and start the JAR. If the JAR is already built and you are testing only frontend changes, skip the build and run the `java` command from `backend`.

```powershell
Set-Location .\backend
.\mvnw.cmd -DskipTests package
if ($LASTEXITCODE -ne 0) { throw 'Backend build failed' }
java -jar .\target\backend-0.0.1-SNAPSHOT.jar --server.address=127.0.0.1
```

The Maven Wrapper downloads Maven on its first run if it is missing. Wait for Spring Boot to report that Tomcat started on port `8080`.

### 2. Start Vite in terminal 2

Install dependencies on a fresh checkout or after `package-lock.json` changes. Skip `npm.cmd ci` if the installed dependencies already match the lockfile.

```powershell
Set-Location .\frontend
npm.cmd ci
if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency install failed' }
npm.cmd run dev -- --host 127.0.0.1 --strictPort
```

Keep both terminals running and open [MrTracker sign-in](http://127.0.0.1:5173/page/login). Press `Ctrl+C` in each terminal to stop the servers.

### macOS and Linux

Use these commands in separate terminals, each starting from the repository root. Skip `npm ci` when the installed dependencies match the lockfile.

```sh
cd backend && sh ./mvnw -DskipTests package && java -jar target/backend-0.0.1-SNAPSHOT.jar --server.address=127.0.0.1
```

```sh
cd frontend && npm ci && npm run dev -- --host 127.0.0.1 --strictPort
```

## Verify startup

Run these read-only checks in a third PowerShell terminal. On macOS or Linux, use `curl` and replace `NUL` with `/dev/null`.

```powershell
curl.exe --noproxy '*' -sS --max-time 5 -o NUL -w 'Frontend: %{http_code}\n' http://127.0.0.1:5173/page/login
curl.exe --noproxy '*' -sS --max-time 5 -o NUL -w 'Backend through Vite: %{http_code}\n' http://127.0.0.1:5173/auth/login
```

- **Frontend `200`** means Vite served the sign-in page.
- **Backend through Vite `405`** is expected. The request reaches Spring Boot, where sign-in requires `POST`.
- Check the backend log for `Monitor thread successfully connected` to confirm MongoDB is reachable. Signing in with your account checks the full login flow.

When starting the app for another task, run the two HTTP checks first. Reuse the running MrTracker servers if both checks pass. If Vite is down, check `http://127.0.0.1:8080/auth/login` directly for the same `405` response. Start only the missing servers in long-lived terminal sessions, verify again, and return the sign-in URL. Keep the server sessions running for testing.

## Troubleshooting

- **Java or Maven startup fails.** Confirm `java -version` reports Java 21 and that `JAVA_HOME`, if set, points to the same JDK. On Windows, `Get-Command java` shows which executable PowerShell uses.
- **The sign-in page loads but the backend check returns `5xx`.** Check the Spring Boot terminal and confirm the backend is listening on port `8080`.
- **A port is already in use.** Check whether MrTracker is already running before launching a second copy. Keep the frontend on `5173` and the backend on `8080` for the commands above.
- **MongoDB times out or sign-in fails.** Check the backend logs, access to the database configured in `application.properties`, and that your account exists there.
