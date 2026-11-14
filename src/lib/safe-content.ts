import sanitizeHtml from 'sanitize-html';

// 后台内容和翻译插值均不视为可信 HTML，SSR 与浏览器使用相同规则。
export function sanitizeRichHtml(value: unknown): string {
    if (typeof value !== 'string') return '';
    return sanitizeHtml(value, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
        allowedAttributes: {
            '*': ['style'],
            a: ['href', 'title', 'target', 'rel'],
            img: ['src', 'alt', 'width', 'height', 'loading'],
            td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan', 'scope'],
        },
        allowedSchemes: ['http', 'https', 'mailto'],
        allowProtocolRelative: false,
        allowedStyles: {
            '*': {
                color: [/^(#[\da-f]{3,8}|[a-z]+|rgba?\([\d.,%\s]+\))$/i],
                'background-color': [/^(#[\da-f]{3,8}|[a-z]+|rgba?\([\d.,%\s]+\))$/i],
                'text-align': [/^(left|right|center|justify|start|end)$/],
                'font-weight': [/^(normal|bold|[1-9]00)$/],
                'font-size': [/^\d+(\.\d+)?(px|em|rem|%)$/],
            },
        },
        transformTags: {
            a: (tagName, attributes) => ({ tagName, attribs: {
                ...attributes,
                ...(attributes.target ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
            } }),
            img: (tagName, attributes) => ({ tagName, attribs: { ...attributes, loading: 'lazy' } }),
        },
    });
}
