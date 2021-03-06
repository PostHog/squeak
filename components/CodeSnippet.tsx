import { useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import useActiveOrganization from '../hooks/useActiveOrganization'

interface Props {
    className?: string
    allQuestions?: boolean
}

const CodeSnippet: React.VoidFunctionComponent<Props> = ({ allQuestions, ...rest }) => {
    const { getActiveOrganization } = useActiveOrganization()
    const organizationId = getActiveOrganization()
    const [snippetCopied, setSnippetCopied] = useState(false)

    const snippet = `<div id="squeak-root" style="max-width: 450px"></div>
<script>
(function() {
    window.squeak = {
        supabase: {
            apiKey: "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}",
            url: "${process.env.NEXT_PUBLIC_SUPABASE_URL}",
        },
        apiHost: "https://${typeof window !== 'undefined' && window.location.host}",
        organizationId: "${organizationId}"${
        allQuestions
            ? `,
        slug: false`
            : ''
    }
    };
    var d = document,
        s = d.createElement("script");
    s.src = "//dfpw97x0gednn.cloudfront.net/squeak.js";
    (d.head || d.body).appendChild(s);
})();
</script>`

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

            <button onClick={copyToClipboard} className="mt-2 text-accent-light font-semibold flex space-x-2 pl-8">
                <span>Copy to clipboard</span>
                {snippetCopied && <span className="text-green-600 font-normal">Copied</span>}
            </button>
        </>
    )
}

export default CodeSnippet
