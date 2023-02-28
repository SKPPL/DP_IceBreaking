import * as React from 'react'
import { Provider, useSelector, useDispatch } from 'react-redux'

import { Card } from './Card'
import { Dock } from './Dock'
import { DockCard } from './DockCard'
import { DockDivider } from './DockDivider'

import styles from './styles.module.scss'

const GRADIENTS = [
    '/images/rocket.png',
    '/images/iceIcon.png',
    '/images/lip.png',
    '/images/twirl.png',
    '/images/magnet.png',
]

export default function ItemBar() {
    return (
        <>
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