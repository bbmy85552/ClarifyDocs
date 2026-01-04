/**
 * 内容验证工具
 * 检查 MDX 内容中是否有未用代码块包裹的代码
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 验证 MDX 内容格式
 */
export function validateMdxContent(content: string): ValidationResult {
  const errors: string[] = [];

  // 移除已经用代码块包裹的内容
  const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');

  // 检查 Python 关键字
  const pythonKeywords = [
    /\bimport\s+\w+/g,
    /\bfrom\s+\w+\s+import/g,
    /\bdef\s+\w+\s*\(/g,
    /\bclass\s+\w+/g,
    /print\s*\(/g,
  ];

  pythonKeywords.forEach((pattern) => {
    const matches = contentWithoutCodeBlocks.match(pattern);
    if (matches) {
      errors.push(`检测到未用代码块包裹的 Python 代码: ${matches[0]}`);
    }
  });

  // 检查 JavaScript/TypeScript 关键字
  const jsKeywords = [
    /\bconst\s+\w+\s*=/g,
    /\blet\s+\w+\s*=/g,
    /\bfunction\s+\w+/g,
    /=>\s*{/g,
    /console\.log\(/g,
    /\bimport\s+.*from/g,
  ];

  jsKeywords.forEach((pattern) => {
    const matches = contentWithoutCodeBlocks.match(pattern);
    if (matches) {
      errors.push(`检测到未用代码块包裹的 JavaScript 代码: ${matches[0]}`);
    }
  });

  // 检查可能导致 MDX 解析错误的模式
  const problematicPatterns = [
    // 可能的 JSX 表达式
    /\{[^}]*[a-zA-Z]+\.[a-zA-Z]+[^}]*\}/g, // {obj.prop}

    // 可能的 HTML 标签（不在代码块中）
    /<(?!\/?[a-z]+.*>|code|pre|div|span|p>)/gi,

    // 可能的注释（MDX 不支持 // 注释）
    /^(?!```.*$).*\/\/.*$/gm,

    // 可能的 Shell 命令
    /^(?!```.*$).*\$(?: [a-zA-Z]+|cd|ls|pwd|npm|pip|git)/gm,
  ];

  // 检查每一行
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    // 跳过代码块内的行
    if (line.trim().startsWith('```')) return;

    // 检查是否在代码块内
    const codeBlockStart = content.substring(0, content.indexOf(line)).lastIndexOf('```');
    const codeBlockEnd = content.substring(0, content.indexOf(line)).lastIndexOf('```', codeBlockStart + 3);
    if (codeBlockStart > codeBlockEnd) return; // 在代码块内

    const trimmed = line.trim();
    if (!trimmed) return;

    // 检查可能的代码（启发式）
    const likelyCode = [
      // 包含多个括号或特殊符号
      /\([^)]*\([^)]*\)/, // 嵌套括号

      // 包含多个点号或箭头
      /\.{2,}/, // 多个点

      // 可能的语句结束符
      /[,;]$/, // 行尾有逗号或分号

      // 函数调用模式
      /\w+\(\)(?![`]*$)/, // 函数调用（不在行尾）
    ];

    likelyCode.forEach((pattern) => {
      if (pattern.test(trimmed)) {
        errors.push(`第 ${index + 1} 行可能包含代码: "${trimmed.substring(0, 40)}${trimmed.length > 40 ? '...' : ''}"`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 简单的代码检测（用于提示）
 */
export function detectPotentialCode(content: string): string[] {
  const hints: string[] = [];
  const lines = content.split('\n');

  // 检查是否在代码块内
  let inCodeBlock = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // 检查代码块标记
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return;
    }

    // 如果在代码块内，跳过
    if (inCodeBlock) return;

    // 跳过空行和标题
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    // 检测常见的代码模式（更宽松）
    const codePatterns = [
      // Python/JavaScript 关键字
      /^(import|from|def|class|const|let|var|function|return|if|for|while)\b/,
      // 函数定义
      /\w+\s*\([^)]*\)\s*(?::)?[{=>]/,
      // 对象属性访问
      /\w+\.\w+(\.\w+)?/,
      // 数组/对象操作
      /[\[\]]/,
      // 行尾分号
      /;$/,
      // 赋值操作
      /=/,
      // 箭头函数
      /=>/,
      // Shell 命令提示符
      /^\$/,
      // 多个括号嵌套
      /\([^)]*\([^)]*\)/,
    ];

    const isLikelyCode = codePatterns.some(pattern => pattern.test(trimmed));

    if (isLikelyCode) {
      hints.push(
        `第 ${index + 1} 行可能包含代码，请用代码块包裹: \`\`\`${trimmed.substring(0, 30)}${trimmed.length > 30 ? '...' : ''}\`\`\``
      );
    }
  });

  return hints;
}
