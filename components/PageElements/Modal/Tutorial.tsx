import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./styles.module.css";

const SKILLS = [
  {
    name: "히히 로켓발싸!",
    image: "/images/rocket.png",
    GIF: "/images/rocket_gif.gif",
    VIDEO: "/videos/rocket_video.mp4",
    description: "9초 동안 상대방 퍼즐이 귀여운 강아지가 탄 로켓으로 변합니다. 상대방이 퍼즐을 맞추지 못하도록 우주 멀리 날려 보내세요.",
  },
  {
    name: "확 다 얼려부려ㅎ",
    image: "/images/iceIcon.png",
    GIF: "/images/ice_gif.gif",
    VIDEO: "/videos/ice_video.mp4",
    description: "15초 동안 상대방 퍼즐이 움직이지 못하도록 얼려버립니다. 잠깐! 얼어붙은 카드는 상대방이 열심히 클릭하여 녹일 수 있습니다.",
  },
  {
    name: "ㅋㅋ블랙홀이요~",
    image: "/images/magnet.png",
    GIF: "/images/magnet_gif.gif",
    VIDEO: "/videos/magnet_video.mp4",
    description: "응 블랙홀~ 7초 동안 상대방 마우스 포인터가 블랙홀로 변합니다. 상대방이 기껏 정성스레 맞춰놓은 퍼즐까지 모두 다 빨아드립니다..",
  },
  {
    name: "입술 쪽",
    image: "/images/lip.png",
    GIF: "/images/lip_gif.gif",
    VIDEO: "/videos/lip_video.mp4",
    description: "10초 동안 상대방 퍼즐이 나의 입술로 변합니다. 매혹적인 입술로 상대방을 당황시키세요! >3<",
  },
  {
    name: "아 취한다",
    image: "/images/twirl.png",
    // GIF: "/images/lip_gif.gif",
    VIDEO: "/videos/twirl_video.mp4",
    description: "10초 동안 상대방 퍼즐이 나의 회전하는 얼굴로 변합니다. 상대방이 더 어지러울 수 있도록 해보세요😵‍💫",
  },
];

export default function Tutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleClickSkill = (e: any) => {
    if (e) {
      setCurrentSkillIndex(e.currentTarget.getAttribute("data-value"));
    }
  };

  const currentSkill = SKILLS[currentSkillIndex];

  return (
    <>
      <button onClick={openModal} className={styles.mulum}>
        ?
      </button>
      <Modal size="xl" aria-labelledby="contained-modal-title-vcente" centered show={isOpen} onHide={closeModal}>
        <Modal.Header className="bg-black" closeButton>
          <Modal.Title>
            <h1 className="text-white">스킬</h1>

            <div className="flex container">
              {SKILLS.map((item, index) => (
                <motion.button
                  whileHover={{
                    scale: 1.2,
                    transition: { duration: 1 },
                    borderRadius: 10,
                    backgroundColor: "#FFF",
                  }}
                  key={`item_${index}`}
                >
                  <Image
                    className="{`flex justify-context mx-2 px-2 ${styles.readypan}`}"
                    src={item.image}
                    onClick={handleClickSkill}
                    data-value={index}
                    alt=""
                    width={80}
                    height={80}
                  ></Image>
                </motion.button>
              ))}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-black">
          <section className="bg-black dark:bg-gray-900">
            <div className="gap-16 items-center py-2 px-4 mx-auto max-w-screen-lg lg:grid lg:grid-cols-3 lg:py-16 lg:px-6">
              <div className="font-light text-gray-500 sm:text-lg dark:text-gray-400 col-span-1">
                <Image src={currentSkill.image} alt="" width={60} height={60} />
                <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-white ">{currentSkill.name}</h2>
                <p className="mb-4 text-2xl text-slate-400">{currentSkill.description}</p>
              </div>
              <div className="grid col-span-2">
                {/* <div style={{ position: "relative", width: "100%", height: "0", paddingBottom: "66.67%" }}> */}
                {/* <Image src={currentSkill.GIF} alt={currentSkill.name} fill style={{ objectFit: "fill" }} /> */}
                <div
                  style={{
                    position: "relative",
                    height: 0,
                    paddingBottom: "56.25%",
                  }}
                >
                  <video
                    src={currentSkill.VIDEO}
                    autoPlay
                    muted
                    loop
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "fill",
                    }}
                  />
                  {/* </div> */}
                </div>
              </div>
            </div>
          </section>
        </Modal.Body>
        <Modal.Footer className="bg-black">
          <Button variant="danger" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
