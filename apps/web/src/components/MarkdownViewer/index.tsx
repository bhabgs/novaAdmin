import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Spin, message } from 'antd';
import 'highlight.js/styles/github.css';
// 引入 GitHub Markdown 的基础排版样式，使渲染效果更接近 GitHub
import 'github-markdown-css/github-markdown.css';
import './index.module.less';

interface MarkdownViewerProps {
  url?: string;
  content?: string;
  className?: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ url, content, className }) => {
  const [markdown, setMarkdown] = useState<string>(content || '');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (url) {
      setLoading(true);
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load markdown file');
          }
          return response.text();
        })
        .then((text) => {
          setMarkdown(text);
          setLoading(false);
        })
        .catch((error) => {
          message.error('加载 Markdown 文件失败');
          console.error('Error loading markdown:', error);
          setLoading(false);
        });
    } else if (content) {
      setMarkdown(content);
    }
  }, [url, content]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    // 新增 markdown-body 类以启用 github-markdown-css 的样式
    <div className={`markdown-viewer markdown-body ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
