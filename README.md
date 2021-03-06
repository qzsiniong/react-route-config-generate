## react-route-config-generate.js

一个根据目录结构自动生成react路由的工具

### 安装

```bash
npm install react-route-config-generate --save
# OR
yarn add react-route-config-generate
```

### 使用

```
// package.json
{
    "scripts": {
		"rrcg": "rrcg",
		"rrcg:watch": "rrcg -w"
	}
}
```

```json
// root/rrcg.json
{
    "pagesDir": "./pages/",// 页面代码所在的目录
    "routesConfigPath": "./routes.json"// 生成路由配置存放的json文件路径
}
```

#### 示例：
目录结构：

```
├── pages
│   └── demo
│       ├── -name
│       │   └── @detail.tsx
│       ├── -name-id
│       │   └── @index.tsx
│       ├── @-age.tsx
│       ├── @-hello-world_name.tsx
│       ├── @index.tsx
│       ├── @user.tsx
```


生成的路由配置json：
> 1. 页面文件必须以`@`开头，以`.tsx`结尾
> 2. 路径中，`_param` 表示可选参数，`-param`表示非可选参数
```json
[
  {
    "path": "/demo",
    "component": "/demo/@index"
  },
  {
    "path": "/demo/user",
    "component": "/demo/@user"
  },
  {
    "path": "/demo/:age",
    "component": "/demo/@-age"
  },
  {
    "path": "/demo/:name/detail",
    "component": "/demo/-name/@detail"
  },
  {
    "path": "/demo/:name/:id",
    "component": "/demo/-name-id/@index"
  },
  {
    "path": "/demo/:hello/:world/:name?",
    "component": "/demo/@-hello-world_name"
  }
]
```


