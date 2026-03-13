# 木木

<div align="center">
    <img src="./doc/images/index-light.jpg">
    <p>一个极简的Blog模板，使用 <a href="https://astro.build/">Astro</a> 搭建</p>
    <small><ins>简体中文</ins></small>
</div>

## ✨ 特性

木木 取自小红书📕，每个新用户最初的昵称，象征着初始新生。博客的设计理念也来自于此，从简约出发，在复杂功能与简约设计之间达到一种平衡。

* **极简设计**：页面设计简约，黑白为主色调，蓝色进行点缀
* **深色模式**：支持手动切换或自动跟随系统
* **文章搜索功能**：使用 [pagefind](https://pagefind.app/) 实现本地化搜索功能
* **单语言内容**：默认使用简体中文内容与路由
* **移动端适配**：组件针对移动端进行优化，拥有和电脑浏览器一样的流畅体验
* **评论功能**：支持本地部署和 Cloudflare 部署，具体参考 [Backend](https://github.com/Motues/Momo-Backend)
* 其他基本功能：文章分类，目录，RSS订阅，文字统计，阅读时间

## 🚀 快速开始

1. 克隆本项目
    ```bash
    git clone https://github.com/Motues/Momo.git
    cd Momo
    ```
2. 运行 `pnpm install` 安装依赖（使用 `npm install -g pnpm` 安装 `pnpm`）
3. 运行 `pnpm dev` 启动开发服务器

## 🔧 配置

参考[配置指南](./doc/config_zh-cn.md)，详细信息可以访问 [木木](https://momo.motues.top/intro/config)，阅读对应文章获取详细信息。

## 📚 更新

参考[更新指南](./doc/release_zh-cn.md)，介绍如何更新项目，详细信息可以访问 [木木](https://momo.motues.top/intro/release)。

## ⚡ 指令

以下所有的指令可以在根目录下面执行

| 指令 | 作用 |
| --- | --- |
| `pnpm instal` | 安装依赖 |
| `pnpm dev` | 启动本地服务器，运行在 `http://localhost:4321` |
| `pnpm build` | 构建发布版本到 `./dist` 目录下 |
| `pnpm preview` | 预览构建后的发布版本 |
| `pnpm astro ...` | 运行 `astro` 命令，例如 `astro add` |
| `pnpm newpost <path>` | 创建新文章，例如 `pnpm newpost docs/test` |


## 📚 参考

* [Astro](https://astro.build/)
* [Fuwari](https://github.com/saicaca/fuwari)
* [Tyndall](https://github.com/moyuin-aka/tyndall-public)
