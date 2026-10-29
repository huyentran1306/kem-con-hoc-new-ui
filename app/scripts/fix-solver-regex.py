with open("src/arithmetic.js", "r") as f:
    c = f.read()

# Replace \b regexes with proper raw string or unicode boundary
c = c.replace(
    "const mSub = text.match(/(?:cho|bớt|ăn|dùng|bán|rụng|tặng|chuyển đi|bớt đi|lấy ra|đã dùng|đã bớt|đã ăn|đã bán) .*?(\\d+)/);",
    "const mSub = text.match(/(?:cho|bớt|ăn|dùng|bán|rụng|tặng|chuyển đi|bớt đi|lấy ra|đã dùng|đã bớt|đã ăn|đã bán)[^0-9]*?(\\d+)/);"
)
c = c.replace(
    "const mAdd = text.match(/(?:mua thêm|thêm|nhận thêm|cho thêm|được tặng) .*?(\\d+)/);",
    "const mAdd = text.match(/(?:mua thêm|thêm|nhận thêm|cho thêm|được tặng)[^0-9]*?(\\d+)/);"
)

with open("src/arithmetic.js", "w") as f:
    f.write(c)

with open("/Users/pro/Coding/study-en/ai-gateway-worker/src/arithmetic.js", "w") as f:
    f.write(c)

print("Fixed regex in both arithmetic.js files.")
