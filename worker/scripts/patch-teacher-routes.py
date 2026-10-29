import re

file_path = '/Users/pro/Coding/study-en/ai-gateway-worker/src/teacher_routes.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update POST announcements to receive expiresAt and save to DB
post_target = """      const {
        title = "",
        body = "",
        pinned = 0,
        requireAck = 0,
        kind = "info",
        remindFor = null,
        templateId = null,
        assignmentId = null,
      } = await request.json().catch(() => ({}));"""

post_replacement = """      const {
        title = "",
        body = "",
        pinned = 0,
        requireAck = 0,
        kind = "info",
        remindFor = null,
        templateId = null,
        assignmentId = null,
        expiresAt = null,
        expires_at = null,
      } = await request.json().catch(() => ({}));

      let effectiveExpiresAt = expiresAt || expires_at || null;
      if (pinned) {
        effectiveExpiresAt = expiresAt || expires_at || null;
      } else {
        if (!effectiveExpiresAt) {
          effectiveExpiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
        }
      }"""

assert post_target in content, "post_target not found"
content = content.replace(post_target, post_replacement, 1)

insert_target = """      await env.DB.prepare(`
        INSERT INTO announcements (id, class_id, title, body, pinned, require_ack, created_at, kind, remind_for, template_id, assignment_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(annId, classId, title.trim(), body.trim(), pinned ? 1 : 0, requireAck ? 1 : 0, now, kind, remindFor || null, templateId || null, assignmentId || null).run();"""

insert_replacement = """      await env.DB.prepare(`
        INSERT INTO announcements (id, class_id, title, body, pinned, require_ack, created_at, kind, remind_for, template_id, assignment_id, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(annId, classId, title.trim(), body.trim(), pinned ? 1 : 0, requireAck ? 1 : 0, now, kind, remindFor || null, templateId || null, assignmentId || null, effectiveExpiresAt).run();"""

assert insert_target in content, "insert_target not found"
content = content.replace(insert_target, insert_replacement, 1)

# 2. Add PATCH & DELETE /api/v1/teacher/announcements/:id
reads_target = """      return jsonResponse({ ok: true, reads: reads.results || [] }, 200, corsHeaders);
    }
  }"""

patch_delete_code = """      return jsonResponse({ ok: true, reads: reads.results || [] }, 200, corsHeaders);
    }

    // Cập nhật thông báo (PATCH /api/v1/teacher/announcements/:id)
    if (pathname.startsWith("/api/v1/teacher/announcements/") && !pathname.endsWith("/reads") && method === "PATCH") {
      const annId = pathname.replace("/api/v1/teacher/announcements/", "").trim();
      const ann = await env.DB.prepare(`
        SELECT an.*, c.teacher_id FROM announcements an
        JOIN classes c ON an.class_id = c.id
        WHERE an.id = ?
      `).bind(annId).first();

      if (!ann) return jsonResponse({ error: { code: "NOT_FOUND", message: "Không tìm thấy thông báo" } }, 404, corsHeaders);
      if (ann.teacher_id !== session.teacher_id) {
        return jsonResponse({ error: { code: "FORBIDDEN", message: "Chỉ cô tạo lớp mới có quyền sửa thông báo" } }, 403, corsHeaders);
      }

      const patchBody = await request.json().catch(() => ({}));
      const updates = [];
      const params = [];

      if (patchBody.title !== undefined) {
        updates.push("title = ?");
        params.push(String(patchBody.title).trim());
      }
      if (patchBody.body !== undefined) {
        updates.push("body = ?");
        params.push(String(patchBody.body).trim());
      }
      if (patchBody.pinned !== undefined) {
        updates.push("pinned = ?");
        params.push(patchBody.pinned ? 1 : 0);
      }
      if (patchBody.expiresAt !== undefined || patchBody.expires_at !== undefined) {
        const exp = patchBody.expiresAt !== undefined ? patchBody.expiresAt : patchBody.expires_at;
        updates.push("expires_at = ?");
        params.push(exp || null);
      }
      if (patchBody.hidden !== undefined) {
        updates.push("hidden_at = ?");
        params.push(patchBody.hidden ? new Date().toISOString() : null);
      }

      if (updates.length > 0) {
        params.push(annId);
        await env.DB.prepare(`UPDATE announcements SET ${updates.join(", ")} WHERE id = ?`).bind(...params).run();
      }

      const updatedRow = await env.DB.prepare(`
        SELECT an.*,
          (SELECT COUNT(*) FROM announcement_reads ar WHERE ar.announcement_id = an.id) as read_count,
          (SELECT COUNT(*) FROM announcement_reads ar WHERE ar.announcement_id = an.id AND ar.ack_at IS NOT NULL) as ack_count,
          (SELECT COUNT(*) FROM announcement_reads ar WHERE ar.announcement_id = an.id AND ar.done_at IS NOT NULL) as done_count
        FROM announcements an
        WHERE an.id = ?
      `).bind(annId).first();

      return jsonResponse({ ok: true, announcement: updatedRow }, 200, corsHeaders);
    }

    // Xoá mềm thông báo (DELETE /api/v1/teacher/announcements/:id)
    if (pathname.startsWith("/api/v1/teacher/announcements/") && !pathname.endsWith("/reads") && method === "DELETE") {
      const annId = pathname.replace("/api/v1/teacher/announcements/", "").trim();
      const ann = await env.DB.prepare(`
        SELECT an.id, c.teacher_id FROM announcements an
        JOIN classes c ON an.class_id = c.id
        WHERE an.id = ?
      `).bind(annId).first();

      if (!ann) return jsonResponse({ error: { code: "NOT_FOUND", message: "Không tìm thấy thông báo" } }, 404, corsHeaders);
      if (ann.teacher_id !== session.teacher_id) {
        return jsonResponse({ error: { code: "FORBIDDEN", message: "Chỉ cô tạo lớp mới có quyền xoá thông báo" } }, 403, corsHeaders);
      }

      const now = new Date().toISOString();
      await env.DB.prepare("UPDATE announcements SET deleted_at = ? WHERE id = ?").bind(now, annId).run();
      return jsonResponse({ ok: true }, 200, corsHeaders);
    }
  }"""

assert reads_target in content, "reads_target not found"
content = content.replace(reads_target, patch_delete_code, 1)

# 3. Update GET /api/v1/family/announcements
family_target = """    const rows = await env.DB.prepare(`
      SELECT an.id, an.class_id, an.title, an.body, an.pinned, an.require_ack, an.created_at,
             c.name as class_name, t.display_name as teacher_name,
             ar.read_at, ar.ack_at
      FROM announcements an
      JOIN classes c ON an.class_id = c.id
      JOIN teachers t ON c.teacher_id = t.id
      JOIN class_students cs ON cs.class_id = c.id
      LEFT JOIN announcement_reads ar ON ar.announcement_id = an.id AND ar.family_id = ?
      WHERE cs.family_id = ? AND cs.status = 'active'
      ORDER BY an.pinned DESC, an.created_at DESC
    `).bind(session.family_id, session.family_id).all();"""

family_replacement = """    const nowIso = new Date().toISOString();
    const rows = await env.DB.prepare(`
      SELECT an.id, an.class_id, an.title, an.body, an.pinned, an.require_ack, an.created_at,
             an.kind, an.remind_for, an.template_id, an.assignment_id, an.expires_at,
             c.name as class_name, t.display_name as teacher_name,
             ar.read_at, ar.ack_at
      FROM announcements an
      JOIN classes c ON an.class_id = c.id
      JOIN teachers t ON c.teacher_id = t.id
      JOIN class_students cs ON cs.class_id = c.id
      LEFT JOIN announcement_reads ar ON ar.announcement_id = an.id AND ar.family_id = ?
      WHERE cs.family_id = ? AND cs.status = 'active'
        AND an.deleted_at IS NULL AND an.hidden_at IS NULL
        AND (
          an.kind = 'reminder'
          OR (an.expires_at IS NOT NULL AND an.expires_at > ?)
          OR (an.expires_at IS NULL AND an.pinned = 1)
          OR (an.expires_at IS NULL AND an.pinned = 0 AND an.created_at > datetime(?, '-7 days'))
        )
      ORDER BY an.pinned DESC, an.created_at DESC
    `).bind(session.family_id, session.family_id, nowIso, nowIso).all();"""

assert family_target in content, "family_target not found"
content = content.replace(family_target, family_replacement, 1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated teacher_routes.js successfully!')
