# 1. PromptStudioTab.jsx
with open('src/PromptStudioTab.jsx', 'r', encoding='utf-8') as f:
    ps = f.read()

old_ps_toast = "staffToast(v ? `Đã xuất bản v${v.version}` : 'Đã xuất bản cho mọi gia đình')"
new_ps_toast = "staffToast(v ? `Đã xuất bản v${v.version}. Điện thoại phụ huynh nhận bản mới trong tối đa 10 phút.` : 'Đã xuất bản cho mọi gia đình. Điện thoại phụ huynh nhận bản mới trong tối đa 10 phút.')"
assert old_ps_toast in ps, "old_ps_toast not found"
ps = ps.replace(old_ps_toast, new_ps_toast)

with open('src/PromptStudioTab.jsx', 'w', encoding='utf-8') as f:
    f.write(ps)
print('Updated PromptStudioTab.jsx toast')

# 2. RouterPage.jsx
with open('src/admin/RouterPage.jsx', 'r', encoding='utf-8') as f:
    rp = f.read()

old_rp_toast = "staffToast('Đã lưu Router sư phạm, bài giảng mới dùng luật này ngay')"
new_rp_toast = "staffToast('Đã lưu Router sư phạm. Điện thoại phụ huynh nhận bản mới trong tối đa 10 phút.')"
assert old_rp_toast in rp, "old_rp_toast not found"
rp = rp.replace(old_rp_toast, new_rp_toast)

with open('src/admin/RouterPage.jsx', 'w', encoding='utf-8') as f:
    f.write(rp)
print('Updated RouterPage.jsx toast')

# 3. ModelParamsPage.jsx
with open('src/admin/ModelParamsPage.jsx', 'r', encoding='utf-8') as f:
    mp = f.read()

old_mp_toast = "staffToast('Đã lưu tham số mô hình', {"
new_mp_toast = "staffToast('Đã lưu tham số mô hình. Điện thoại phụ huynh nhận bản mới trong tối đa 10 phút.', {"
assert old_mp_toast in mp, "old_mp_toast not found"
mp = mp.replace(old_mp_toast, new_mp_toast)

with open('src/admin/ModelParamsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(mp)
print('Updated ModelParamsPage.jsx toast')
