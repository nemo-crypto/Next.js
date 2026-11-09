'use client';
import NextImage from 'next/image';
import type { ImageProps } from 'next/image';
// 本地/静态导入使用 Next 优化；未经配置的远端业务图片直接加载，避免放开任意域名代理。
export default function Image(props: ImageProps) {
    const remote = typeof props.src === 'string' && /^(https?:)?\/\//.test(props.src);
    return <NextImage {...props} unoptimized={props.unoptimized ?? remote} />;
}
