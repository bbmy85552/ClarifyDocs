/**
 * MDX 测试工具
 * 用于在保存前测试 MDX 是否能正确解析
 */

export async function testMdxParsing(content: string): Promise<{
  success: boolean;
  error?: string;
  line?: number;
  column?: number;
}> {
  try {
    // 这里我们无法在客户端直接测试 MDX 解析
    // 因为 MDX 解析是在构建时进行的
    // 但我们可以做一些基本的检查

    // 检查常见的 MDX 问题
    const issues: string[] = [];

    // 检查是否有未闭合的代码块
    const codeBlockCount = (content.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      issues.push('代码块未正确闭合（``` 数量为奇数）');
    }

    // 检查可能的 JSX 问题
    const lines = content.split('\n');
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 检查代码块标记
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // 如果在代码块内，跳过检查
      if (inCodeBlock) continue;

      // 检查可能的问题
      // 1. 未闭合的 JSX 标签（简化版）
      if (trimmed.startsWith('<') && !trimmed.startsWith('</')) {
        if (!trimmed.endsWith('/>') && !trimmed.includes(' ')) {
          // 可能是自闭合标签或普通标签
        }
      }

      // 2. { } 用于 JSX，但在 markdown 中也可能出现
      // 如果行中包含 { 但不是在代码块或行内代码中
      if (trimmed.includes('{') && !trimmed.includes('`')) {
        // 可能是 JSX 表达式
        // 这个比较难检测，先跳过
      }
    }

    if (issues.length > 0) {
      return {
        success: false,
        error: issues.join('; '),
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 简单的 MDX 语法检查
 */
export function simpleMdxCheck(content: string): {
  ok: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // 检查 1: 代码块是否配对
  const codeBlocks = content.match(/```/g);
  if (codeBlocks && codeBlocks.length % 2 !== 0) {
    warnings.push('代码块标记数量为奇数，可能未正确闭合');
  }

  // 检查 2: 是否有看起来像代码但未包裹的内容
  const lines = content.split('\n');
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    // 检查可能的问题模式
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // 包含代码特征但不在代码块中
    const codeFeatures = [
      trimmed.includes(';'), // 分号
      trimmed.includes('()'), // 空括号
      trimmed.match(/^\w+\.\w+/), // 对象属性
      trimmed.match(/\w+\(\w/), // 函数调用
    ];

    if (codeFeatures.filter(Boolean).length >= 2) {
      warnings.push(`第 ${i + 1} 行可能包含代码但未用代码块包裹`);
    }
  }

  return {
    ok: warnings.length === 0,
    warnings,
  };
}
