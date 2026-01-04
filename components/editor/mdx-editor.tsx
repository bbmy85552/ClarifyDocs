'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { detectPotentialCode } from '@/lib/content-validation';

interface MdxEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export function MdxEditor({
  initialValue = '',
  onChange,
  placeholder = `# 文档标题

## 简介
在这里编写文档简介...

## 代码示例

\`\`\`python
# 代码必须用代码块包裹！
def hello():
    print("Hello World")
\`\`\`

\`\`\`javascript
// JavaScript 代码
function hello() {
    console.log("Hello World");
}
\`\`\`

## 列表
- 列表项 1
- 列表项 2

**粗体** 和 *斜体* 文本`,
  height = '600px',
}: MdxEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange?.(newValue);

    // 实时检测潜在的代码问题
    const detectedWarnings = detectPotentialCode(newValue);
    setWarnings(detectedWarnings);
  };

  useEffect(() => {
    if (initialValue) {
      setContent(initialValue);
      const detectedWarnings = detectPotentialCode(initialValue);
      setWarnings(detectedWarnings);
    }
  }, [initialValue]);

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          MDX 编辑器
        </div>
        <div className="flex-1"></div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {content.length} 字符
        </div>
      </div>

      {/* 警告提示 */}
      {warnings.length > 0 && (
        <div className="mx-2 mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                检测到可能的代码
              </p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-0.5">
                {warnings.slice(0, 3).map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
                {warnings.length > 3 && (
                  <li className="text-yellow-600 dark:text-yellow-400">
                    还有 {warnings.length - 3} 个警告...
                  </li>
                )}
              </ul>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                请用代码块包裹: {"```"}语言名{"```"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 编辑区 */}
      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          style={{ height }}
          spellCheck={false}
        />
      </div>

      {/* 提示信息 */}
      <div className="p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <div>
            提示：支持标准 Markdown 语法和 JSX 组件
          </div>
          <div className="flex gap-4">
            <span>**粗体**</span>
            <span>*斜体*</span>
            <span>`代码`</span>
            <span>```代码块```</span>
          </div>
        </div>
      </div>
    </div>
  );
}
