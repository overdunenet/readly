const EXTERNAL_REFS = [
  'PM-DOCS/workflow/references/bmad-cis/',
  'PM-DOCS/workflow/references/bmad-method/',
];

const isExternalRef = (file) =>
  EXTERNAL_REFS.some((ref) => file.includes(ref));

const quoteFile = (file) => `"${file}"`;

module.exports = {
  '**/*.{ts,tsx,jsx}': (files) => {
    const filtered = files.filter((f) => !isExternalRef(f));
    if (!filtered.length) return [];
    const quoted = filtered.map(quoteFile).join(' ');
    return [`eslint --fix ${quoted}`, `prettier --write ${quoted}`];
  },
  '**/*.{md,yml,yaml}': (files) => {
    const filtered = files.filter((f) => !isExternalRef(f));
    if (!filtered.length) return [];
    const quoted = filtered.map(quoteFile).join(' ');
    return [`prettier --write ${quoted}`];
  },
  '**/*.json': (files) => {
    const filtered = files.filter(
      (f) => !isExternalRef(f) && !f.endsWith('package.json'),
    );
    if (!filtered.length) return [];
    const quoted = filtered.map(quoteFile).join(' ');
    return [`prettier --write ${quoted}`];
  },
};
