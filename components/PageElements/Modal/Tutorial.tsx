import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import { motion } from "framer-motion";

const SKILLS = [
  {
    name: "히히 로켓발싸!",
    image: "/images/rocket.png",
    description: "상대방 카드를 로켓으로 만들어 맞추지 못하도록 멀리 날려보내세요.",
    videoUrl: "https://www.youtube.com/embed/60RaggLgggE",
  },
  {
    name: "확 다 얼려부려ㅎ",
    image: "/images/iceIcon.png",
    description: "상대방의 모든 카드를 움직이지 못하도록 얼려버립니다. 잠깐! 얼음은 부술 수 있으니 열심히 클릭해보세요.",
    videoUrl: "https://www.youtube.com/embed/VkCRg_p9-_A",
  },
  {
    name: "ㅋㅋ자석이요~",
    image: "/images/magnet.png",
    description: "자석스~ 마우스포인터가 자석으로 변하여 상대방 모든 카드를 당깁니다..",
    videoUrl: "https://www.youtube.com/embed/8GERsPyC4_A",
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

  const handleClickSkill = (e: Event) => {
    if (e) {
      setCurrentSkillIndex(e.currentTarget.getAttribute("data-value"));
    }
  };

  const currentSkill = SKILLS[currentSkillIndex];

  return (
    <>
      <Button variant="warning" onClick={openModal} className=" bg-warning rounded-circle text-black">
        ?
      </Button>
      <Modal size="lg" aria-labelledby="contained-modal-title-vcente" centered show={isOpen} onHide={closeModal}>
        <Modal.Header closeButton className="bg-black">
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
            <div className="gap-16 items-center py-8 px-4 mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 lg:py-16 lg:px-6">
              <div className="font-light text-gray-500 sm:text-lg dark:text-gray-400">
                <Image src={currentSkill.image} alt="" width={60} height={60} />
                <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-white ">{currentSkill.name}</h2>
                <p className="mb-4 text-2xl text-slate-400">{currentSkill.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <iframe
                  title="Video"
                  width="300"
                  height="300"
                  src={`${currentSkill.videoUrl}?autoplay=1&mute=1`}
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                />
              </div>
            </div>
          </section>
        </Modal.Body>
      </Modal>
    </>
  );
}
