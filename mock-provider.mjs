import fs from 'fs';
import path from 'path';

// 这是一个将 src/mock 中的 .ts 数据转换为 JSON 并提供给 local-server.js 的脚本
// 或者是 local-server.js 直接可以引用的逻辑

export const getMockData = (endpoint) => {
    // 简化逻辑：直接读取我们生成的 dashboard-payload.sample.json
    if (endpoint === '/dashboard' || endpoint === '/agent/dashboard') {
        const data = fs.readFileSync('./src/mock/dashboard-payload.sample.json', 'utf-8');
        return JSON.parse(data);
    }
    
    // 其他 endpoint 可以根据需要扩展读取 src/mock/*.ts
    // 但因为 .ts 需要编译，最快的方法是如果存在对应的 .json 则读取
    return null;
};
