with open("src/TeamPromptSyncTab.jsx", "r") as f:
    content = f.read()

# 1. Add comparePromptTimeAsc helper function before INITIAL_TEAM_PROMPTS
compare_func = """// Hàm sắp xếp theo thời gian tăng dần (cũ ở trên, mới ở dưới - chạy từ trên xuống)
export function comparePromptTimeAsc(a, b) {
  const parseTime = (p) => {
    if (!p) return 0
    const str = p.createdAt || p.updatedAt || ''
    const t = Date.parse(str)
    if (!isNaN(t)) return t
    const m = String(str).match(/^(\\d{4})-(\\d{2})-(\\d{2})(?:[ T](\\d{2}):(\\d{2}))?/)
    if (m) {
      return new Date(m[1], m[2] - 1, m[3], m[4] || 0, m[5] || 0).getTime()
    }
    return 0
  }
  const diff = parseTime(a) - parseTime(b)
  if (diff !== 0) return diff
  return String(a.id || '').localeCompare(String(b.id || ''))
}

import INITIAL_TEAM_PROMPTS from './teamPromptsData.json'"""

content = content.replace("import INITIAL_TEAM_PROMPTS from './teamPromptsData.json'", compare_func)

# 2. Update initial useState
old_state = """;[...INITIAL_TEAM_PROMPTS].reverse().forEach((initPrompt) => {
          if (!list.some((p) => p.id === initPrompt.id)) {
            list.unshift(initPrompt)
          }
        })
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
        return list
      }
    } catch (e) {}
    return INITIAL_TEAM_PROMPTS"""

new_state = """INITIAL_TEAM_PROMPTS.forEach((initPrompt) => {
          if (!list.some((p) => p.id === initPrompt.id)) {
            list.push(initPrompt)
          }
        })
        list.sort(comparePromptTimeAsc)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
        return list
      }
    } catch (e) {}
    return [...INITIAL_TEAM_PROMPTS].sort(comparePromptTimeAsc)"""

content = content.replace(old_state, new_state)

# 3. Update fetchFromCloud
old_cloud = """;[...INITIAL_TEAM_PROMPTS].reverse().forEach((initPrompt) => {
          if (!merged.some((p) => p.id === initPrompt.id)) {
            merged.unshift(initPrompt)
          }
        })
        setPrompts(merged)"""

new_cloud = """INITIAL_TEAM_PROMPTS.forEach((initPrompt) => {
          if (!merged.some((p) => p.id === initPrompt.id)) {
            merged.push(initPrompt)
          }
        })
        merged.sort(comparePromptTimeAsc)
        setPrompts(merged)"""

content = content.replace(old_cloud, new_cloud)

# 4. Update newPromptItem addition
old_add = "updatedList = [newPromptItem, ...prompts]"
new_add = "updatedList = [...prompts, newPromptItem].sort(comparePromptTimeAsc)"
content = content.replace(old_add, new_add)

# 5. Update filteredPrompts sorting
old_filter = """      if (filterRunStatus === 'pending' && p.isRunCompanyAi) return false

      return true
    })
  }, [prompts, search, filterCategory, filterRunStatus])"""

new_filter = """      if (filterRunStatus === 'pending' && p.isRunCompanyAi) return false

      return true
    }).sort(comparePromptTimeAsc)
  }, [prompts, search, filterCategory, filterRunStatus])"""

content = content.replace(old_filter, new_filter)

with open("src/TeamPromptSyncTab.jsx", "w") as f:
    f.write(content)

print("Successfully updated src/TeamPromptSyncTab.jsx with chronological sorting.")
