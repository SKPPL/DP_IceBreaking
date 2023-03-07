import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import styles from "./styles.module.css";

const SKILLS = [
  {
    name: "히히 로켓 발싸!",
    image: "/images/rocket.webp",
    GIF: "/images/rocket_gif.gif",
    VIDEO: "/videos/rocket_video.mp4",
    description: "9초 동안 상대방 퍼즐이 귀여운 강아지가 탄 로켓으로 변합니다. 상대방이 퍼즐을 맞추지 못하도록 우주 멀리 날려 보내세요.",
  },
  {
    name: "얼음~ 땡!",
    image: "/images/iceIcon.webp",
    GIF: "/images/ice_gif.gif",
    VIDEO: "/videos/ice_video.mp4",
    description: "10초 동안 상대방이 퍼즐을 움직이지 못하도록 얼려버립니다. 얼어붙은 카드는 상대방이 4번 클릭하여 녹일 수 있습니다.",
  },
  {
    name: "입술 쪽",
    image: "/images/lip.webp",
    GIF: "/images/lip_gif.gif",
    VIDEO: "/videos/lip_video.mp4",
    description: "10초 동안 상대방 퍼즐이 나의 입술로 변합니다. 매혹적인 입술로 상대방을 당황시키세요! >3<",
  },

  {
    name: "돌려돌려 돌림판",
    image: "/images/twirl.webp",
    VIDEO: "/videos/twirl_video.mp4",
    description: "10초 동안 상대방 퍼즐이 나의 회전하는 얼굴로 변합니다. 얼굴을 가까이 하여 상대방을 더욱 혼란스럽게 해보세요.😵‍💫 ",
  },
  {
    name: "ㅋㅋ블랙홀이요~",
    image: "/images/magnet.webp",
    GIF: "/images/magnet_gif.gif",
    VIDEO: "/videos/magnet_video.mp4",
    description: "7초 동안 상대방 마우스 포인터가 블랙홀로 변합니다. 상대방이 맞춰놓은 퍼즐까지 모두 끌려갑니다.",
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
      <button onClick={openModal} className={`${styles.mulum} text-4xl w-60`} >
        아이템 설명
      </button>
      <Modal className="fixed bottom-0 top-0 right-0" show={isOpen} onHide={closeModal} bsPrefix="fullscreen-mode">
        <Modal.Body className={`flex bg-black w-[100vw] h-[100vh]`}>
          <Button className="absolute z-50 right-0" variant="danger" onClick={closeModal}>
            X
          </Button>
          <div className="w-[10vw]">
            {SKILLS.map((item, index) => (
              <div className="">
                <motion.button
                  whileHover={{
                    scale: 1,
                    transition: { duration: 1 },
                    borderRadius: 10,
                    backgroundColor: "#FFF",
                  }}
                  key={`item_${index}`}
                >
                  <img
                    className={`inline-flex h-[20vh] border w-[10vw] px-2 ${styles.item}`}
                    src={item.image}
                    onClick={handleClickSkill}
                    data-value={index}
                    alt=""
                  />
                </motion.button>
              </div>
            ))}
          </div>
          <section className="bg-black dark:bg-gray-900">
            <div className="relative border h-[85vh] w-[91vw]">
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
            </div>
            <div className="font-light h-[15vh] w-[90vw] flex items-center text-gray-500 sm:text-lg dark:text-gray-400">
              <img className="w-[7vw] h-[13vh] mr-[2vw]" src={currentSkill.image} alt="" />
              <h2 className="w-[22vw] mr-[2vw] text-4xl tracking-tight font-extrabold text-white select-none">{currentSkill.name}</h2>
              <p className=" text-3xl text-slate-400 select-none">{currentSkill.description}</p>
            </div>
          </section>
        </Modal.Body>
        <Modal.Footer className="bg-black">
        </Modal.Footer>
      </Modal>
    </>
  );
}
