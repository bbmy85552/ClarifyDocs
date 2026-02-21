'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface Document {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  created_at: string;
  updated_at: string;
  view_count: number;
}

interface Heading {
  id: string;
  text: string;
  level: number;
  originalText: string;
}

export default function DatabaseDocDetailPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [headingIdMap, setHeadingIdMap] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState<string>('');

  // 监听滚动，高亮当前标题
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 100; // 偏移量

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  useEffect(() => {
    fetchDocument();
    fetchDocuments();
  }, [docId]);

  const fetchDocument = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/documents/${docId}`);

      if (!response.ok) {
        throw new Error('文档不存在');
      }

      const data = await response.json();
      setCurrentDoc(data.document);

      // 提取目录
      extractHeadings(data.document.content);
    } catch (err) {
      console.error('加载文档失败:', err);
      router.push('/database-docs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents?status=published');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('获取文档列表失败:', error);
    }
  };

  const extractHeadings = (content: string) => {
    const foundHeadings: Heading[] = [];
    const idMap: Record<string, string> = {};
    let headingCounter = 1;

    // 先移除所有代码块，避免将代码注释误识别为标题
    const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');

    // 提取标题（H1-H3）
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    let match;

    while ((match = headingRegex.exec(contentWithoutCodeBlocks)) !== null) {
      const level = match[1].length;
      let text = match[2].trim();

      // 清理文本：移除可能的 Markdown 格式符号
      text = text
        .replace(/^#+\s*/, '') // 移除开头的井号
        .replace(/\*\*(.+?)\*\*/g, '$1') // 移除加粗符号
        .replace(/\*(.+?)\*/g, '$1') // 移除斜体符号
        .replace(/`(.+?)`/g, '$1'); // 移除行内代码符号

      const originalText = text;

      // 生成基础 id
      let baseId = text
        .toLowerCase()
        .replace(/[^\w\s\u4e00-\u9fa5-]/g, '') // 保留中文字符
        .replace(/\s+/g, '-');

      // 如果 baseId 为空或只有短横线，使用计数器
      if (!baseId || baseId === '-') {
        baseId = `heading-${headingCounter++}`;
      }

      // 检查是否已存在，如果存在则添加后缀
      let id = baseId;
      let counter = 1;
      while (foundHeadings.some(h => h.id === id)) {
        id = `${baseId}-${counter++}`;
      }

      foundHeadings.push({ id, text, level, originalText });
      idMap[originalText] = id;
    }

    setHeadings(foundHeadings);
    setHeadingIdMap(idMap);
  };

  // 从 React children 中提取纯文本
  const extractText = (children: React.ReactNode): string => {
    if (typeof children === 'string') {
      return children;
    }
    if (typeof children === 'number') {
      return children.toString();
    }
    if (Array.isArray(children)) {
      return children.map(extractText).join('');
    }
    if (children && typeof children === 'object' && 'props' in children) {
      return extractText((children as any).props.children);
    }
    return '';
  };

  const scrollToHeading = (id: string) => {
    const element = window.document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!currentDoc) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            文档不存在
          </h1>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 左侧导航 */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 hidden lg:block bg-gray-50 dark:bg-gray-900 flex-shrink-0">
        <Link
          href="/database-docs"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          文档列表
        </div>
        <nav className="space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/database-docs/${doc.id}`}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                currentDoc?.id === doc.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {doc.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* 中间内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 顶部工具栏 */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Eye className="w-4 h-4" />
              {currentDoc.view_count}
            </div>
            <Link
              href={`/database-docs/${currentDoc.id}/edit`}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Edit className="w-4 h-4" />
              编辑
            </Link>
          </div>
        </div>

        {/* 文档内容 */}
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* 标题部分 */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {currentDoc.title}
            </h1>
            {currentDoc.description && (
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {currentDoc.description}
              </p>
            )}
          </div>

          {/* Markdown 渲染的内容 */}
          <article className="prose dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                h1: ({ children }: { children?: React.ReactNode }) => {
                  const text = extractText(children);
                  const id = headingIdMap[text] || `heading-${Math.random().toString(36).substr(2, 9)}`;
                  return <h1 id={id} className="text-3xl font-bold mb-4 scroll-mt-20">{children}</h1>;
                },
                h2: ({ children }: { children?: React.ReactNode }) => {
                  const text = extractText(children);
                  const id = headingIdMap[text] || `heading-${Math.random().toString(36).substr(2, 9)}`;
                  return <h2 id={id} className="text-2xl font-semibold mb-3 mt-6 scroll-mt-20">{children}</h2>;
                },
                h3: ({ children }: { children?: React.ReactNode }) => {
                  const text = extractText(children);
                  const id = headingIdMap[text] || `heading-${Math.random().toString(36).substr(2, 9)}`;
                  return <h3 id={id} className="text-xl font-semibold mb-2 mt-4 scroll-mt-20">{children}</h3>;
                },
                h4: ({ children }: { children?: React.ReactNode }) => {
                  const text = extractText(children);
                  const id = headingIdMap[text] || `heading-${Math.random().toString(36).substr(2, 9)}`;
                  return <h4 id={id} className="text-lg font-semibold mb-2 mt-4 scroll-mt-20">{children}</h4>;
                },
                p: ({ children }: { children?: React.ReactNode }) => (
                  <p className="mb-4 leading-7">{children}</p>
                ),
                code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
                  if (className?.includes('language-')) {
                    return <code className={className}>{children}</code>;
                  }
                  return (
                    <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }: { children?: React.ReactNode }) => (
                  <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                ul: ({ children }: { children?: React.ReactNode }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
                ),
                ol: ({ children }: { children?: React.ReactNode }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
                ),
                li: ({ children }: { children?: React.ReactNode }) => (
                  <li className="ml-6">{children}</li>
                ),
                a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
                  <a href={href} className="text-blue-600 hover:text-blue-700 underline">
                    {children}
                  </a>
                ),
                blockquote: ({ children }: { children?: React.ReactNode }) => (
                  <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic text-gray-700 dark:text-gray-300 my-4">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }: { children?: React.ReactNode }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                hr: () => <hr className="my-8 border-gray-200 dark:border-gray-700" />,
              }}
            >
              {currentDoc.content}
            </ReactMarkdown>
          </article>

          {/* 元信息 */}
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div>
                创建于 {new Date(currentDoc.created_at).toLocaleString('zh-CN')}
              </div>
              <div>
                更新于 {new Date(currentDoc.updated_at).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧目录 */}
      {headings.length > 0 && (
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-4 hidden lg:block bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            目录
          </h3>
          <nav className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 50px)' }}>
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                className={`block w-full text-left py-1.5 px-2 rounded-md text-sm transition-colors ${
                  activeId === heading.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={{
                  paddingLeft: `${(heading.level - 1) * 0.75}rem`,
                }}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
