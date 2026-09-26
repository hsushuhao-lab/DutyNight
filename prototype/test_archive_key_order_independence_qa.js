import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync('./src/main.js','utf8');
const archiveBranch=main.slice(main.indexOf("if(interactable.doorId==='3F_ARCHIVE_DOOR'){"),main.indexOf("if (!gameState.isTaskComplete('KEY_PICKUP'))"));
assert(archiveBranch.includes("getFlag('ARCHIVE_ACCESS_KEY')"));
assert(!archiveBranch.includes("getFlag('ARCHIVE_OBJECTIVE')"),'archive door must not depend on objective order');
console.log('ARCHIVE KEY ORDER INDEPENDENCE PASS');
