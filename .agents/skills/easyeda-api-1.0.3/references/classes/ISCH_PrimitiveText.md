# ISCH_PrimitiveText class

文本图元

## 签名

```typescript
declare class ISCH_PrimitiveText implements ISCH_Primitive
```

**实现自：**[ISCH_Primitive](../interfaces/ISCH_Primitive.md)

## 备注

## 方法

<table><thead><tr><th>

方法名

</th><th>

修饰符

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

[done()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

**_(BETA)_** 将对图元的更改应用到画布

</td></tr>
<tr><td>

[getState_AlignMode()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

获取属性状态：对齐模式

</td></tr>
<tr><td>

[getState_Bold()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

获取属性状态：是否加粗

</td></tr>
<tr><td>

[getState_Content()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

获取属性状态：文本内容

</td></tr>
<tr><td>

[getState_FontName()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

获取属性状态：字体名称

</td></tr>
<tr><td>

[getState_FontSize()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

获取属性状态：字体大小

</td></tr>
<tr><td>

[getState_Italic()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

获取属性状态：是否斜体

</td></tr>
<tr><td>

[getState_PrimitiveId()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

获取属性状态：图元 ID

</td></tr>
<tr><td>

[getState_PrimitiveType()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

获取属性状态：图元类型

</td></tr>
<tr><td>

[getState_Rotation()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

获取属性状态：旋转角度

</td></tr>
<tr><td>

[getState_TextColor()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

获取属性状态：文本颜色

</td></tr>
<tr><td>

[getState_UnderLine()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

获取属性状态：是否加下划线

</td></tr>
<tr><td>

[getState_X()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

获取属性状态：坐标 X

</td></tr>
<tr><td>

[getState_Y()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

获取属性状态：坐标 Y

</td></tr>
<tr><td>

[isAsync()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

查询图元是否为异步图元

</td></tr>
<tr><td>

[reset()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

**_(BETA)_** 将异步图元重置为当前画布状态

</td></tr>
<tr><td>

[setState_AlignMode(alignMode)](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：对齐模式

</td></tr>
<tr><td>

[setState_Bold(bold)](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：是否加粗

</td></tr>
<tr><td>

[setState_Content(content)](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：文本内容

</td></tr>
<tr><td>

[setState_FontName(fontName)](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：字体名称

</td></tr>
<tr><td>

[setState_FontSize(fontSize)](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：字体大小

</td></tr>
<tr><td>

[setState_Italic(italic)](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：是否斜体

</td></tr>
<tr><td>

[setState_Rotation(rotation)](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：旋转角度

</td></tr>
<tr><td>

[setState_TextColor(textColor)](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：文本颜色

</td></tr>
<tr><td>

[setState_UnderLine(underLine)](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：是否加下划线

</td></tr>
<tr><td>

[setState_X(x)](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：坐标 X

</td></tr>
<tr><td>

[setState_Y(y)](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：坐标 Y

</td></tr>
<tr><td>

[toAsync()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

将图元转换为异步图元

</td></tr>
<tr><td>

[toSync()](./ISCH_PrimitiveText.md)

</td><td>

</td><td>

将图元转换为同步图元

</td></tr>
</tbody></table>

---

## 方法详情

### done

# ISCH_PrimitiveText.done() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将对图元的更改应用到画布

## 签名

```typescript
done(): Promise<ISCH_PrimitiveText>;
```

## 返回值

Promise&lt;[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)<!-- -->&gt;

文本图元对象

### getstate_alignmode

# ISCH_PrimitiveText.getState_AlignMode() method

获取属性状态：对齐模式

## 签名

```typescript
getState_AlignMode(): ESCH_PrimitiveTextAlignMode;
```

## 返回值

[ESCH_PrimitiveTextAlignMode](../enums/ESCH_PrimitiveTextAlignMode.md)

对齐模式

### getstate_bold

# ISCH_PrimitiveText.getState_Bold() method

获取属性状态：是否加粗

## 签名

```typescript
getState_Bold(): boolean;
```

## 返回值

boolean

是否加粗

### getstate_content

# ISCH_PrimitiveText.getState_Content() method

获取属性状态：文本内容

## 签名

```typescript
getState_Content(): string;
```

## 返回值

string

文本内容

### getstate_fontname

# ISCH_PrimitiveText.getState_FontName() method

获取属性状态：字体名称

## 签名

```typescript
getState_FontName(): string | null;
```

## 返回值

string \| null

字体名称

### getstate_fontsize

# ISCH_PrimitiveText.getState_FontSize() method

获取属性状态：字体大小

## 签名

```typescript
getState_FontSize(): number | null;
```

## 返回值

number \| null

字体大小

### getstate_italic

# ISCH_PrimitiveText.getState_Italic() method

获取属性状态：是否斜体

## 签名

```typescript
getState_Italic(): boolean;
```

## 返回值

boolean

是否斜体

### getstate_primitiveid

# ISCH_PrimitiveText.getState_PrimitiveId() method

获取属性状态：图元 ID

## 签名

```typescript
getState_PrimitiveId(): string;
```

## 返回值

string

图元 ID

### getstate_primitivetype

# ISCH_PrimitiveText.getState_PrimitiveType() method

获取属性状态：图元类型

## 签名

```typescript
getState_PrimitiveType(): ESCH_PrimitiveType;
```

## 返回值

[ESCH_PrimitiveType](../enums/ESCH_PrimitiveType.md)

图元类型

### getstate_rotation

# ISCH_PrimitiveText.getState_Rotation() method

获取属性状态：旋转角度

## 签名

```typescript
getState_Rotation(): number;
```

## 返回值

number

旋转角度

### getstate_textcolor

# ISCH_PrimitiveText.getState_TextColor() method

获取属性状态：文本颜色

## 签名

```typescript
getState_TextColor(): string | null;
```

## 返回值

string \| null

文本颜色

### getstate_underline

# ISCH_PrimitiveText.getState_UnderLine() method

获取属性状态：是否加下划线

## 签名

```typescript
getState_UnderLine(): boolean;
```

## 返回值

boolean

是否加下划线

### getstate_x

# ISCH_PrimitiveText.getState_X() method

获取属性状态：坐标 X

## 签名

```typescript
getState_X(): number;
```

## 返回值

number

坐标 X

### getstate_y

# ISCH_PrimitiveText.getState_Y() method

获取属性状态：坐标 Y

## 签名

```typescript
getState_Y(): number;
```

## 返回值

number

坐标 Y

### isasync

# ISCH_PrimitiveText.isAsync() method

查询图元是否为异步图元

## 签名

```typescript
isAsync(): boolean;
```

## 返回值

boolean

是否为异步图元

### reset

# ISCH_PrimitiveText.reset() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将异步图元重置为当前画布状态

## 签名

```typescript
reset(): Promise<ISCH_PrimitiveText>;
```

## 返回值

Promise&lt;[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)<!-- -->&gt;

文本图元对象

### setstate_alignmode

# ISCH_PrimitiveText.setState_AlignMode() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：对齐模式

## 签名

```typescript
setState_AlignMode(alignMode: ESCH_PrimitiveTextAlignMode): ISCH_PrimitiveText;
```

## 参数名

<table><thead><tr><th>

参数

</th><th>

类型

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

alignMode

</td><td>

[ESCH_PrimitiveTextAlignMode](../enums/ESCH_PrimitiveTextAlignMode.md)

</td><td>

对齐模式

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)

文本图元对象

### setstate_bold

# ISCH_PrimitiveText.setState_Bold() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：是否加粗

## 签名

```typescript
setState_Bold(bold: boolean): ISCH_PrimitiveText;
```

## 参数名

<table><thead><tr><th>

参数

</th><th>

类型

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

bold

</td><td>

boolean

</td><td>

是否加粗

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)

文本图元对象

### setstate_content

# ISCH_PrimitiveText.setState_Content() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：文本内容

## 签名

```typescript
setState_Content(content: string): ISCH_PrimitiveText;
```

## 参数名

<table><thead><tr><th>

参数

</th><th>

类型

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

content

</td><td>

string

</td><td>

文本内容

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)

文本图元对象

### setstate_fontname

# ISCH_PrimitiveText.setState_FontName() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：字体名称

## 签名

```typescript
setState_FontName(fontName: string | null): ISCH_PrimitiveText;
```

## 参数名

<table><thead><tr><th>

参数

</th><th>

类型

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

fontName

</td><td>

string \| null

</td><td>

字体名称

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)

文本图元对象

### setstate_fontsize

# ISCH_PrimitiveText.setState_FontSize() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：字体大小

## 签名

```typescript
setState_FontSize(fontSize: number | null): ISCH_PrimitiveText;
```

## 参数名

<table><thead><tr><th>

参数

</th><th>

类型

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

fontSize

</td><td>

number \| null

</td><td>

字体大小

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)

文本图元对象

### setstate_italic

# ISCH_PrimitiveText.setState_Italic() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：是否斜体

## 签名

```typescript
setState_Italic(italic: boolean): ISCH_PrimitiveText;
```

## 参数名

<table><thead><tr><th>

参数

</th><th>

类型

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

italic

</td><td>

boolean

</td><td>

是否斜体

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)

文本图元对象

### setstate_rotation

# ISCH_PrimitiveText.setState_Rotation() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：旋转角度

## 签名

```typescript
setState_Rotation(rotation: number): ISCH_PrimitiveText;
```

## 参数名

<table><thead><tr><th>

参数

</th><th>

类型

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

rotation

</td><td>

number

</td><td>

旋转角度

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)

文本图元对象

### setstate_textcolor

# ISCH_PrimitiveText.setState_TextColor() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：文本颜色

## 签名

```typescript
setState_TextColor(textColor: string | null): ISCH_PrimitiveText;
```

## 参数名

<table><thead><tr><th>

参数

</th><th>

类型

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

textColor

</td><td>

string \| null

</td><td>

文本颜色

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)

文本图元对象

### setstate_underline

# ISCH_PrimitiveText.setState_UnderLine() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：是否加下划线

## 签名

```typescript
setState_UnderLine(underLine: boolean): ISCH_PrimitiveText;
```

## 参数名

<table><thead><tr><th>

参数

</th><th>

类型

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

underLine

</td><td>

boolean

</td><td>

是否加下划线

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)

文本图元对象

### setstate_x

# ISCH_PrimitiveText.setState_X() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：坐标 X

## 签名

```typescript
setState_X(x: number): ISCH_PrimitiveText;
```

## 参数名

<table><thead><tr><th>

参数

</th><th>

类型

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

x

</td><td>

number

</td><td>

坐标 X

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)

文本图元对象

### setstate_y

# ISCH_PrimitiveText.setState_Y() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：坐标 Y

## 签名

```typescript
setState_Y(y: number): ISCH_PrimitiveText;
```

## 参数名

<table><thead><tr><th>

参数

</th><th>

类型

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

y

</td><td>

number

</td><td>

坐标 Y

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)

文本图元对象

### toasync

# ISCH_PrimitiveText.toAsync() method

将图元转换为异步图元

## 签名

```typescript
toAsync(): ISCH_PrimitiveText;
```

## 返回值

[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)

文本图元对象

### tosync

# ISCH_PrimitiveText.toSync() method

将图元转换为同步图元

## 签名

```typescript
toSync(): ISCH_PrimitiveText;
```

## 返回值

[ISCH_PrimitiveText](./ISCH_PrimitiveText.md)

文本图元对象
