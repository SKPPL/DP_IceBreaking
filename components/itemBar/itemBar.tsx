import * as React from 'react'
import { Provider, useSelector, useDispatch } from 'react-redux'

import { Card } from './Card'
import { Dock } from './Dock'
import { DockCard } from './DockCard'
import { DockDivider } from './DockDivider'

import styles from './styles.module.scss'

const GRADIENTS = [
    '/images/rocket.png',
    '/images/lip.png',
    '/images/nose.png',
    'https://products.ls.graphics/mesh-gradients/images/09.-Light-Sky-Blue-p-130x130q80.jpeg',
    'https://products.ls.graphics/mesh-gradients/images/12.-Tumbleweed-p-130x130q80.jpeg',
    'https://products.ls.graphics/mesh-gradients/images/15.-Perfume_1-p-130x130q80.jpeg',
]

export default function ItemBar() {

    const itemList = useSelector((state: any) => { return state.item });

    return (
        <>
            <div>
                {[itemList.rocket, itemList.lip, itemList.nose, itemList.rotate, itemList.mirror, itemList.flash]}
            </div>
            <div className={styles.body}>


                <Dock>
                    {GRADIENTS.map((src, index) =>
                        src ? (
                            <DockCard key={src} item={index}>
                                <Card src={src} />
                            </DockCard>
                        ) : (
                            <DockDivider key={index} />
                        )
                    )}
                </Dock>
            </div>
        </>
    )
}
