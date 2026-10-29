with open('src/trialData.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update lesson_math_3 in PRELOADED_TRIAL_LESSONS
old_b1 = """      {
        bac: 1,
        cau_hoi: 'Con hãy đọc to đề bài và chỉ cho mẹ: Bác Ba ban đầu có tất cả bao nhiêu con vịt nào?',
        ly_do_cho_me: 'Giúp con nhận diện dữ kiện số lượng ban đầu của đàn vịt trước khi thực hiện thao tác bớt đi.',
        dap_an_cho_me: 'Xác định số lượng ban đầu là 15 con vịt.',
        goi_y: {
          muc_1_do_vat: 'Lấy 15 que tính hoặc cúc áo xếp ra bàn để tượng trưng cho đàn vịt.',
          muc_2_hinh_ve: 'Vẽ 15 chấm tròn hoặc một đoạn thẳng biểu diễn 15 con vịt.',
        },
      },"""

new_b1 = """      {
        bac: 1,
        ky_nang: 'doc_hieu_de',
        cau_hoi: 'Con hãy đọc to đề bài và chỉ cho mẹ: Bác Ba ban đầu có tất cả bao nhiêu con vịt nào?',
        ly_do_cho_me: 'Giúp con nhận diện dữ kiện số lượng ban đầu của đàn vịt trước khi thực hiện thao tác bớt đi.',
        dap_an_cho_me: 'Xác định số lượng ban đầu là 15 con vịt.',
        goi_y: {
          muc_1_do_vat: 'Lấy 15 que tính hoặc cúc áo xếp ra bàn để tượng trưng cho đàn vịt.',
          muc_2_hinh_ve: 'Vẽ 15 chấm tròn hoặc một đoạn thẳng biểu diễn 15 con vịt.',
        },
      },"""

old_b2 = """      {
        bac: 2,
        cau_hoi: 'Bác Ba bán bớt đi nghĩa là bớt đi hay thêm vào, và bớt đi mấy con hả con?',
        ly_do_cho_me: 'Dẫn dắt con hiểu từ khoá "bán bớt" tương ứng với phép toán trừ trong thực tế.',
        dap_an_cho_me: 'Bán bớt tức là làm phép trừ, bớt đi 6 con.',
        goi_y: {
          muc_1_do_vat: 'Tách 6 que tính ra khỏi 15 que tính ban đầu.',
          muc_2_hinh_ve: 'Gạch chéo 6 chấm tròn trên hình vẽ.',
        },
      },"""

new_b2 = """      {
        bac: 2,
        ky_nang: 'chon_phep_tinh',
        cau_hoi: 'Bác Ba bán bớt đi nghĩa là bớt đi hay thêm vào, và bớt đi mấy con hả con?',
        ly_do_cho_me: 'Dẫn dắt con hiểu từ khoá "bán bớt" tương ứng với phép toán trừ trong thực tế.',
        dap_an_cho_me: 'Bán bớt tức là làm phép trừ, bớt đi 6 con.',
        goi_y: {
          muc_1_do_vat: 'Tách 6 que tính ra khỏi 15 que tính ban đầu.',
          muc_2_hinh_ve: 'Gạch chéo 6 chấm tròn trên hình vẽ.',
        },
      },"""

old_b3 = """      {
        bac: 3,
        cau_hoi: 'Đếm lại số que tính còn lại trên bàn, hoặc viết phép tính để tìm số vịt còn lại nào!',
        ly_do_cho_me: 'Khích lệ con tự thực hiện phép tính và kết luận số lượng còn lại.',
        dap_an_cho_me: 'Phép tính: 15 - 6 = 9 (con vịt). Đáp số: 9 con vịt.',
        goi_y: {
          muc_1_do_vat: 'Đếm từng que tính còn lại trước mặt con.',
          muc_2_hinh_ve: 'Tách 15 thành 10 và 5, lấy 10 trừ 6 còn 4, cộng 5 bằng 9.',
        },
      },"""

new_b3 = """      {
        bac: 3,
        ky_nang: 'tinh_toan',
        cau_hoi: 'Đếm lại số que tính còn lại trên bàn, hoặc viết phép tính để tìm số vịt còn lại nào!',
        ly_do_cho_me: 'Khích lệ con tự thực hiện phép tính và kết luận số lượng còn lại.',
        dap_an_cho_me: 'Phép tính: 15 - 6 = 9 (con vịt). Đáp số: 9 con vịt.',
        goi_y: {
          muc_1_do_vat: 'Đếm từng que tính còn lại trước mặt con.',
          muc_2_hinh_ve: 'Tách 15 thành 10 và 5, lấy 10 trừ 6 còn 4, cộng 5 bằng 9.',
        },
      },"""

code = code.replace(old_b1, new_b1).replace(old_b2, new_b2).replace(old_b3, new_b3)

# 2. Update trialLessonToProblem to map ky_nang properly
old_map = """    steps: lesson.cac_bac.map((b) => ({
      q: b.cau_hoi,
      question: b.cau_hoi,
      ly_do_cho_me: b.ly_do_cho_me || '',"""

new_map = """    steps: lesson.cac_bac.map((b, idx) => ({
      q: b.cau_hoi,
      question: b.cau_hoi,
      ky_nang: b.ky_nang || (idx === 0 ? 'doc_hieu_de' : idx === 1 ? 'chon_phep_tinh' : 'tinh_toan'),
      ly_do_cho_me: b.ly_do_cho_me || '',"""

code = code.replace(old_map, new_map)

with open('src/trialData.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('✓ P0-3: Updated trialData.js with proper skill labels (doc_hieu_de, chon_phep_tinh, tinh_toan)')
