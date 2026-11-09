import type { AnchorHTMLAttributes } from 'react';
// 同域的交易/登录等外围应用也必须整页导航，不能走当前 App Router 的 RSC 请求。
export default function ExternalLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
    return <a {...props} />;
}
