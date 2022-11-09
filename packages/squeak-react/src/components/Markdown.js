import Highlight, { defaultProps } from 'prism-react-renderer'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

export default function Markdown({ children }) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeSanitize]}
      components={{
        pre: ({ children }) => {
          return (
            <Highlight
              {...defaultProps}
              code={children[0]?.props?.children[0]}
              language='js'
            >
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={className} style={style}>
                  {tokens.map((line, i) => (
                    <div {...getLineProps({ line, key: i })}>
                      {line.map((token, key) => (
                        <span {...getTokenProps({ token, key })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          )
        },
        a: ({ node, ...props }) => {
          return <a rel='nofollow' {...props} />
        }
      }}
      className='squeak-post-markdown'
    >
      {children}
    </ReactMarkdown>
  )
}
