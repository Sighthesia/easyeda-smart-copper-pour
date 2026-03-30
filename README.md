# Smart Copper Pour

Smart Copper Pour 是一个用于 **嘉立创EDA / EasyEDA** 的 PCB 扩展，用来快速生成、预览和应用铜皮骨架，支持快速生成菊花链，星形拓扑。

<a href="https://choosealicense.com/licenses/apache-2.0/" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/license/easyeda/pro-api-sdk" alt="License" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>

## 功能

- 选择同一网络、同一层的多个 Pad 后生成铜皮骨架
- 菊花链，星形拓扑。
- 支持 `Width`、`Keepout margin`、`Corner style`、`Trunk bias` 配置
- 支持预览、应用和清除预览
- 支持失败回滚，避免写入异常结果

## 使用方式

1. 在 PCB 编辑器中选中同一网络、同一层的多个 Pad。
2. 打开 `智能铺铜` 菜单。
3. 选择拓扑模式并调整参数。
4. 点击 `Preview` 预览结果。
5. 确认无误后点击 `Apply` 写入。
6. 如需撤销预览，点击 `Clear`。

## 构建与安装

1. 安装依赖。

```shell
npm install
```

2. 编译并打包扩展。

```shell
npm run build
```

3. 在 `./build/dist/` 中找到生成的 `.eext` 文件，并在嘉立创EDA中安装。

## 开发

- 编译源码：`npm run compile`
- 运行测试：`npm test`
- 格式化与修复：`npm run fix`

## 项目信息

- 扩展名：`smart-copper-pour`
- 显示名称：`Smart Copper Pour`
- 版本：`1.1.1`
- 入口：`./dist/index`

## 限制

- `Region` / `Pour` 相关行为仍会受到 LCEDA BETA API 的影响
- `Daisy Chain` 的主干约束目前采用起点 / 终点线段近似

## 许可

本项目采用 [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/) 许可。
