with open("/Users/pro/Coding/kem-con-hoc/src/Login.jsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace(
    '<p className="eyebrow" style={{ marginTop: 8 }}>{activeTheme.name} · Bạn đồng hành dịu dàng</p>',
    '<p className="eyebrow" style={{ marginTop: 8, color: "var(--c-accent-ink, var(--c-text))" }}>{activeTheme.name} · Bạn đồng hành dịu dàng</p>'
)

with open("/Users/pro/Coding/kem-con-hoc/src/Login.jsx", "w", encoding="utf-8") as f:
    f.write(text)
print("Login.jsx updated.")

with open("/Users/pro/Coding/kem-con-hoc/src/styles.css", "r", encoding="utf-8") as f:
    css = f.read()

css = css.replace(
    ".eyebrow{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--coral)}",
    ".eyebrow{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--c-accent-ink, var(--coral))}"
)

with open("/Users/pro/Coding/kem-con-hoc/src/styles.css", "w", encoding="utf-8") as f:
    f.write(css)
print("styles.css updated.")
