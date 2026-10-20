# Releasing

Pushing a version tag publishes to npm: [`.github/workflows/publish.yml`](.github/workflows/publish.yml) builds the package
and runs `npm publish` through npm Trusted Publishing, so no npm token or local 2FA is involved, from any computer.

## A release

1. Write what changed under a new heading in [`CHANGELOG.md`](CHANGELOG.md), dated, and commit it.
2. Bump the version; this edits `package.json`, commits and tags `vX.Y.Z`:
   ```sh
   npm version patch   # fixes: 0.1.0 -> 0.1.1
   npm version minor   # new features or API changes before 1.0: 0.1.0 -> 0.2.0
   ```
3. Push the commit and the tag:
   ```sh
   git push --follow-tags
   ```
4. Watch the **Publish** run under the repository's Actions tab. When it is green, the version is on npm with a provenance
   badge. The **Pages** run updates the demo site from the same push.

The workflow refuses a tag that doesn't match the version in `package.json`.

## One-time setup (done once per package)

On npmjs.com: the inkmath package → **Settings** → **Trusted Publisher** → **GitHub Actions**:

| Field | Value |
|---|---|
| Organization or user | `momomoink` |
| Repository | `inkmath` |
| Workflow filename | `publish.yml` |
| Environment | `npm` |

## By hand, as a fallback

From a terminal you opened yourself (npm's browser 2FA step needs an interactive terminal):

```sh
npm login
npm publish
```
