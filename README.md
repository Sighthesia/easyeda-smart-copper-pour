[简体中文](#) | [English](./README.en.md) | [繁體中文](./README.zh-Hant.md) | [日本語](./README.ja.md) | [Русский](./README.ru.md)

# pro-api-sdk

嘉立创EDA & EasyEDA 专业版扩展 API 开发工具

<a href="https://github.com/easyeda/pro-api-sdk" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/stars/easyeda/pro-api-sdk" alt="GitHub Repo Stars" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://github.com/easyeda/pro-api-sdk/issues" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/issues/easyeda/pro-api-sdk" alt="GitHub Issues" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://github.com/easyeda/pro-api-sdk" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/repo-size/easyeda/pro-api-sdk" alt="GitHub Repo Size" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://choosealicense.com/licenses/apache-2.0/" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/license/easyeda/pro-api-sdk" alt="GitHub License" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://www.npmjs.com/package/@jlceda/pro-api-types" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/npm/v/%40jlceda%2Fpro-api-types?label=pro-api-types" alt="NPM Version" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://www.npmjs.com/package/@jlceda/pro-api-types" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/npm/d18m/%40jlceda%2Fpro-api-types" alt="NPM Downloads" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>

> [!NOTE]
>
> 详细开发文档请访问：[https://prodocs.lceda.cn/cn/api/guide/](https://prodocs.lceda.cn/cn/api/guide/)

## 进入开发

本开发工具组包含了用于开发 [嘉立创EDA专业版](https://pro.lceda.cn/) 扩展包的所有环境和工具，并内置了 Prettier 和 ESLint 的推荐规则。

1. 克隆 [pro-api-sdk](https://github.com/easyeda/pro-api-sdk) 项目仓库到本地

    Gitee:

    ```shell
    git clone --depth=1 https://gitee.com/jlceda/pro-api-sdk.git
    ```

    GitHub:

    ```shell
    git clone --depth=1 https://github.com/easyeda/pro-api-sdk.git
    ```

2. 初始化开发环境（安装依赖）

    ```shell
    npm install
    ```

3. 进行些许变更 ...

4. 编译扩展包

    ```shell
    npm run build
    ```

5. 在 嘉立创EDA专业版 中安装生成在 `./build/dist/` 下的扩展包

## Smart Copper Pour 工作流

当前扩展增加了 `Smart Copper Pour` 头部菜单与 iframe 控制面板，用于快速生成电源铜皮骨架与预览。

1. 在 PCB 编辑器中选择同一网络、同一层的多个 Pad。
2. 打开 `Smart Copper Pour`。
3. 在面板中选择拓扑模式：`Tree`、`Star` 或 `Daisy Chain`。
4. 根据需要设置 `Width`、`Keepout margin`、`Corner style` 与 `Trunk bias`。
5. 若使用 `Daisy Chain`，额外填写主干的起点与终点坐标。
6. 点击 `Preview` 生成临时预览，再点击 `Apply` 写入正式结果，或点击 `Clear` 清除预览。

### 当前能力

- 选中 Pad 解析与同网/同层校验
- Tree / Star / Daisy Chain 三种骨架规划
- 树形主干偏置：`Neutral`、`Horizontal`、`Vertical`
- 预览 / 落地写入链路与失败回滚
- 间距感知扩宽优化的控制器接入

### 当前限制

- 真实 LCEDA `Region` / `Pour` 预览 / 落地写入已接入，但相关 API 仍受 BETA 版本行为影响
- Auto expand 已接入优化链路，但真实运行时骨架输入仍需后续接线
- Daisy Chain 的主干约束当前使用起点 / 终点线段近似，不包含更复杂的边界约束

## 开源许可

<a href="https://choosealicense.com/licenses/apache-2.0/" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/license/easyeda/pro-api-sdk" alt="GitHub License" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>

本开发工具组使用 [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/) 开源许可协议，你仅可以将 **嘉立创EDA**、**EasyEDA** 商标信息用于依托于本工具组开发的扩展包的 **功能描述部分** 和 **开源发布的标题部分**。
