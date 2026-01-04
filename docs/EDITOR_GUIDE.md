# 📝 文档编辑器使用指南

## ⚠️ 重要：Markdown 语法规则

### 代码块必须正确标记

如果文档中包含代码，**必须**使用正确的 Markdown 代码块语法：

#### ✅ 正确示例

```markdown
\`\`\`python
import os
import sys

print("Hello World")
\`\`\`

\`\`\`javascript
const greeting = "Hello";
console.log(greeting);
\`\`\`
```

#### ❌ 错误示例

```markdown
import os  ← 这会导致解析错误！
import sys
```

---

## 🎯 快速开始

### 1. 创建文档

1. 访问 `/docs/new`
2. 填写标题和描述
3. 在编辑器中输入 Markdown 格式内容

### 2. 基础语法

#### 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
```

#### 文本样式

```markdown
**粗体**
*斜体*
`代码`
~~删除线~~
```

#### 列表

```markdown
- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2
```

#### 代码块（重要！）

```markdown
\`\`\`python
def hello():
    print("Hello World")
\`\`\`

\`\`\`javascript
function hello() {
    console.log("Hello World");
}
\`\`\`
```

#### 链接和图片

```markdown
[链接文本](https://example.com)
![图片描述](https://example.com/image.jpg)
```

---

## 📋 完整示例

创建一个文档时，使用以下模板：

```markdown
# 文档标题

## 简介

这是文档的简介部分。

## 代码示例

\`\`\`python
import os

def main():
    print("Hello World")

if __name__ == "__main__":
    main()
\`\`\`

## 功能列表

- 功能 1
- 功能 2
- 功能 3

## 总结

文档的总结部分。
```

---

## 🚨 常见错误

### 错误 1: 直接粘贴代码

❌ **错误**：
```
import os
print("Hello")
```

✅ **正确**：
```
```python
import os
print("Hello")
```
```

### 错误 2: 特殊字符未转义

❌ **错误**：
```
标题：测试"文档"
```

✅ **正确**：
```
标题：测试\"文档\"
```

---

## 💡 最佳实践

1. **使用代码块**：所有代码都必须用 ``` 包裹
2. **指定语言**：在代码块开头指定语言（python、javascript 等）
3. **预览内容**：保存前检查内容格式是否正确
4. **测试文档**：保存后测试文档是否能正常显示

---

## 🎨 高级功能（待实现）

- [ ] MDX 实时预览
- [ ] 代码高亮
- [ ] 一键插入代码块
- [ ] 图片上传
- [ ] 自动保存

---

## 📚 参考资源

- [Markdown 语法指南](https://www.markdownguide.org/)
- [MDX 文档](https://mdxjs.com/)
- [Fumadocs 文档](https://fumadocs.dev/)
