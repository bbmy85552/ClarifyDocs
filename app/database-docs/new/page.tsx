'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MdxEditor } from '@/components/editor/mdx-editor-with-highlight';
import { MetadataForm, DocumentMetadata } from '@/components/editor/metadata-form';
import { Save, Eye, Loader2, AlertCircle } from 'lucide-react';
import { validateMdxContent } from '@/lib/content-validation';

export default function NewDocumentPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [metadata, setMetadata] = useState<DocumentMetadata>({
    title: '',
    description: '',
    slug: '',
    category: 'general',
    tags: [],
    status: 'draft',
  });

  const [content, setContent] = useState('');

  // 权限验证
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // 保存文档
  const handleSave = async (publish = false) => {
    if (!metadata.title.trim()) {
      setMessage({ type: 'error', text: '请输入标题' });
      return;
    }

    if (!content.trim()) {
      setMessage({ type: 'error', text: '请输入内容' });
      return;
    }

    // 不再验证内容格式（数据库优先架构）
    // 任何格式的内容都可以保存！

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metadata,
          content,
          status: publish ? 'published' : 'draft',
          author_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '保存失败');
      }

      setMessage({ type: 'success', text: publish ? '发布成功！' : '保存成功！' });

      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        router.push(`/database-docs/${data.document.id}/edit`);
      }, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '保存失败',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                创建新文档
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                disabled={isSaving}
              >
                取消
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                保存草稿
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                发布
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      {showTips && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  重要提示：Markdown 语法规则
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 mb-3">
                  <li>• 代码必须使用代码块：{"```"}语言名{"```"}</li>
                  <li>• 例如：{"```"}python {"```"} 或 {"```"}javascript {"```"}</li>
                  <li>• 直接粘贴代码会导致解析错误！</li>
                </ul>
                <div className="bg-white dark:bg-gray-900 rounded p-3 text-sm">
                  <p className="font-mono text-xs mb-2 text-gray-600 dark:text-gray-400">正确示例：</p>
                  <pre className="text-xs">{`# 标题

## 简介

这是文档简介。

\`\`\`python
import os
print("Hello")
\`\`\`

- 列表项 1
- 列表项 2`}</pre>
                </div>
                <button
                  onClick={() => setShowTips(false)}
                  className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  知道了，关闭提示
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：元数据表单 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                文档信息
              </h2>
              <MetadataForm
                initialData={metadata}
                onChange={setMetadata}
              />
            </div>
          </div>

          {/* 右侧：编辑器 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <MdxEditor
                initialValue={content}
                onChange={setContent}
                height="700px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
