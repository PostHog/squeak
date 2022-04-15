import React, { useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'

interface Props {}

const SlackManifestSnippet: React.VoidFunctionComponent<Props> = () => {
    const [manifestCopied, setManifestCopied] = useState(false)

    const manifest = `display_information:
  name: Squeak
  description: A Q&A widget for your docs
  background_color: "#F97316"
features:
  app_home:
    home_tab_enabled: false
    messages_tab_enabled: true
    messages_tab_read_only_enabled: true
  bot_user:
    display_name: Squeak
    always_online: true
oauth_config:
  scopes:
    bot:
      - channels:history
      - channels:join
      - channels:manage
      - channels:read
      - chat:write.customize
      - chat:write.public
      - chat:write
settings:
  interactivity:
    is_enabled: true
  org_deploy_enabled: false
  socket_mode_enabled: true
  token_rotation_enabled: false
`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(manifest)
        setManifestCopied(true)
        setTimeout(() => {
            setManifestCopied(false)
        }, 2000)
    }

    return (
        <>
            <p className='font-semibold'>
                1. Create a Slack App at{' '}
                <a target="_blank" rel="noreferrer" href="https://api.slack.com/apps?new_app=1">
                    https://api.slack.com/apps
                </a>
                , from the following app manifest:
            </p>

            <SyntaxHighlighter className="max-h-40 overflow-scroll text-sm rounded">{manifest}</SyntaxHighlighter>

            <button onClick={copyToClipboard} className="mt-2 mb-6 text-accent-light font-semibold flex space-x-2">
                <span>Copy to clipboard</span>
                {manifestCopied && <span className="text-green-600 font-normal">Copied</span>}
            </button>
        </>
    )
}

export default SlackManifestSnippet
