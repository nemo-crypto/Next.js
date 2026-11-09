'use client';
import NextImage from 'next/image';
import type { ImageProps } from 'next/image';
// 本地及已配置 CDN 使用 Next 优化；其他远端图片不进入任意域名代理。
export default function Image(props: ImageProps) {
    const remote = typeof props.src === 'string' && /^(https?:)?\/\//.test(props.src);
    const cdn = process.env.NEXT_PUBLIC_STATIC_URL?.replace(/\/$/, '');
    const trusted = remote && cdn && typeof props.src === 'string' && props.src.startsWith(`${cdn}/`);
    return <NextImage {...props} unoptimized={props.unoptimized ?? (remote && !trusted)} />;
}
