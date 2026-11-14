// 用于后台链接和 window.open；不接受脚本、协议相对地址、凭据或反斜杠。
export function safeNavigationUrl(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const candidate = value.trim();
    if (!candidate || /[\u0000-\u0020\u007f\\]/.test(candidate)) return undefined;
    if (/^\/(?!\/)|^[#?]/.test(candidate)) return candidate;
    try {
        const url = new URL(candidate);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return undefined;
        return url.href;
    } catch { return undefined; }
}
