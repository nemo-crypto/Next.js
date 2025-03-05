## 项目启动

---
1、安装依赖

```bash
npm install
```

2、进入开发环境

```bash
npm run dev
```

3、构建测试包

```bash
npm run build:qa
```

4、在服务器上启动
```bash
yarn pm2:start
```

1. Next.js 的主要特点和优势是什么？
主要特点：
- 服务器端渲染 (SSR)
- 静态网站生成 (SSG)
- 文件系统路由
- API 路由
- 自动代码分割
- 内置 CSS 和 Sass 支持
- 热模块替换 (HMR)
- 图片优化
- 零配置
2. Next.js 中的渲染方式有哪些？
四种主要渲染方式：
1. SSR (服务器端渲染)
```
// pages/ssr.js
export async function getServerSideProps() {
    const res = await fetch('https://api.example.com/data');
    const data = await res.json();
    return { props: { data } };
}
```
2. SSG (静态网站生成)
```
// pages/ssg.js
export async function getStaticProps() {
    const res = await fetch('https://api.example.com/data');
    const data = await res.json();
    return { props: { data } };
}
```
3. ISR (增量静态再生成)
```
export async function getStaticProps() {
 return {
    props: { data },
    revalidate: 60 // 60秒后重新生成
 };
}
```
4. CSR (客户端渲染)
```
import { useEffect, useState } from 'react';
function CSRPage() {
const [data, setData] = useState(null);
useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
}, []);
}
```
3. Next.js 13/14 中的 App Router 和 Pages Router 有什么区别？
App Router (新):
- 基于文件系统的路由
- 使用 app 目录
- 支持服务器组件
- 支持流式渲染
- 支持并行路由
- 支持路由拦截
Pages Router (旧):
- 基于 pages 目录
- 仅支持客户端组件
- 更简单的路由系统
4. 如何在 Next.js 中实现数据获取？
// 1. 服务器组件中获取数据
async function Page() {
    const data = await fetch('https://api.example.com/data');
    const json = await data.json();
    return <div>{json.title}</div>;
}
// 2. 客户端组件中获取数据
'use client';
import { useEffect, useState } from 'react';
function ClientComponent() {
const [data, setData] = useState(null);
useEffect(() => {
    fetch('/api/data')
    .then(res => res.json())
    .then(setData);
    }, []);
}
5. Next.js 中的路由实现方式？
```
// 1. 链接导航
import Link from 'next/link';
function Navigation() {
    return <Link href="/about">关于我们</Link>;
}
// 2. 编程式导航
import { useRouter } from 'next/navigation';
function NavigateButton() {
    const router = useRouter();
    return <button onClick={() => router.push('/about')}>跳转</button>;
}
```
6. 如何在 Next.js 中优化性能？
主要优化方式：
 1.图片优化
```
import Image from 'next/image';
function OptimizedImage() {
  return (
    <Image
      src="/image.jpg"
      alt="优化的图片"
      width={500}
      height={300}
      priority={true}
    />
  );
}
```
2. 路由预加载
```
import Link from 'next/link';
<Link href="/about" prefetch={true}>
  预加载页面
</Link>
```
3.动态导入
```
import dynamic from 'next/dynamic';
const DynamicComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <p>加载中...</p>
});
```
6、Next.js 中的中间件如何使用？
```
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(request: NextRequest) {
  // 验证身份
  const token = request.cookies.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/protected/:path*'
};
```
7、Next.js 中如何处理环境变量？
1. 创建环境变量文件：
```
- .env.local（本地环境）
- .env.development（开发环境）
- .env.production（生产环境）
```
2. 使用环境变量：javascript
```
// 服务器端
console.log(process.env.DATABASE_URL);

// 客户端（需要 NEXT_PUBLIC_ 前缀）
console.log(process.env.NEXT_PUBLIC_API_URL)；
```
9. Next.js中的API路由如何实现？
```
import { NextResponse } from 'next/server';
export async function GET() {
    return NextResponse.json({ users: ['用户1', '用户2'] });
}
export async function POST(request: Request) {
const data = await request.json();
    return NextResponse.json({ message: '创建成功' });
}
```
10. Next.js中如何实现国际化？
```
// next.config.js
module.exports = {
    i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'zh',
    },
}
// 使用
import { useRouter } from 'next/router';
function LanguageSwitcher() {
const router = useRouter();
return (
    <select onChange={(e) => router.push(router.pathname, router.pathname, { locale: e.target.value })}>
    <option value="en">English</option>
    <option value="zh">中文</option>
    </select>
);
}
```

