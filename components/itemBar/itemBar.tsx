import * as React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';

import { Card } from './Card';
import { Dock } from './Dock';
import { DockCard } from './DockCard';
import { DockDivider } from './DockDivider';

import styles from './styles.module.scss';

const GRADIENTS = [
    '/images/rocket.webp',
    '/images/iceIcon.webp',
    '/images/lip.webp',
    '/images/twirl.webp',
    '/images/magnet.webp',
];

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
    );
}