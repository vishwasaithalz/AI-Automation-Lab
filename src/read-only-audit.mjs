import {auditWebsite} from './adapters/website-seo.mjs';
import {auditGitHubCI} from './adapters/github-ci.mjs';
const [engine,target]=process.argv.slice(2);
if(!['website-seo','github-ci'].includes(engine)||!target)throw Error('Usage: node src/read-only-audit.mjs website-seo https://approved.example/ | github-ci owner/public-repo');
const result=engine==='website-seo'?await auditWebsite({target,allowedHosts:[new URL(target).hostname]}):await auditGitHubCI({repo:target,allowedRepos:[target]});
console.log(JSON.stringify(result,null,2));
