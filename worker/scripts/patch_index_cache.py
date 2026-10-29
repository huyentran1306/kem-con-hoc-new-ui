with open('src/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = '''        const grade = request.headers.get("X-Grade") || "";
        const bookSeries = request.headers.get("X-Book-Series") || "";
        const subject = request.headers.get("X-Subject") || "";
        const childProfileHash = childId ? await sha256Hex(childId) : "none";
        let cacheKey = null;

        if (isExplain && rawProblem) {
          cacheKey = await buildCacheKey({
            problemText: rawProblem,
            grade,
            bookSeries,
            subject,
            promptVersion: promptId === "p3_explain_v2" ? "v2" : "v1",
            childProfileHash,
          });'''

new_block = '''        const rawGrade = request.headers.get("X-Grade") || "";
        const grade = rawGrade.includes("%") ? decodeURIComponent(rawGrade) : rawGrade;
        const rawBook = request.headers.get("X-Book-Series") || "";
        const bookSeries = rawBook.includes("%") ? decodeURIComponent(rawBook) : rawBook;
        const rawSubject = request.headers.get("X-Subject") || "";
        const subject = rawSubject.includes("%") ? decodeURIComponent(rawSubject) : rawSubject;
        const childProfileHash = childId ? await sha256Hex(childId) : "none";

        let systemContent = "";
        for (let m of messages) {
          if (m.role === "system" && typeof m.content === "string") {
            systemContent = m.content;
            break;
          }
        }

        let cacheKey = null;

        if (isExplain && rawProblem) {
          cacheKey = await buildCacheKey({
            problemText: rawProblem,
            grade,
            bookSeries,
            subject,
            promptVersion: promptId === "p3_explain_v2" ? "v2" : "v1",
            childProfileHash,
            systemContent,
          });'''

assert old_block in content, 'old_block not found in index.js'
content = content.replace(old_block, new_block)

with open('src/index.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated src/index.js cache key handling')
