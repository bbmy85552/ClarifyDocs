import { loader } from 'fumadocs-core/source';
import { createPage } from 'fumadocs-core/page';

// 从数据库读取文档的 loader
export const databaseSource = loader({
  baseUrl: '/database-docs',

  source: async () => {
    // 从数据库获取所有已发布的文档
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/documents?status=published`);

    if (!response.ok) {
      throw new Error('Failed to fetch documents from database');
    }

    const data = await response.json();
    const documents = data.documents || [];

    // 转换为 Fumadocs 需要的格式
    const pages = documents.map((doc: any) => {
      // 解析 frontmatter（从 title, description 等）
      const frontmatter = {
        title: doc.title,
        description: doc.description,
      };

      // 创建页面
      return createPage([
        {
          type: 'folder',
          name: 'database-docs',
        },
        {
          type: 'page',
          path: doc.id.toString(), // 使用 ID 作为路径
          slug: doc.slug,
          content: doc.content,
          data: {
            ...frontmatter,
            id: doc.id,
            slug: doc.slug,
            createdAt: doc.created_at,
            updatedAt: doc.updated_at,
          },
        },
      ]);
    });

    return {
      pages,
    };
  },
});
