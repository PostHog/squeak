import { useRouter } from 'next/router'
import Head from 'next/head'

const nav = [
    {
        title: 'Welcome to Squeak!',
        url: '/setup/welcome',
    },
    {
        title: 'Database',
        url: '/setup/database',
    },
    {
        title: 'Administration',
        url: '/setup/administration',
    },
    {
        title: 'Thread notifications',
        url: '/setup/notifications',
    },
    {
        title: 'Moderator alerts',
        url: '/setup/alerts',
    },
    {
        title: 'Install JS snippet',
        url: '/setup/snippet',
    },
]

interface Props {
    title: string
    subtitle: string
}

const SetupLayout: React.FunctionComponent<Props> = ({ children, title, subtitle }) => {
    const router = useRouter()

    return (
        <>
            <Head>
                <title>Squeak! | {title}</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main className="grid grid-cols-3 min-h-screen divide-x-2 divide-dashed divide-gray-300 setup-layout px-5">
                <aside className="flex justify-end pr-12 pt-12">
                    <div className="flex flex-col items-center">
                        <svg fill="none" width="200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 236 107">
                            <g filter="url(#a)">
                                <path
                                    d="M40.237 63.005a37.502 37.502 0 0 1-6.835-.352c-2.326-.367-4.335-.93-6.027-1.685-.993-.426-1.705-1.027-2.136-1.802-.43-.775-.61-1.579-.538-2.412.07-.869.343-1.639.82-2.309a3.517 3.517 0 0 1 1.94-1.438c.817-.288 1.758-.22 2.823.202 1.398.624 2.97 1.08 4.714 1.364 1.743.248 3.37.34 4.883.274 2.377-.104 4.02-.482 4.93-1.135.944-.691 1.396-1.505 1.355-2.441-.036-.828-.407-1.48-1.113-1.954-.67-.476-1.86-.857-3.569-1.144l-6.38-1.074c-6.907-1.178-10.485-4.613-10.733-10.303-.108-2.485.463-4.693 1.714-6.624 1.287-1.933 3.115-3.456 5.484-4.57 2.367-1.15 5.154-1.794 8.359-1.934a25.645 25.645 0 0 1 5.7.4c1.963.312 3.664.851 5.105 1.618 1.106.53 1.825 1.292 2.157 2.288.33.96.336 1.916.017 2.868-.32.952-.938 1.664-1.856 2.137-.881.472-2.037.45-3.467-.065a15.249 15.249 0 0 0-3.61-.87 19.812 19.812 0 0 0-3.798-.214c-2.017.088-3.55.516-4.599 1.283-1.05.732-1.551 1.656-1.503 2.772.035.793.387 1.427 1.058 1.903.67.476 1.841.858 3.514 1.145l6.325 1.078c7.016 1.173 10.644 4.515 10.884 10.025.109 2.485-.463 4.675-1.716 6.57-1.252 1.895-3.063 3.4-5.432 4.513-2.369 1.114-5.192 1.742-8.47 1.886Z"
                                    fill="url(#b)"
                                />
                                <path
                                    d="M80.924 70.864c-3.205.14-4.878-1.411-5.02-4.653l-.375-8.59c-.706 1.186-1.763 2.17-3.172 2.953-1.375.746-2.909 1.156-4.602 1.23-2.269.099-4.31-.372-6.123-1.411-1.778-1.041-3.216-2.584-4.316-4.629-1.064-2.047-1.658-4.492-1.782-7.338-.126-2.88.253-5.37 1.136-7.465.917-2.133 2.216-3.795 3.896-4.987 1.716-1.193 3.709-1.84 5.977-1.939 1.765-.077 3.384.232 4.858.925 1.508.656 2.65 1.598 3.425 2.828.172-2.678 1.68-4.08 4.526-4.203 3.17-.139 4.824 1.395 4.964 4.6l1.204 27.606c.07 1.585-.292 2.81-1.084 3.674-.792.865-1.963 1.33-3.512 1.398ZM70.526 54.592c1.44-.063 2.605-.655 3.495-1.776.889-1.122 1.282-2.87 1.178-5.248-.105-2.413-.65-4.121-1.631-5.125-.984-1.04-2.196-1.528-3.636-1.465-1.477.065-2.66.657-3.55 1.779-.89 1.085-1.283 2.834-1.178 5.247.104 2.377.648 4.086 1.631 5.125.984 1.04 2.214 1.528 3.69 1.463Z"
                                    fill="url(#c)"
                                />
                                <path
                                    d="M97.583 60.502c-3.458.15-6.056-.674-7.794-2.474-1.704-1.839-2.641-4.703-2.81-8.592l-.496-11.345c-.14-3.206 1.393-4.878 4.598-5.018 1.549-.068 2.756.295 3.62 1.087.865.792 1.33 1.962 1.398 3.511l.507 11.615c.113 2.593 1.286 3.841 3.519 3.744 1.297-.057 2.339-.571 3.126-1.544.788-.972 1.148-2.233 1.08-3.782l-.452-10.372c-.14-3.206 1.393-4.878 4.598-5.018 1.549-.068 2.755.294 3.62 1.087.864.792 1.33 1.962 1.398 3.511l.78 17.882c.142 3.241-1.336 4.93-4.434 5.065-2.773.12-4.396-1.107-4.869-3.685-1.613 2.74-4.076 4.183-7.39 4.328Z"
                                    fill="url(#d)"
                                />
                                <path
                                    d="M131.325 59.03c-3.241.14-6.075-.295-8.501-1.308-2.391-1.05-4.262-2.592-5.614-4.626-1.352-2.034-2.09-4.473-2.214-7.319-.118-2.7.372-5.122 1.469-7.263 1.134-2.142 2.72-3.835 4.758-5.079 2.073-1.28 4.46-1.98 7.162-2.098 2.665-.117 4.994.341 6.988 1.373 2.029 1.03 3.612 2.566 4.748 4.61 1.17 2.005 1.815 4.395 1.936 7.168.062 1.405-.736 2.143-2.393 2.216l-15.397.672c.4 1.714 1.174 2.925 2.324 3.633 1.149.707 2.715 1.018 4.696.932.756-.033 1.652-.163 2.689-.388a13.47 13.47 0 0 0 2.933-.994c1.134-.483 2.107-.525 2.918-.128.809.362 1.359.97 1.649 1.823.324.816.326 1.681.005 2.598-.286.878-.924 1.574-1.912 2.086a15.235 15.235 0 0 1-3.995 1.473c-1.392.35-2.808.556-4.249.618Zm-2.237-21.5c-1.441.063-2.61.547-3.509 1.453-.863.903-1.384 2.19-1.564 3.857l10.049-.439c-.182-1.688-.705-2.928-1.57-3.72-.83-.83-1.965-1.213-3.406-1.15Z"
                                    fill="url(#e)"
                                />
                                <path
                                    d="M152.81 58.092c-2.053.09-3.888-.21-5.506-.896-1.582-.69-2.851-1.662-3.808-2.92-.923-1.294-1.421-2.788-1.495-4.48-.083-1.91.355-3.444 1.315-4.605.958-1.197 2.543-2.078 4.756-2.643 2.211-.602 5.171-.984 8.881-1.145l2.053-.09-.033-.756c-.057-1.297-.439-2.2-1.147-2.71-.672-.513-1.818-.733-3.439-.663-.9.04-1.886.19-2.957.454-1.036.226-2.21.62-3.521 1.182-1.169.484-2.161.51-2.973.076-.813-.434-1.364-1.077-1.654-1.93-.256-.892-.204-1.778.154-2.66.393-.919 1.175-1.62 2.344-2.105 1.702-.687 3.269-1.17 4.7-1.45 1.466-.316 2.811-.501 4.035-.555 4.43-.193 7.749.618 9.958 2.435 2.244 1.814 3.456 4.774 3.635 8.88l.476 10.913c.141 3.241-1.264 4.926-4.218 5.055-2.809.123-4.367-1.252-4.672-4.126a6.409 6.409 0 0 1-2.452 3.355c-1.19.846-2.667 1.307-4.432 1.384Zm1.887-6.361c1.333-.058 2.431-.54 3.293-1.443.899-.905 1.318-2.06 1.256-3.465l-.042-.972-2.053.09c-2.125.092-3.681.395-4.669.907-.954.474-1.41 1.198-1.367 2.17.036.829.354 1.5.954 2.016.636.513 1.512.746 2.628.697Z"
                                    fill="url(#f)"
                                />
                                <path
                                    d="M175.785 56.981c-1.549.068-2.756-.295-3.62-1.087-.829-.794-1.277-1.983-1.347-3.568l-1.28-29.335c-.141-3.241 1.373-4.93 4.542-5.07 1.549-.067 2.755.296 3.62 1.088.9.79 1.385 1.978 1.454 3.563l.778 17.828.109-.005 6.241-8.283c.852-1.156 1.645-2.003 2.38-2.54.77-.538 1.821-.837 3.154-.895 1.332-.058 2.373.221 3.122.838.748.617 1.144 1.411 1.186 2.384.079.97-.257 1.96-1.007 2.967l-5.429 7.056 6.954 8.033c.801 1.011 1.151 1.988 1.048 2.93-.069.906-.486 1.682-1.252 2.329-.731.609-1.691.94-2.88.991-1.476.065-2.658-.136-3.544-.603-.852-.504-1.735-1.295-2.648-2.374l-7.116-8.025-.108.005.293 6.699c.141 3.241-1.409 4.933-4.65 5.074Z"
                                    fill="url(#g)"
                                />
                                <path
                                    d="M203.099 42.799c-1.909.083-3.057-1.022-3.446-3.314l-2.603-16.233c-.334-1.861-.058-3.39.829-4.582.884-1.23 2.245-1.885 4.082-1.965 1.872-.081 3.285.452 4.237 1.601.951 1.114 1.341 2.612 1.171 4.496l-1.125 16.395c-.188 2.318-1.236 3.518-3.145 3.602Zm.559 12.803c-1.621.071-2.938-.359-3.953-1.289-.981-.967-1.505-2.225-1.572-3.774-.066-1.513.348-2.776 1.242-3.789.93-1.015 2.205-1.558 3.826-1.628 1.656-.073 2.974.357 3.953 1.289.979.931 1.501 2.153 1.567 3.666.068 1.549-.344 2.848-1.237 3.897-.894 1.013-2.169 1.556-3.826 1.628Z"
                                    fill="url(#h)"
                                />
                            </g>
                            <rect
                                x="206.66"
                                y="13.909"
                                width="28.384"
                                height="12.421"
                                rx="2.304"
                                transform="rotate(2.702 206.66 13.909)"
                                fill="#1D4AFF"
                            />
                            <path
                                d="M209.838 23.528c-.497-.023-.734-.284-.711-.78l.236-4.999c.024-.497.284-.733.781-.71l2.227.105c.694.033 1.221.208 1.581.527.366.318.537.739.512 1.26a1.542 1.542 0 0 1-.3.88c-.183.238-.431.41-.744.52.364.12.637.318.821.591.19.274.276.604.258.99-.027.577-.251 1.019-.671 1.325-.414.3-.968.434-1.661.401l-2.329-.11Zm.797-3.79 1.362.064c.7.033 1.062-.22 1.088-.76.025-.535-.312-.818-1.012-.851l-1.362-.064-.076 1.61Zm-.131 2.76 1.519.072c.368.018.642-.04.82-.173.179-.133.275-.344.288-.632.014-.282-.062-.498-.227-.648-.166-.149-.432-.232-.8-.25l-1.519-.071-.081 1.703ZM216.054 23.822c-.497-.024-.734-.284-.711-.781l.236-4.998c.024-.497.284-.734.781-.71l3.212.15c.375.019.553.212.536.58-.018.374-.214.552-.588.535l-2.596-.123-.072 1.519 2.384.112c.381.018.562.214.545.589-.018.374-.217.552-.598.534l-2.384-.112-.076 1.62 2.596.122c.374.018.552.21.535.58-.018.373-.214.552-.588.534l-3.212-.151ZM222.957 24.23c-.233-.01-.408-.084-.524-.218-.117-.135-.17-.319-.159-.552l.22-4.657-1.629-.077c-.399-.02-.589-.225-.571-.618.019-.392.228-.58.626-.56l4.685.22c.399.02.59.225.571.618-.019.393-.227.58-.626.56l-1.629-.076-.22 4.657c-.011.233-.081.412-.21.535-.122.123-.3.18-.534.168ZM225.781 24.363c-.258-.012-.438-.106-.54-.283-.103-.177-.09-.389.039-.635l2.6-5.053c.108-.203.232-.348.371-.434a.777.777 0 0 1 .476-.125.781.781 0 0 1 .463.17c.13.098.237.253.319.466l2.131 5.276c.105.263.097.478-.021.645-.112.16-.288.235-.527.224-.209-.01-.369-.067-.481-.17-.106-.104-.197-.262-.273-.474l-.345-.902-3.028-.143-.419.866c-.102.21-.208.362-.317.455-.109.087-.258.127-.448.117Zm2.852-4.93-1.137 2.4 2.08.099-.924-2.497-.019-.001Z"
                                fill="#fff"
                            />
                            <defs>
                                <linearGradient
                                    id="b"
                                    x1="114.41"
                                    y1="4.12"
                                    x2="117.636"
                                    y2="78.049"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stop-color="#F54E00" />
                                    <stop offset="1" stop-color="#DC6726" />
                                </linearGradient>
                                <linearGradient
                                    id="c"
                                    x1="114.41"
                                    y1="4.12"
                                    x2="117.636"
                                    y2="78.049"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stop-color="#F54E00" />
                                    <stop offset="1" stop-color="#DC6726" />
                                </linearGradient>
                                <linearGradient
                                    id="d"
                                    x1="114.41"
                                    y1="4.12"
                                    x2="117.636"
                                    y2="78.049"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stop-color="#F54E00" />
                                    <stop offset="1" stop-color="#DC6726" />
                                </linearGradient>
                                <linearGradient
                                    id="e"
                                    x1="114.41"
                                    y1="4.12"
                                    x2="117.636"
                                    y2="78.049"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stop-color="#F54E00" />
                                    <stop offset="1" stop-color="#DC6726" />
                                </linearGradient>
                                <linearGradient
                                    id="f"
                                    x1="114.41"
                                    y1="4.12"
                                    x2="117.636"
                                    y2="78.049"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stop-color="#F54E00" />
                                    <stop offset="1" stop-color="#DC6726" />
                                </linearGradient>
                                <linearGradient
                                    id="g"
                                    x1="114.41"
                                    y1="4.12"
                                    x2="117.636"
                                    y2="78.049"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stop-color="#F54E00" />
                                    <stop offset="1" stop-color="#DC6726" />
                                </linearGradient>
                                <linearGradient
                                    id="h"
                                    x1="114.41"
                                    y1="4.12"
                                    x2="117.636"
                                    y2="78.049"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stop-color="#F54E00" />
                                    <stop offset="1" stop-color="#DC6726" />
                                </linearGradient>
                                <filter
                                    id="a"
                                    x=".848"
                                    y="5.529"
                                    width="231.389"
                                    height="101.197"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                    <feColorMatrix
                                        in="SourceAlpha"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                        result="hardAlpha"
                                    />
                                    <feOffset dy=".342" />
                                    <feGaussianBlur stdDeviation=".325" />
                                    <feColorMatrix values="0 0 0 0 0.803922 0 0 0 0 0.254902 0 0 0 0 0 0 0 0 0.0227446 0" />
                                    <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_412_5205" />
                                    <feColorMatrix
                                        in="SourceAlpha"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                        result="hardAlpha"
                                    />
                                    <feOffset dy=".821" />
                                    <feGaussianBlur stdDeviation=".782" />
                                    <feColorMatrix values="0 0 0 0 0.803922 0 0 0 0 0.254902 0 0 0 0 0 0 0 0 0.0341178 0" />
                                    <feBlend in2="effect1_dropShadow_412_5205" result="effect2_dropShadow_412_5205" />
                                    <feColorMatrix
                                        in="SourceAlpha"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                        result="hardAlpha"
                                    />
                                    <feOffset dy="1.546" />
                                    <feGaussianBlur stdDeviation="1.472" />
                                    <feColorMatrix values="0 0 0 0 0.803922 0 0 0 0 0.254902 0 0 0 0 0 0 0 0 0.0430068 0" />
                                    <feBlend in2="effect2_dropShadow_412_5205" result="effect3_dropShadow_412_5205" />
                                    <feColorMatrix
                                        in="SourceAlpha"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                        result="hardAlpha"
                                    />
                                    <feOffset dy="2.757" />
                                    <feGaussianBlur stdDeviation="2.626" />
                                    <feColorMatrix values="0 0 0 0 0.803922 0 0 0 0 0.254902 0 0 0 0 0 0 0 0 0.0509948 0" />
                                    <feBlend in2="effect3_dropShadow_412_5205" result="effect4_dropShadow_412_5205" />
                                    <feColorMatrix
                                        in="SourceAlpha"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                        result="hardAlpha"
                                    />
                                    <feOffset dy="5.157" />
                                    <feGaussianBlur stdDeviation="4.911" />
                                    <feColorMatrix values="0 0 0 0 0.803922 0 0 0 0 0.254902 0 0 0 0 0 0 0 0 0.0591434 0" />
                                    <feBlend in2="effect4_dropShadow_412_5205" result="effect5_dropShadow_412_5205" />
                                    <feColorMatrix
                                        in="SourceAlpha"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                        result="hardAlpha"
                                    />
                                    <feOffset dy="12.343" />
                                    <feGaussianBlur stdDeviation="11.755" />
                                    <feColorMatrix values="0 0 0 0 0.803922 0 0 0 0 0.254902 0 0 0 0 0 0 0 0 0.07 0" />
                                    <feBlend in2="effect5_dropShadow_412_5205" result="effect6_dropShadow_412_5205" />
                                    <feBlend in="SourceGraphic" in2="effect6_dropShadow_412_5205" result="shape" />
                                    <feColorMatrix
                                        in="SourceAlpha"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                        result="hardAlpha"
                                    />
                                    <feOffset dx=".294" dy=".588" />
                                    <feGaussianBlur stdDeviation=".441" />
                                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                                    <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0" />
                                    <feBlend in2="shape" result="effect7_innerShadow_412_5205" />
                                </filter>
                            </defs>
                        </svg>

                        <nav>
                            <ul>
                                {nav.map(({ title, url }) => {
                                    return (
                                        <li
                                            key={url}
                                            className={`mb-4 font-semibold relative ${
                                                router.pathname === url ? 'active-setup-tab opacity-100' : 'opacity-50'
                                            } `}
                                        >
                                            {title}
                                        </li>
                                    )
                                })}
                            </ul>
                        </nav>
                    </div>
                </aside>
                <section className="col-span-2 flex justify-start pt-12 pl-20">
                    <div className=" max-w-2xl">
                        <h1 className="mb-2">{title}</h1>
                        <h2 className="opacity-70 mb-6">{subtitle}</h2>
                        <div className="mt-12">{children}</div>
                    </div>
                </section>
            </main>
        </>
    )
}

export default SetupLayout
