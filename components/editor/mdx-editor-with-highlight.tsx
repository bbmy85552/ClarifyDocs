'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { detectPotentialCode } from '@/lib/content-validation';

interface MdxEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: string;
}

interface TextHighlight {
  start: number;
  end: number;
  text: string;
  top: number;
  left: number;
  width: number;
  height: number;
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
\`\`\``,
  height = '600px',
}: MdxEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [highlights, setHighlights] = useState<TextHighlight[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算文字位置
  const calculateHighlights = () => {
    if (!textareaRef.current) return [];

    const textarea = textareaRef.current;
    const hints = detectPotentialCode(content);
    const newHighlights: TextHighlight[] = [];

    const style = window.getComputedStyle(textarea);
    const fontSize = parseFloat(style.fontSize);
    const lineHeight = parseFloat(style.lineHeight);
    const paddingLeft = parseFloat(style.paddingLeft);
    const paddingTop = parseFloat(style.paddingTop);

    hints.forEach((hint) => {
      const match = hint.match(/第 (\d+) 行可能包含代码：?\s*(.+)/);
      if (match) {
        const lineNumber = parseInt(match[1]);
        const lines = content.split('\n');

        if (lineNumber <= lines.length) {
          // 找到该行在内容中的起始位置
          let startPos = 0;
          for (let i = 0; i < lineNumber - 1; i++) {
            startPos += lines[i].length + 1; // +1 for newline
          }

          const lineText = lines[lineNumber - 1];
          const matchText = match[2].replace(/```/g, '').substring(0, 30);

          // 在该行中找到匹配文字
          const matchIndex = lineText.indexOf(matchText);
          if (matchIndex !== -1) {
            const endPos = startPos + matchIndex + matchText.length;

            // 计算位置
            const textBefore = content.substring(0, startPos + matchIndex);

            // 创建临时 span 来测量位置
            const span = document.createElement('span');
            span.textContent = textBefore;
            span.style.visibility = 'hidden';
            span.style.position = 'absolute';
            span.style.font = style.font;
            span.style.fontSize = `${fontSize}px`;
            span.style.whiteSpace = 'pre';
            document.body.appendChild(span);

            const textWidth = span.clientWidth;
            document.body.removeChild(span);

            // 计算高亮位置
            const top = paddingTop + (lineNumber - 1) * lineHeight;
            const left = paddingLeft + textWidth;
            const height = lineHeight;

            // 估算宽度（基于字符数）
            const avgCharWidth = fontSize * 0.6;
            const width = Math.min(matchText.length * avgCharWidth, textarea.clientWidth - left - paddingLeft);

            newHighlights.push({
              start: startPos + matchIndex,
              end: endPos,
              text: matchText,
              top,
              left,
              width,
              height,
            });
          }
        }
      }
    });

    return newHighlights;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange?.(newValue);

    // 计算高亮位置
    const newHighlights = calculateHighlights();
    setHighlights(newHighlights);
  };

  useEffect(() => {
    if (initialValue) {
      setContent(initialValue);
      const newHighlights = calculateHighlights();
      setHighlights(newHighlights);
    }
  }, [initialValue]);

  // 同步滚动
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          MDX 编辑器
        </div>
        <div className="flex-1"></div>
        {highlights.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            <span>发现 {highlights.length} 处可能的代码格式问题</span>
          </div>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {content.length} 字符
        </div>
      </div>

      {/* 编辑器容器 */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {/* 错误高亮层 - 在文字下方显示背景色 */}
        <div
          ref={highlightRef}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ height }}
        >
          {highlights.map((hl, index) => (
            <div key={index}>
              {/* 红色背景 */}
              <div
                className="absolute bg-red-200 dark:bg-red-900/40 border-l-4 border-red-500"
                style={{
                  top: `${hl.top}px`,
                  left: `${hl.left}px`,
                  width: `${hl.width}px`,
                  height: `${hl.height}px`,
                  zIndex: 1,
                }}
              />

              {/* 错误标记和提示 */}
              <div
                className="absolute z-10 flex items-center gap-2"
                style={{
                  top: `${hl.top + hl.height + 2}px`,
                  left: `${hl.left}px`,
                }}
              >
                <div className="bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  需要代码块包裹
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 文本区域 - 半透明以看到下面的高亮 */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onScroll={handleScroll}
          placeholder={placeholder}
          className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 relative z-0"
          style={{ height }}
          spellCheck={false}
        />
      </div>

      {/* 错误详情面板 */}
      {highlights.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/10">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">
                代码格式警告 ({highlights.length})
              </h4>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {highlights.map((hl, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-xs bg-white dark:bg-gray-800 p-2 rounded border border-red-200 dark:border-red-800"
                >
                  <span className="text-red-600 dark:text-red-400 font-mono flex-shrink-0">
                    位置: {hl.start}-{hl.end}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-mono">
                    "{hl.text}"
                  </span>
                  <span className="text-red-600 dark:text-red-400 flex-shrink-0">
                    → 用 {"```"} 包裹
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              💡 提示：请在代码前后添加代码块标记，例如：{"```"}python {"```"}
            </p>
          </div>
        </div>
      )}

      {/* 底部提示信息 */}
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
