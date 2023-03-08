import Particles from "react-tsparticles";
import React, { useCallback, useEffect, useState } from "react";
import { loadFull } from "tsparticles";

export default function MyGameParticles({ mysegmentState }) {
    const myparticlesInit = useCallback(async engine => {
        console.log(engine);
        // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
        // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
        // starting from v2 you can add only the features you need reducing the bundle size
        await loadFull(engine);
    }, []);

    const myparticlesLoaded = useCallback(async container => {
        await console.log(container);
    }, []);

    // var particleCanvas = document.querySelector("#tsparticles > canvas");
    // useEffect(() => {
    //     setTimeout(() => {if (particleCanvas !== null){
    //         //@ts-ignore
    //         particleCanvas.style.pointerEvents = "none";
    //     }}, 100)
    // }, [particleCanvas])

    const [isItem, setIsItem] = useState(false);
    const [mypictureUrl, setMyPictureUrl] = useState("")

    useEffect(() => {
        if (mysegmentState === "rocket") {
            setMyPictureUrl("/images/doge.webp")
            setIsItem(true)
        }
        else if (mysegmentState === "ice") {
            setMyPictureUrl("/images/iceIcon.webp")
            setIsItem(true)
        }
        else if (mysegmentState === "lip") {
            setMyPictureUrl("/images/lip.webp")
            setIsItem(true)
        }
        else if (mysegmentState === "twirl") {
            setMyPictureUrl("/images/swirl.webp")
            setIsItem(true)
        }
        else if (mysegmentState === "magnet") {
            setMyPictureUrl("/images/stone.webp")
            setIsItem(true)
        }
        else {
            setMyPictureUrl("/images/swirl.webp")
            setIsItem(false)
        }
    }, [mysegmentState])


    return (
        <>
            {isItem &&
                <div className="flex absolute justify-center w-full z-0 pointer-events-none">
                    <div className="fiexd w-[640px] h-[480px] flex justify-center pointer-events-none">
                        <Particles
                            id='myparticles'
                            init={myparticlesInit}
                            loaded={myparticlesLoaded}
                            options={{
                                fullScreen: {
                                    enable: true,
                                    zIndex: 0,
                                },
                                particles: {
                                    number: {
                                        value: 25,
                                        limit: 35,
                                        density: {
                                            enable: true,
                                            value_area: 800
                                        }
                                    },
                                    color: {
                                        value: "#ffffff"
                                    },
                                    shape: {
                                        type: "image",
                                        stroke: {
                                            width: 0,
                                            color: "#000000"
                                        },
                                        polygon: {
                                            nb_sides: 3
                                        },
                                        image:
                                        {
                                            src: mypictureUrl,
                                            width: 100,
                                            height: 100
                                        },
                                
                                    },
                                    opacity: {
                                        value: 1,
                                        random: true,
                                        anim: {
                                            enable: true,
                                            speed: 2,
                                            opacity_min: 0.5,
                                            sync: false
                                        }
                                    },
                                    size: {
                                        value: 50,
                                        random: true,
                                        anim: {
                                            enable: true,
                                            speed: 10,
                                            size_min: 10,
                                            sync: false
                                        }
                                    },
                                    line_linked: {
                                        enable: false,
                                        distance: 100,
                                        color: "#ffffff",
                                        opacity: 1,
                                        width: 1
                                    },
                                    move: {
                                        enable: true,
                                        speed: 3,
                                        direction: "none",
                                        random: true,
                                        straight: false,
                                        out_mode: "out",
                                        bounce: false,
                                        attract: {
                                            enable: false,
                                            rotateX: 600,
                                            rotateY: 1200
                                        }
                                    }
                                },
                                interactivity: {
                                    detect_on: "canvas",
                                    events: {
                                        onHover: {
                                            enable: false,
                                            mode: "bubble",
                                            parallax: {
                                                enable: false,
                                                force: 60,
                                                smooth: 10
                                            }
                                        },
                                        onClick: {
                                            enable: false,
                                            mode: "push"
                                        },
                                        resize: true
                                    },
                                    modes: {
                                        grab: {
                                            distance: 400,
                                            lineLinked: {
                                                opacity: 1
                                            }
                                        },
                                        bubble: {
                                            distance: 400,
                                            size: 30,
                                            duration: 2,
                                            opacity: 0.6,
                                            speed: 3
                                        },
                                        repulse: {
                                            distance: 200
                                        },
                                        push: {
                                            particles_nb: 4
                                        },
                                        remove: {
                                            particles_nb: 2
                                        }
                                    }
                                },
                                backgroundMask: {
                                    enable: false,
                                    cover: {
                                        color: {
                                            value: {
                                                r: 0,
                                                g: 0,
                                                b: 0
                                            },
                                        },
                                        opacity: 0.9,
                                    }
                                },
                                retina_detect: false,
                                fps_limit: 60
                            }}

                        />
                    </div>
                </div>
            }
            </>
    );
}
