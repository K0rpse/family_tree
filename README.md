# Family Tree

Editable family-tree application reconstructed with Next.js, React and
`@balkangraph/familytree.js`.

The source code is safe to publish, while real family records and photos stay in
the local `data/` directory. Git ignores both `data/` and every generated public
copy of it.

## Quick start

Requirements: Node.js 20 or newer and npm.

```bash
git clone YOUR_REPOSITORY_URL
cd family-tree-recovered
npm install
cp -R data.example data
npm run dev
```

Open <http://localhost:3000>.

For this recovered local copy, the real `data/` directory is already present,
so you do not need to copy `data.example`.

## Commands

```bash
npm run dev       # local development server
npm run build     # static production export in out/
npm run preview   # serve the generated out/ directory
npm run sync-data # validate data/ and prepare its ignored public copy
```

`npm run dev` and `npm run build` automatically run `sync-data` first.

## Project structure

```text
app/                       Next.js pages and global styles
components/                editable FamilyTree React component
types/                     public TypeScript types
scripts/sync-family-data.mjs private-data validation/copy script
data.example/              public fictional example data
data/                      PRIVATE real records and photos (Git ignored)
public/family-data/        PRIVATE generated copy (Git ignored)
recovered-deployment/      PRIVATE old bundle (Git ignored)
```

Read [SETUP.md](SETUP.md) for the data format, photos, GitHub publication and
Cloudflare Pages setup.

## Privacy warning

`.gitignore` prevents committing the private files to GitHub. It does **not**
make a deployed public website private: browsers must download the family JSON
and photos to display them. Use access control or a private deployment if the
deployed information must not be publicly accessible.
