interface Props {
    activeTab?: string
}

const SetupLayout: React.FunctionComponent<Props> = ({ activeTab, children }) => {
    return <>{children}</>
}

export default SetupLayout
