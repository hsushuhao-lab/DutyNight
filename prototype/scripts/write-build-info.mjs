import {writeFileSync} from 'node:fs';
const commit=process.env.DUTYNIGHT_SOURCE_SHA||process.env.GITHUB_SHA||'local-unpublished';
writeFileSync('public/build-info.json',JSON.stringify({commit,scope:'floorplan-access-20260920',builtAt:new Date().toISOString()},null,2));
