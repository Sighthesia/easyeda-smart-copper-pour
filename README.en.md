[简体中文](./README.md) | [English](#) | [繁體中文](./README.zh-Hant.md) | [日本語](./README.ja.md) | [Русский](./README.ru.md)

# pro-api-sdk

JLCEDA & EasyEDA Pro Extension API Development Kit

<a href="https://github.com/easyeda/pro-api-sdk" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/stars/easyeda/pro-api-sdk" alt="GitHub Repo Stars" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://github.com/easyeda/pro-api-sdk/issues" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/issues/easyeda/pro-api-sdk" alt="GitHub Issues" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://github.com/easyeda/pro-api-sdk" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/repo-size/easyeda/pro-api-sdk" alt="GitHub Repo Size" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://choosealicense.com/licenses/apache-2.0/" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/license/easyeda/pro-api-sdk" alt="GitHub License" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://www.npmjs.com/package/@jlceda/pro-api-types" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/npm/v/%40jlceda%2Fpro-api-types?label=pro-api-types" alt="NPM Version" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://www.npmjs.com/package/@jlceda/pro-api-types" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/npm/d18m/%40jlceda%2Fpro-api-types" alt="NPM Downloads" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>

> [!NOTE]
>
> For more information on the development of EasyEDA Pro Extension, please visit：[https://prodocs.easyeda.com/en/api/guide/](https://prodocs.easyeda.com/en/api/guide/)

## Enter Development

This development tool set contains all the environments and tools for developing the [EasyEDA Pro Edition](https://pro.easyeda.com/) extension package, and has built-in recommended rules for Prettier and ESLint.

1. Clone the [pro-api-sdk](https://github.com/easyeda/pro-api-sdk) project repository to your local computer

    ```shell
    git clone --depth=1 https://github.com/easyeda/pro-api-sdk.git
    ```

2. Initializing the development environment (installing dependencies)

    ```shell
    npm install
    ```

3. Make your changes ...

4. Compile the extension package

    ```shell
    npm run build
    ```

5. Install the extension package generated under `./build/dist/` in EasyEDA Pro Edition

## Smart Copper Pour Workflow

The extension now adds a `Smart Copper Pour` header menu and iframe control panel for building and previewing power copper backbones.

1. Select multiple pads on the same net and layer in the PCB editor.
2. Open `Smart Copper Pour`.
3. Choose a topology mode: `Tree`, `Star`, or `Daisy Chain`.
4. Configure `Width`, `Keepout margin`, `Corner style`, and `Trunk bias` as needed.
5. When using `Daisy Chain`, also enter the trunk start and trunk end coordinates.
6. Click `Preview` for a temporary result, then `Apply` to write it, or `Clear` to remove the preview.

### Current Capabilities

- Selected-pad parsing with same-net / same-layer validation
- Tree / Star / Daisy Chain backbone planning
- Tree trunk bias options: `Neutral`, `Horizontal`, `Vertical`
- Preview / apply pipeline with rollback behavior
- Clearance-aware width optimization integrated at the controller layer

### Current Limitations

- Real LCEDA `Region` / `Pour` preview / apply integration is in place, but the underlying APIs remain BETA-sensitive
- Auto expand is wired into the optimization path, but the runtime backbone feed still needs follow-up integration
- Daisy Chain currently uses a start/end trunk approximation rather than a richer edge-constrained path model

## Open-source License

<a href="https://choosealicense.com/licenses/apache-2.0/" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/license/easyeda/pro-api-sdk" alt="GitHub License" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>

This development tool uses the [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/) open source license agreement. You can only use the **嘉立创EDA** and **EasyEDA** trademark information for the **function description part** and **open source release title part** of the extension package developed based on this tool.
