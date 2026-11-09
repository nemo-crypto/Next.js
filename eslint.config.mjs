import next from 'eslint-config-next/core-web-vitals';
export default [
    ...next,
    { ignores: ['.next/**', 'dist/**', 'node_modules/**', '.temp/**', 'next-env.d.ts'] },
    { rules: {
        // 业务视图逐步治理；新架构不通过强制改写旧交互来消除诊断。
        'react-hooks/set-state-in-effect': 'off',
        'react-hooks/refs': 'off',
        'react-hooks/purity': 'off',
        'react-hooks/immutability': 'off',
        'react-hooks/preserve-manual-memoization': 'off',
        'react-hooks/exhaustive-deps': 'warn',
        'react/no-unescaped-entities': 'warn',
        '@next/next/no-img-element': 'warn',
    } },
];
