'use client';

import { useState, useEffect, useRef } from 'react';
import { DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/page';
import { ChevronRight, ChevronLeft, FileText } from 'lucide-react';
import type { TableOfContents } from 'fumadocs-core/server';

interface CustomDocsPageProps {
    toc?: TableOfContents;
    children: React.ReactNode;
    title?: string;
    description?: string;
    content?: string;
}

export function CustomDocsPage({
    toc,
    children,
    title,
    description,
    content = ''
}: CustomDocsPageProps) {
  const [isTocVisible, setIsTocVisible] = useState(true);
  const [wordCount, setWordCount] = useState(0);

  // 计算字数 - 使用ref来获取实际渲染的内容
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const calculateWordCount = () => {
      let textContent = '';
      
      // 优先从DOM获取实际渲染的文本
      if (contentRef.current) {
        textContent = contentRef.current.textContent || '';
      } else if (content) {
        // 回退到传入的content
        textContent = content.toString();
      }
      
      if (textContent) {
        // 简化的文本清理，只保留实际文字
        const cleanText = textContent
          .replace(/\s+/g, ' ') // 合并多个空格和换行
          .trim();
        
        // 中文字符按1个字符计算，英文单词按单词数计算
        const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = cleanText
          .replace(/[\u4e00-\u9fa5]/g, '') // 移除中文字符
          .split(/\s+/)
          .filter(word => word.length > 0).length;
        
        setWordCount(chineseChars + englishWords);
      } else {
        setWordCount(0);
      }
    };

    // 使用setTimeout确保DOM已渲染
    const timer = setTimeout(calculateWordCount, 100);
    return () => clearTimeout(timer);
  }, [content, title]); // 依赖content和title，确保页面切换时重新计算

    const toggleToc = () => {
        setIsTocVisible(!isTocVisible);
    };

    // 渲染目录项 - 支持扁平结构（基于depth属性）
    const renderTocItem = (item: any) => {
        // 使用 depth 属性或者从 url 推断层级
        const level = item.depth || 0;

        const indentClass = level === 1 ? 'pl-0' :
            level === 2 ? 'pl-3' :
                level === 3 ? 'pl-6' :
                    level === 4 ? 'pl-9' :
                        level === 5 ? 'pl-12' : 'pl-15';

        const textSizeClass = level === 1 ? 'text-sm' : level === 2 ? 'text-sm' : 'text-xs';
        const fontWeightClass = level === 1 ? 'font-semibold' : level === 2 ? 'font-medium' : 'font-normal';
        const textColorClass = level === 1 ? 'text-gray-900 dark:text-gray-100' :
            level === 2 ? 'text-gray-700 dark:text-gray-300' :
                level === 3 ? 'text-gray-600 dark:text-gray-400' :
                    'text-gray-500 dark:text-gray-500';

        return (
            <div key={item.url}>
                <a
                    href={item.url}
                    className={`block py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${textSizeClass} ${fontWeightClass} ${textColorClass} ${indentClass} border-l-2 border-transparent `}
                >
                    <div className="flex items-center">
                        {/* 简化的层级指示器 */}
                        {level > 1 && (
                            <span className="text-gray-400 dark:text-gray-600 mr-2 text-xs">
                                {''}
                            </span>
                        )}

                        <span className="truncate">{item.title}</span>
                    </div>
                </a>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen">
            {/* 主内容区域 */}
            <div className={`flex-1 ${isTocVisible && toc && toc.length > 0 ? 'mr-80' : ''} transition-all duration-300`}>
                <div className="max-w-4xl mx-auto px-6 py-8">
                    {title && <DocsTitle>{title}</DocsTitle>}
                    {description && <DocsDescription>{description}</DocsDescription>}
                    <div ref={contentRef}>
                        <DocsBody>
                            {children}
                        </DocsBody>
                    </div>

                    {/* 字数统计 */}
                    <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <FileText size={16} />
                                <span>本文共 {wordCount} 字</span>
                            </div>
                            <div className="text-xs">
                                最后更新: {new Date().toLocaleDateString('zh-CN')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 右侧目录侧边栏 */}
            {toc && toc.length > 0 && (
                <div className={`fixed right-0 top-0 h-full bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 transition-transform duration-300 z-40 ${isTocVisible ? 'translate-x-0' : 'translate-x-full'
                    }`} style={{ width: '320px' }}>
                    {/* 侧边栏头部 */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-blue-500 dark:text-blue-400" />
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">文档目录</h3>
                        </div>
                        <button
                            onClick={toggleToc}
                            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="隐藏目录"
                        >
                            <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* 目录内容 */}
                    <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
                        <nav className="space-y-1">
                            {toc.map((item) => renderTocItem(item))}
                        </nav>
                    </div>
                </div>
            )}

            {/* 目录切换按钮（当侧边栏隐藏时显示） */}
            {toc && toc.length > 0 && !isTocVisible && (
                <button
                    onClick={toggleToc}
                    className="fixed right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    aria-label="显示目录"
                >
                    <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
            )}
        </div>
    );
}

