import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={cn("prose prose-sm max-w-none prose-gray", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headers
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-gray-900 mb-3 mt-4 first:mt-0 border-b border-gray-200 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-gray-800 mb-3 mt-4 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-primary-700 mb-2 mt-3 first:mt-0">
              {children}
            </h3>
          ),
          
          // Paragraphs
          p: ({ children }) => (
            <p className="text-gray-700 mb-3 leading-relaxed last:mb-0">
              {children}
            </p>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4 ml-0 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-4 ml-6 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => {
            const content = children?.toString() || '';
            const isJobDetail = content.includes('**') && (content.includes('Title') || content.includes('Level') || content.includes('Location') || content.includes('Department') || content.includes('Employment'));
            
            if (isJobDetail) {
              return (
                <li className="flex items-start gap-3 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <span className="text-blue-600 font-bold mt-0.5">📋</span>
                  <span className="text-gray-800 flex-1">{children}</span>
                </li>
              );
            }
            
            return (
              <li className="text-gray-700 relative flex items-start gap-2">
                <span className="text-primary-500 font-bold mt-1 flex-shrink-0">•</span>
                <span className="flex-1">{children}</span>
              </li>
            );
          },
          
          // Code
          code: ({ children, ...props }) => {
            const inline = !props.className?.includes('language-');
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-gray-50 border rounded-lg p-3 overflow-x-auto mb-3">
                <code className="text-sm font-mono text-gray-800" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          
          // Emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-700">{children}</em>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary-200 pl-4 py-2 bg-primary-50 rounded-r-lg mb-3">
              <div className="text-gray-700 italic">{children}</div>
            </blockquote>
          ),
          
          // Links
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-primary-600 hover:text-primary-700 underline decoration-primary-200 hover:decoration-primary-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-gray-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
              {children}
            </td>
          ),
          
          // Horizontal rule
          hr: () => (
            <hr className="my-6 border-gray-200" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Custom component for job-related content with special formatting
export function JobMarkdownMessage({ content }: { content: string }) {
  // Enhanced job content processing
  const processedContent = content
    // Style job details with icons
    .replace(/\*\*Title\*\*/g, '🎯 **Title**')
    .replace(/\*\*One-liner\*\*/g, '📝 **Summary**')
    .replace(/\*\*Location\*\*/g, '📍 **Location**')
    .replace(/\*\*Level\*\*/g, '📊 **Level**')
    .replace(/\*\*Department\*\*/g, '🏢 **Department**')
    .replace(/\*\*Employment Type\*\*/g, '💼 **Employment Type**')
    .replace(/\*\*Responsibilities\*\*/g, '🎯 **Key Responsibilities**')
    .replace(/\*\*Requirements\*\*/g, '✅ **Requirements**');
  
  return (
    <MarkdownMessage 
      content={processedContent}
      className="prose-blue prose-lg"
    />
  );
}
