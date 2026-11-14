'use client';
import { useState } from 'react';
import Modal from '@components/modal';
import styles from './page.module.css';

export default function DemoInteractions() {
    const [saved, setSaved] = useState(false);
    const [open, setOpen] = useState(false);
    const [nested, setNested] = useState(false);
    return <section className={styles.interactions} aria-labelledby='interaction-heading'>
        <div><h2 id='interaction-heading'>A little JavaScript. A useful interaction.</h2>
            <p>Save this sample locally in the current page, or explore a keyboard-friendly dialog.</p></div>
        <div className={styles.actions}>
            <button type='button' aria-pressed={saved} onClick={() => setSaved(value => !value)}>{saved ? 'Saved' : 'Save sample'}</button>
            <button type='button' onClick={() => setOpen(true)}>Open dialog</button>
        </div>
        <p role='status' className={styles.srOnly}>{saved ? 'Sample saved for this page visit.' : 'Sample is not saved.'}</p>
        <Modal visible={open} title='Accessible dialog' close closeFn={() => setOpen(false)} hideFooter>
            <div className={styles.dialogBody}><p>Tab stays inside. Escape closes the dialog. Focus returns to the button that opened it.</p>
                <label htmlFor='demo-note'>Sample note</label><input id='demo-note' placeholder='Nothing is sent to a server' />
                <button type='button' onClick={() => setNested(true)}>Open nested dialog</button>
            </div>
        </Modal>
        <Modal visible={nested} title='Nested dialog' close closeFn={() => setNested(false)} hideFooter>
            <div className={styles.dialogBody}><p>Closing this dialog keeps the page locked until the first dialog also closes.</p></div>
        </Modal>
    </section>;
}
