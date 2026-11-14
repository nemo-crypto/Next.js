import type { AnchorHTMLAttributes } from 'react';
import { safeNavigationUrl } from '../lib/safe-url';
// 外围应用整页导航；后台提供的 URL 不可执行脚本或获取 opener。
export default function ExternalLink({ href, target, rel, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    return <a {...props} href={safeNavigationUrl(href)} target={target}
        rel={target === '_blank' ? `${rel || ''} noopener noreferrer`.trim() : rel} />;
}
