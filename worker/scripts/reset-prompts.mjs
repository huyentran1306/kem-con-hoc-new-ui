import fs from 'node:fs';
import { execSync } from 'node:child_process';

const workerDir = '/Users/pro/Coding/study-en/ai-gateway-worker';

console.log('Fetching current prompts from remote D1...');
const out = execSync("npx wrangler d1 execute ai-gateway-db --remote --command=\"SELECT value FROM _kv_store WHERE key = 'team_prompts_sync:v1'\" --json", { cwd: workerDir });
const data = JSON.parse(out.toString());
const val = JSON.parse(data[0].results[0].value);

console.log(`Found ${val.length} prompts. Resetting isRunCompanyAi to false...`);
const updated = val.map(p => ({
  ...p,
  isRunCompanyAi: false,
  runBy: '',
  runAt: '',
  aiResult: '',
}));

const jsonStr = JSON.stringify(updated).replace(/'/g, "''");
const sql = `UPDATE _kv_store SET value = '${jsonStr}', updated_at = CURRENT_TIMESTAMP WHERE key IN ('team_prompts_sync:v1', 'team_prompts_sync%3Av1');`;
fs.writeFileSync('/tmp/reset_prompts.sql', sql);

console.log('Executing update on remote D1...');
execSync('npx wrangler d1 execute ai-gateway-db --remote --file=/tmp/reset_prompts.sql', { cwd: workerDir, stdio: 'inherit' });

console.log('✅ Done! All prompts have been reset to Chưa chạy (Pending).');
