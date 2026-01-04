import fs from 'fs/promises';
import path from 'path';

interface DocumentData {
  slug: string;
  title: string;
  description?: string;
  content: string;
  category?: string;
  tags?: string[];
}

/**
 * 将文档同步到文件系统
 * 生成 MDX 文件到 content/docs/ 目录
 */
export async function syncDocumentToFileSystem(doc: DocumentData): Promise<void> {
  try {
    // 确保 title 存在
    if (!doc.title) {
      throw new Error('标题不能为空');
    }

    // 构建 frontmatter（需要用引号包裹值，避免特殊字符问题）
    const frontmatterLines = [
      '---',
      `title: "${escapeYaml(doc.title)}"`,
    ];

    // 只有当 description 存在且不为空时才添加
    if (doc.description && doc.description.trim()) {
      frontmatterLines.push(`description: "${escapeYaml(doc.description)}"`);
    }

    frontmatterLines.push('---', '');

    const frontmatter = frontmatterLines.join('\n');

    // 组合完整内容
    const fullContent = frontmatter + doc.content;

    // 确保目录存在
    const docsDir = path.join(process.cwd(), 'content', 'docs');
    await fs.mkdir(docsDir, { recursive: true });

    // 写入文件
    const filePath = path.join(docsDir, `${doc.slug}.mdx`);
    await fs.writeFile(filePath, fullContent, 'utf-8');

    console.log(`文档已同步到文件系统: ${filePath}`);
  } catch (error) {
    console.error('同步到文件系统失败:', error);
    throw new Error('文件系统同步失败');
  }
}

/**
 * 转义 YAML 特殊字符
 */
function escapeYaml(str: string): string {
  return str
    .replace(/"/g, '\\"') // 转义双引号
    .replace(/\n/g, '\\n') // 转义换行
    .replace(/\r/g, '\\r'); // 转义回车
}

/**
 * 从文件系统删除文档
 */
export async function deleteDocumentFromFileSystem(slug: string): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'docs', `${slug}.mdx`);
    await fs.unlink(filePath);
    console.log(`文件已删除: ${filePath}`);
  } catch (error) {
    console.error('删除文件失败:', error);
    // 不抛出错误，因为文件可能不存在
  }
}

/**
 * 生成 MDX 文件名（确保唯一）
 */
export function generateMdxFilename(slug: string): string {
  return `${slug}.mdx`;
}
