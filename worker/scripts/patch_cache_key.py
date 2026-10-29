with open('src/dot20_token.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_fn = '''export async function buildCacheKey({ problemText, grade, bookSeries, subject, promptVersion, childProfileHash }) {
  const norm = normalizeProblem(problemText);
  const probHash = await sha256Hex(norm);
  const g = normalizeGrade(grade);
  const b = normalizeBookSeries(bookSeries);
  const s = normalizeSubject(subject);
  const v = String(promptVersion || "v2").trim().toLowerCase();
  const c = childProfileHash || "none";
  return `lk_${probHash}_${g}_${b}_${s}_${v}_${c}`;
}'''

new_fn = '''export async function buildCacheKey({ problemText, grade, bookSeries, subject, promptVersion, childProfileHash, systemContent }) {
  const norm = normalizeProblem(problemText);
  const probHash = await sha256Hex(norm);
  const g = normalizeGrade(grade);
  const b = normalizeBookSeries(bookSeries);
  const s = normalizeSubject(subject);
  const v = String(promptVersion || "v2").trim().toLowerCase();
  let sysPart = childProfileHash || "none";
  if (systemContent && typeof systemContent === "string") {
    sysPart = await sha256Hex(systemContent);
  }
  return `lk_${probHash}_${g}_${b}_${s}_${v}_${sysPart}`;
}'''

assert old_fn in content, 'old_fn not found in dot20_token.js'
content = content.replace(old_fn, new_fn)

with open('src/dot20_token.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated src/dot20_token.js')
