# Setup and usage

## 1. Install the application

```bash
npm install
```

The application uses Next.js, React and `@balkangraph/familytree.js`.

## 2. Create the private data directory

For a new installation, copy the fictional example:

```bash
cp -R data.example data
```

The resulting private structure is:

```text
data/
├── config.json
├── family.json
└── images/
```

Never use `git add -f data`. The complete `data/` directory is intentionally
listed in `.gitignore`.

## 3. Family record format

`data/family.json` contains a JSON array. A record can use these properties:

```json
{
  "id": 3,
  "pids": [4],
  "mid": 2,
  "fid": 1,
  "name": "Example Person",
  "gender": "female",
  "img": "img/example-person.jpg"
}
```

- `id`: unique numeric identifier, required;
- `name`: displayed name, required;
- `gender`: `male` or `female`;
- `pids`: identifiers of partners;
- `mid`: mother's identifier;
- `fid`: father's identifier;
- `img`: image path written as `img/filename.ext`.

Partner relationships should normally be reciprocal. If person `1` contains
`"pids": [2]`, person `2` should contain `"pids": [1]`.

## 4. Photos

Place photos in `data/images/`, then reference only their filename from
`family.json`:

```text
data/images/example-person.jpg
```

```json
"img": "img/example-person.jpg"
```

Use lowercase filenames without sensitive metadata where possible. Before
sharing or deploying photos, consider removing EXIF GPS/camera metadata.

## 5. Tree configuration

`data/config.json` controls the initial rendering:

```json
{
  "roots": [1],
  "mode": "dark",
  "template": "john"
}
```

`roots` contains the IDs used as starting points in the tree.

## 6. Run locally

```bash
npm run dev
```

The pre-development script validates `data/family.json` and copies private data
to the ignored `public/family-data/` directory. Open <http://localhost:3000>.

Stop the server with `Ctrl+C`.

## 7. Build for production

```bash
npm run build
```

The static website is generated in `out/`. Both `out/` and its copied private
data are ignored by Git. To inspect it, run `npm run preview`.

## 8. Check privacy before GitHub

Run all of these commands before the first push:

```bash
git status --short --ignored
git check-ignore -v data/family.json
git check-ignore -v data/images
git check-ignore -v public/family-data
git check-ignore -v recovered-deployment
git add --dry-run .
```

Each `git check-ignore` command must print a matching `.gitignore` rule. Only
`data.example/` with fictional records and SVG placeholders should be staged.

## 9. Publish the source on GitHub

Create an empty GitHub repository without automatically adding a README, then:

```bash
git init
git add .
git status
git commit -m "Initial reconstructed family tree"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Inspect `git status` before committing. Do not use `git add -f` on ignored data.
If private data was ever committed, `.gitignore` cannot remove it from Git
history; clean the history before publishing.

## 10. Cloudflare Pages

The static build settings are:

```text
Build command: npm run build
Build output directory: out
```

A Cloudflare build connected only to GitHub will not have the ignored `data/`
directory and will intentionally fail. Provide the private files through a
secure deployment process, or build locally and upload `out/` directly.

Important: once `out/` is deployed publicly, its JSON and photos are publicly
downloadable even though they are absent from GitHub. Protect the site with
authentication or Cloudflare Access if that is not acceptable.
