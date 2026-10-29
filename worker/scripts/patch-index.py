file_path = '/Users/pro/Coding/study-en/ai-gateway-worker/src/index.js'
with open(file_path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Profile timing
target_profile = """        let childProfile = null;
        for (let m of messages) {
          if (typeof m.content === "string" && m.content.includes("{{ho_so_con}}")) {
            let profileText = "chưa có";
            if (familyId && childId) {
              childProfile = await buildLearnerProfile(env, familyId, childId);
              profileText = childProfile.profileText || "chưa có";
            }
            m.content = m.content.replace(/\{\{ho_so_con\}\}/g, profileText);
          }
        }"""

replacement_profile = """        let childProfile = null;
        let profile_ms = 0;
        for (let m of messages) {
          if (typeof m.content === "string" && m.content.includes("{{ho_so_con}}")) {
            let profileText = "chưa có";
            if (familyId && childId) {
              const pStart = Date.now();
              childProfile = await buildLearnerProfile(env, familyId, childId);
              profile_ms = Date.now() - pStart;
              profileText = childProfile.profileText || "chưa có";
            }
            m.content = m.content.replace(/\{\{ho_so_con\}\}/g, profileText);
          }
        }"""

assert target_profile in c, "target_profile not found"
c = c.replace(target_profile, replacement_profile, 1)

# 2. Cache timing & v3r28 version
target_cache = """        if (isExplain && rawProblem) {
          cacheKey = await buildCacheKey({
            problemText: rawProblem,
            grade,
            bookSeries,
            subject,
            promptVersion: promptId === "p3_explain_v3" ? "v3" : (promptId === "p3_explain_v2" ? "v2" : "v1"),
            childProfileHash,
            systemContent,
          });

          if (!bypassCache) {
            const cachedLesson = await fetchFromLessonCache(env, cacheKey);
            if (cachedLesson) {
              const elapsed = Date.now() - chatStartedAt;
              await logAiCall(env, {
                family_id: familyId,
                session_id: sessionId,
                endpoint: "/chat",
                prompt_id: promptId,
                prompt_version: promptId === "p3_explain_v2" ? "v2" : "v1",
                model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
                tokens_in: 0,
                tokens_out: 0,
                latency_ms: elapsed,
                ms: elapsed,
                ok: 1,
                status: "cache_hit",
                cache_hit: 1,
                estimated: 0,
              });

              return jsonResponse({
                response: cachedLesson,
                guarded: false,
                error_code: null,
                cached: true,
                validator: { ok: true, cached: true },
              }, 200, corsHeaders);
            }
          }"""

replacement_cache = """        let cache_ms = 0;
        if (isExplain && rawProblem) {
          cacheKey = await buildCacheKey({
            problemText: rawProblem,
            grade,
            bookSeries,
            subject,
            promptVersion: promptId === "p3_explain_v3" ? "v3r28" : (promptId === "p3_explain_v2" ? "v2" : "v1"),
            childProfileHash,
            systemContent,
          });

          if (!bypassCache) {
            const cStart = Date.now();
            const cachedLesson = await fetchFromLessonCache(env, cacheKey);
            cache_ms = Date.now() - cStart;
            if (cachedLesson) {
              const elapsed = Date.now() - chatStartedAt;
              await logAiCall(env, {
                family_id: familyId,
                session_id: sessionId,
                endpoint: "/chat",
                prompt_id: promptId,
                prompt_version: promptId === "p3_explain_v3" ? "v3r28" : (promptId === "p3_explain_v2" ? "v2" : "v1"),
                model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
                tokens_in: 0,
                tokens_out: 0,
                latency_ms: elapsed,
                ms: elapsed,
                ok: 1,
                status: "cache_hit",
                cache_hit: 1,
                estimated: 0,
              });

              return jsonResponse({
                response: cachedLesson,
                guarded: false,
                error_code: null,
                cached: true,
                validator: { ok: true, cached: true },
                timing: {
                  profile_ms,
                  cache_ms,
                  ai_ms: 0,
                  check_ms: 0,
                  total_ms: elapsed,
                },
              }, 200, corsHeaders);
            }
          }"""

assert target_cache in c, "target_cache not found"
c = c.replace(target_cache, replacement_cache, 1)

# 3. AI timing
target_ai_run = """        try {
          // Chỉ nhận id model Workers AI hợp lệ (@cf/...), tên khác (vd "cloudflare-llama-3.3-70b") quy về mặc định
          const chosenModel = typeof model === "string" && model.startsWith("@cf/") ? model : "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
          let response;
          try {
            response = await env.AI.run(chosenModel, { messages, max_tokens, temperature });
          } catch (mErr) {
            console.warn("Primary model error, retrying once before fallback:", mErr);
            await new Promise(r => setTimeout(r, 600));
            try {
              response = await env.AI.run(chosenModel, { messages, max_tokens, temperature });
            } catch (retryErr) {
              console.warn("Retry failed, fallback to llama-3.1-8b-instruct-fp8:", retryErr);
              response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8", { messages, max_tokens, temperature });
            }
          }"""

replacement_ai_run = """        try {
          // Chỉ nhận id model Workers AI hợp lệ (@cf/...), tên khác (vd "cloudflare-llama-3.3-70b") quy về mặc định
          const chosenModel = typeof model === "string" && model.startsWith("@cf/") ? model : "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
          let response;
          const aiStart = Date.now();
          try {
            response = await env.AI.run(chosenModel, { messages, max_tokens, temperature });
          } catch (mErr) {
            console.warn("Primary model error, retrying once before fallback:", mErr);
            await new Promise(r => setTimeout(r, 600));
            try {
              response = await env.AI.run(chosenModel, { messages, max_tokens, temperature });
            } catch (retryErr) {
              console.warn("Retry failed, fallback to llama-3.1-8b-instruct-fp8:", retryErr);
              response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8", { messages, max_tokens, temperature });
            }
          }
          const ai_ms = Date.now() - aiStart;"""

assert target_ai_run in c, "target_ai_run not found"
c = c.replace(target_ai_run, replacement_ai_run, 1)

# 4. Check timing & timing in return response
target_check = """          const validated = await validateAndGuard(promptId, rawOutput, context, env, ctx);

          // Cập nhật validator_json vào learning_sessions nếu có sessionId
          if (sessionId && env.DB) {
            try {
              await env.DB.prepare("UPDATE learning_sessions SET validator_json = ? WHERE id = ?")
                .bind(JSON.stringify(validated.validator), sessionId)
                .run();
            } catch (vErr) {
              console.warn("Update session validator error:", vErr);
            }
          }

          // Đợt 20 · Chặng 1: Lưu bài vào lesson_cache & ghi log ai_calls đo token
          if (isExplain && cacheKey && validated.response) {
            await storeInLessonCache(env, {
              cacheKey,
              problemText: rawProblem,
              grade,
              bookSeries,
              subject,
              promptVersion: promptId === "p3_explain_v3" ? "v3" : (promptId === "p3_explain_v2" ? "v2" : "v1"),
              childProfileHash,
              lessonObj: validated.response,
              tokensSaved: 1950,
            });
          }

          const elapsed = Date.now() - chatStartedAt;
          await logAiCall(env, {
            family_id: familyId,
            session_id: sessionId,
            endpoint: "/chat",
            prompt_id: promptId || "p3_explain_v2",
            prompt_version: promptId === "p3_explain_v3" ? "v3" : (promptId === "p3_explain_v2" ? "v2" : "v1"),
            model: chosenModel,
            tokens_in: estimateTokens(JSON.stringify(messages)),
            tokens_out: estimateTokens(rawOutput),
            latency_ms: elapsed,
            ms: elapsed,
            ok: 1,
            status: isPrefetch ? "prefetch" : "ok",
            error_code: guardOutcomeAction,
            cache_hit: 0,
            estimated: 1,
          });

          return jsonResponse({
            response: validated.response,
            guarded: validated.guarded,
            error_code: validated.error_code,
            validator: validated.validator,
          }, 200, corsHeaders);"""

replacement_check = """          const checkStart = Date.now();
          const validated = await validateAndGuard(promptId, rawOutput, context, env, ctx);

          // Cập nhật validator_json vào learning_sessions nếu có sessionId
          if (sessionId && env.DB) {
            try {
              await env.DB.prepare("UPDATE learning_sessions SET validator_json = ? WHERE id = ?")
                .bind(JSON.stringify(validated.validator), sessionId)
                .run();
            } catch (vErr) {
              console.warn("Update session validator error:", vErr);
            }
          }

          // Đợt 20 · Chặng 1: Lưu bài vào lesson_cache & ghi log ai_calls đo token (fix steps không lưu cache)
          if (isExplain && cacheKey && validated.response && promptId !== "p3_fix_steps_v3") {
            await storeInLessonCache(env, {
              cacheKey,
              problemText: rawProblem,
              grade,
              bookSeries,
              subject,
              promptVersion: promptId === "p3_explain_v3" ? "v3r28" : (promptId === "p3_explain_v2" ? "v2" : "v1"),
              childProfileHash,
              lessonObj: validated.response,
              tokensSaved: 1950,
            });
          }
          const check_ms = Date.now() - checkStart;

          const elapsed = Date.now() - chatStartedAt;
          const timing = {
            profile_ms,
            cache_ms,
            ai_ms,
            check_ms,
            total_ms: elapsed,
          };

          await logAiCall(env, {
            family_id: familyId,
            session_id: sessionId,
            endpoint: "/chat",
            prompt_id: promptId || "p3_explain_v2",
            prompt_version: promptId === "p3_explain_v3" ? "v3r28" : (promptId === "p3_explain_v2" ? "v2" : "v1"),
            model: chosenModel,
            tokens_in: estimateTokens(JSON.stringify(messages)),
            tokens_out: estimateTokens(rawOutput),
            latency_ms: elapsed,
            ms: elapsed,
            ok: 1,
            status: isPrefetch ? "prefetch" : "ok",
            error_code: guardOutcomeAction,
            cache_hit: 0,
            estimated: 1,
          });

          return jsonResponse({
            response: validated.response,
            guarded: validated.guarded,
            error_code: validated.error_code,
            validator: validated.validator,
            timing,
          }, 200, corsHeaders);"""

assert target_check in c, "target_check not found"
c = c.replace(target_check, replacement_check, 1)

# Also allow p3_fix_steps_v3 in rawOutput serialization
c = c.replace(
    '(promptId === "p3_explain_v3" || promptId === "p3_extra_v3")',
    '(promptId === "p3_explain_v3" || promptId === "p3_extra_v3" || promptId === "p3_fix_steps_v3")'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated index.js successfully!')
