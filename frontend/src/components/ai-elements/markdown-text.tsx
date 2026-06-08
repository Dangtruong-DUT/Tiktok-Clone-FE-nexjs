'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownTextProps {
    content: string
    className?: string
}

export function MarkdownText({ content, className }: MarkdownTextProps) {
    return (
        <div className={cn('text-sm text-foreground break-words', className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className='text-sm font-bold text-foreground mt-4 mb-1.5 first:mt-0'>{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-1 first:mt-0'>
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className='text-xs font-semibold text-foreground mt-3 mb-0.5 first:mt-0'>{children}</h3>
                    ),
                    p: ({ children }) => <p className='leading-relaxed text-foreground mb-2 last:mb-0'>{children}</p>,
                    ul: ({ children }) => (
                        <ul className='list-disc pl-4 space-y-0.5 mb-2 last:mb-0 text-foreground'>{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className='list-decimal pl-4 space-y-0.5 mb-2 last:mb-0 text-foreground'>{children}</ol>
                    ),
                    li: ({ children }) => <li className='leading-relaxed'>{children}</li>,
                    strong: ({ children }) => <strong className='font-semibold text-foreground'>{children}</strong>,
                    em: ({ children }) => <em className='italic'>{children}</em>,
                    code: ({ children, className: codeClass }) => {
                        const isBlock = codeClass?.startsWith('language-')
                        if (isBlock) {
                            return (
                                <code
                                    className='block rounded-lg bg-muted border border-border px-3 py-2
                                                 text-[0.8em] font-mono text-foreground whitespace-pre-wrap my-2'
                                >
                                    {children}
                                </code>
                            )
                        }
                        return (
                            <code className='rounded bg-muted px-1 py-0.5 text-[0.8em] font-mono text-foreground'>
                                {children}
                            </code>
                        )
                    },
                    pre: ({ children }) => <>{children}</>,
                    hr: () => <hr className='border-border my-3' />,
                    blockquote: ({ children }) => (
                        <blockquote className='border-l-2 border-primary/40 pl-3 text-muted-foreground italic my-2'>
                            {children}
                        </blockquote>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary underline underline-offset-2 hover:opacity-80'
                        >
                            {children}
                        </a>
                    ),
                    table: ({ children }) => (
                        <div className='overflow-x-auto my-2'>
                            <table className='w-full text-xs border-collapse'>{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead>{children}</thead>,
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => <tr className='border-b border-border last:border-0'>{children}</tr>,
                    th: ({ children }) => (
                        <th className='text-left px-2 py-1 font-semibold text-muted-foreground whitespace-nowrap bg-muted/40'>
                            {children}
                        </th>
                    ),
                    td: ({ children }) => <td className='px-2 py-1 text-foreground'>{children}</td>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
