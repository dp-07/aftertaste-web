// Old home-page anchors (before the 2026-11-27 revamp) now live on feature
// pages. Fragments never reach the server, so _redirects cannot move them;
// this does, with location.replace (no extra history entry). Without
// JavaScript the visitor stays on the home page, which links to every page.
import { movedAnchors } from '../config/features';

const id = decodeURIComponent(location.hash.slice(1));
const target = id ? movedAnchors[id] : undefined;
if (target && target !== '/') location.replace(target);
else if (target === '/') history.replaceState(null, '', '/');
