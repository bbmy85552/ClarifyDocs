'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FileText, Plus, FolderOpen, Loader2, File } from 'lucide-react';

interface Document {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CategoryGroup {
  category: string;
  documents: Document[];
}

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('获取文档失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 按分类分组文档
  const groupedDocuments = documents.reduce((groups: Record<string, Document[]>, doc) => {
    const category = doc.category || '未分类';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(doc);
    return groups;
  }, {});

  const categoryGroups: CategoryGroup[] = Object.entries(groupedDocuments).map(([category, docs]) => ({
    category,
    documents: docs,
  }));

  if (authLoading || isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex flex-1 flex-col justify-center text-center">
        <h1 className="mb-4 text-3xl font-bold">欢迎使用文档平台</h1>
        <p className="text-fd-muted-foreground mb-8">
          登录以创建和管理你的文档
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          登录
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            我的文档
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            共 {documents.length} 篇文档
          </p>
        </div>
        <Link
          href="/database-docs/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          新建文档
        </Link>
      </div>

      {categoryGroups.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            还没有文档
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            点击右上角的"新建文档"按钮创建你的第一篇文档
          </p>
          <Link
            href="/database-docs/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            创建第一篇文档
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryGroups.map((group) => (
            <div
              key={group.category}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* 分类标题 */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-gray-400" />
                  {group.category}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({group.documents.length})
                  </span>
                </h2>
              </div>

              {/* 文档列表 */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {group.documents.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/database-docs/${doc.id}`}
                    className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <File className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <span className={`px-2 py-0.5 rounded ${
                            doc.status === 'published'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {doc.status === 'published' ? '已发布' : '草稿'}
                          </span>
                          <span>
                            {new Date(doc.updated_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
