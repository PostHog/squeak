import { useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'

const snippet = `<div id="squeak-root" style="max-width: 450px"></div>
<script>
(function() {
    window.squeak = {
        suapabase: {
            apiKey: "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}",
            url: "${process.env.NEXT_PUBLIC_SUPABASE_URL}",
        },
        apiHost: "//${typeof window !== 'undefined' && window.location.host}",
    };
    var d = document,
        s = d.createElement("script");
    s.src = "//${typeof window !== 'undefined' && window.location.host}/snippet/squeak.js";
    (d.head || d.body).appendChild(s);
})();
</script>`

interface Props {
    className?: string
}

const CodeSnippet: React.VoidFunctionComponent<Props> = ({ ...rest }) => {
    const [snippetCopied, setSnippetCopied] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(snippet)
        setSnippetCopied(true)
        setTimeout(() => {
            setSnippetCopied(false)
        }, 2000)
    }

    return (
        <>
            <SyntaxHighlighter language="htmlbars" {...rest}>
                {snippet}
            </SyntaxHighlighter>

            <button onClick={copyToClipboard} className="mt-2 mb-12 text-accent-light font-semibold flex space-x-2">
                <span>Copy to clipboard</span>
                {snippetCopied && <span className="text-green-600 font-normal">Copied</span>}
            </button>
        </>
    )
}

export default CodeSnippet
