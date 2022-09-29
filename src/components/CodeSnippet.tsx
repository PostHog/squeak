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

            <button onClick={copyToClipboard} className="flex pl-8 mt-2 space-x-2 font-semibold text-accent-light">
                <span>Copy to clipboard</span>
                {snippetCopied && <span className="font-normal text-green-600">Copied</span>}
            </button>
        </>
    )
}

export default CodeSnippet
