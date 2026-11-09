'use client';
import { createRoot } from 'react-dom/client';
import Toast from './toast';
import type { ToastProps } from './toast';

export const toast = ({ msg, type, duration = 5000, afterClose }: Omit<ToastProps, 'visible'>) => {
    if (typeof document === 'undefined') return;
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    let closed = false;
    const close = () => {
        if (closed) return;
        closed = true;
        // 在组件 effect 完成后卸载，复用创建时的 root。
        window.setTimeout(() => { root.unmount(); container.remove(); afterClose?.(); }, 0);
    };
    root.render(<Toast visible type={type} msg={msg} duration={duration} afterClose={close} />);
};
