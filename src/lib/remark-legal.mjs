// Remark plugin for the legal pages (src/content/legal/*.md, synced from the
// app repo by `npm run sync:legal`). No dependencies: it walks the mdast tree.
//
// 1. Drops the `<!-- draft-notes … /draft-notes -->` comment (internal notes
//    for the human, never published).
// 2. Drops the document's H1 (the page renders the title from frontmatter).
// 3. Turns a trailing `{#some-id}` on a heading into the heading's id, so
//    stable anchors such as #delete-your-data survive.
// 4. Wraps every `[TODO: …]` in <mark class="legal-todo"> and logs a build
//    warning, so unresolved drafts are visible on the page and in the build.

const TODO = /\[TODO:[^\]]*\]/g;
const HEADING_ID = /\s*\{#([A-Za-z][\w-]*)\}\s*$/;

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const isLegalFile = (file) => {
  const p = (file.path || file.history?.[0] || '').replace(/\\/g, '/');
  return p.includes('/src/content/legal/');
};

function textOf(node) {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  return (node.children || []).map(textOf).join('');
}

function walk(node, fn, parent = null) {
  fn(node, parent);
  if (node.children) for (const child of [...node.children]) walk(child, fn, node);
}

export function remarkLegal() {
  return (tree, file) => {
    if (!isLegalFile(file)) return;
    const name = (file.path || '').split('/').pop();
    const todos = [];

    tree.children = tree.children.filter((node) => {
      if (node.type === 'html' && /^<!--\s*draft-notes/.test(node.value)) return false;
      if (node.type === 'heading' && node.depth === 1) return false;
      return true;
    });

    walk(tree, (node) => {
      if (node.type !== 'heading') return;
      const last = node.children[node.children.length - 1];
      if (last?.type !== 'text') return;
      const m = last.value.match(HEADING_ID);
      if (!m) return;
      last.value = last.value.replace(HEADING_ID, '');
      node.data = { ...node.data, hProperties: { ...(node.data?.hProperties || {}), id: m[1] } };
    });

    walk(tree, (node, parent) => {
      if (node.type !== 'text' || !parent || !TODO.test(node.value)) return;
      TODO.lastIndex = 0;
      const parts = [];
      let last = 0;
      for (const m of node.value.matchAll(TODO)) {
        if (m.index > last) parts.push({ type: 'text', value: node.value.slice(last, m.index) });
        todos.push(m[0]);
        parts.push({
          type: 'html',
          value: `<mark class="legal-todo"><span class="legal-todo-tag">To do</span> ${escapeHtml(m[0].slice(7, -1).trim())}</mark>`,
        });
        last = m.index + m[0].length;
      }
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
      parent.children.splice(parent.children.indexOf(node), 1, ...parts);
    });

    // A TODO split across inline formatting would escape the regex above.
    walk(tree, (node) => {
      if (node.type === 'paragraph' && /\[TODO:/.test(textOf(node)) && !node.children.some((c) => c.type === 'html')) {
        todos.push(`(unhighlighted) ${textOf(node).slice(0, 80)}`);
      }
    });

    for (const t of todos) console.warn(`[legal-todo] ${name}: ${t}`);
  };
}
