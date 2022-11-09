import React, { useEffect, useState } from 'react'

const Skeleton = () => {
    return (
        <div className="squeak relative rounded-lg pl-10 pr-8 py-4 -ml-4 mb-2">
            <div className="squeak-question-container">
                <div className="squeak-post">
                    <div className="squeak-post-author">
                        <div className="squeak-avatar-container">
                            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
                                <path d="M0 0h40v40H0z"></path>
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M21.19 6.57c-5.384-.696-9.938 3.89-9.93 10.343.013.1.026.229.042.378.045.443.11 1.067.262 1.67.883 3.445 2.781 6.077 6.305 7.132 3.117.938 5.86.04 8.14-2.242 3.008-3.016 3.805-8.039 1.891-12.047-1.36-2.844-3.484-4.82-6.71-5.234ZM2.5 40c-.64-1.852 1.119-6.454 2.947-7.61 2.48-1.563 5.076-2.942 7.671-4.32.48-.255.96-.51 1.438-.766.313-.164.899.008 1.29.188 2.827 1.242 5.624 1.25 8.468.03.492-.21 1.242-.241 1.695-.015 2.688 1.367 5.352 2.774 7.961 4.281 2.352 1.36 4.35 6.056 3.53 8.212h-35Z"
                                    fill="#fff"
                                ></path>
                            </svg>
                        </div>
                        <strong className="squeak-author-name animate-pulse w-32 h-10 inline-block bg-gray-light bg-opacity-20 rounded"></strong>
                        <span className="squeak-post-timestamp animate-pulse w-12 h-10 inline-block bg-gray-light bg-opacity-20 rounded"></span>
                    </div>
                    <div className="squeak-post-content pb-2 mt-2">
                        <div className="animate-pulse">
                            <input className="!rounded-bl-none !rounded-br-none w-24 !bg-gray-light !bg-opacity-20 !border-0" />
                        </div>
                        <div className="squeak-post-markdown mb-2 animate-pulse">
                            <div className="!w-full h-12 overflow-hidden text-ellipsis !bg-gray-light !bg-opacity-20 cursor-not-allowed px-3 py-4 max-w-full rounded-bl rounded-br !border-t-1 border-solid border-color-[#fff]"></div>
                        </div>

                        <div className="animate-pulse">
                            <input className="w-24 !bg-gray-light !bg-opacity-20 !border-0" />
                        </div>
                        <p className="text-sm text-gray-500 animate-pulse w-12"></p>
                    </div>
                </div>
                <div className="squeak-reply-form-container">
                    <div className="squeak-reply-buttons">
                        <div className="squeak-avatar-container">
                            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
                                <path d="M0 0h40v40H0z"></path>
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M21.19 6.57c-5.384-.696-9.938 3.89-9.93 10.343.013.1.026.229.042.378.045.443.11 1.067.262 1.67.883 3.445 2.781 6.077 6.305 7.132 3.117.938 5.86.04 8.14-2.242 3.008-3.016 3.805-8.039 1.891-12.047-1.36-2.844-3.484-4.82-6.71-5.234ZM2.5 40c-.64-1.852 1.119-6.454 2.947-7.61 2.48-1.563 5.076-2.942 7.671-4.32.48-.255.96-.51 1.438-.766.313-.164.899.008 1.29.188 2.827 1.242 5.624 1.25 8.468.03.492-.21 1.242-.241 1.695-.015 2.688 1.367 5.352 2.774 7.961 4.281 2.352 1.36 4.35 6.056 3.53 8.212h-35Z"
                                    fill="#fff"
                                ></path>
                            </svg>
                        </div>
                        <div className="animate-pulse w-24 h-8 bg-gray-light bg-opacity-20 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SlackTableSkeleton() {
    const [skeletonsToShow, setSkeletonsToShow] = useState(1)
    useEffect(() => {
        const interval = setInterval(() => {
            setSkeletonsToShow((prevState) => prevState + 1)
        }, 2000)
        return () => clearInterval(interval)
    }, [])
    return (
        <>
            {[...Array(skeletonsToShow)].map((value, index) => (
                <Skeleton key={`skeleton-${index}`} />
            ))}
        </>
    )
}
