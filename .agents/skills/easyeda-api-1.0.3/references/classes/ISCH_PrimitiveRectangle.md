# ISCH_PrimitiveRectangle class

矩形图元

## 签名

```typescript
declare class ISCH_PrimitiveRectangle implements ISCH_Primitive
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

[done()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

**_(BETA)_** 将对图元的更改应用到画布

</td></tr>
<tr><td>

[getState_Color()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

获取属性状态：边框颜色

</td></tr>
<tr><td>

[getState_CornerRadius()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

获取属性状态：圆角半径

</td></tr>
<tr><td>

[getState_FillColor()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

获取属性状态：填充颜色

</td></tr>
<tr><td>

[getState_FillStyle()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

获取属性状态：填充样式

</td></tr>
<tr><td>

[getState_Height()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

获取属性状态：高

</td></tr>
<tr><td>

[getState_LineType()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

获取属性状态：线型

</td></tr>
<tr><td>

[getState_LineWidth()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

获取属性状态：线宽

</td></tr>
<tr><td>

[getState_PrimitiveId()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

获取属性状态：图元 ID

</td></tr>
<tr><td>

[getState_PrimitiveType()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

获取属性状态：图元类型

</td></tr>
<tr><td>

[getState_Rotation()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

获取属性状态：旋转角度

</td></tr>
<tr><td>

[getState_TopLeftX()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

获取属性状态：左上点 X

</td></tr>
<tr><td>

[getState_TopLeftY()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

获取属性状态：左上点 Y

</td></tr>
<tr><td>

[getState_Width()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

获取属性状态：宽

</td></tr>
<tr><td>

[isAsync()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

查询图元是否为异步图元

</td></tr>
<tr><td>

[reset()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

**_(BETA)_** 将异步图元重置为当前画布状态

</td></tr>
<tr><td>

[setState_Color(color)](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：边框颜色

</td></tr>
<tr><td>

[setState_CornerRadius(cornerRadius)](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：圆角半径

</td></tr>
<tr><td>

[setState_FillColor(fillColor)](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：填充颜色

</td></tr>
<tr><td>

[setState_FillStyle(fillStyle)](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：填充样式

</td></tr>
<tr><td>

[setState_Height(height)](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：高

</td></tr>
<tr><td>

[setState_LineType(lineType)](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：线型

</td></tr>
<tr><td>

[setState_LineWidth(lineWidth)](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：线宽

</td></tr>
<tr><td>

[setState_Rotation(rotation)](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：旋转角度

</td></tr>
<tr><td>

[setState_TopLeftX(topLeftX)](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：左上点 X

</td></tr>
<tr><td>

[setState_TopLeftY(topLeftY)](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：左上点 Y

</td></tr>
<tr><td>

[setState_Width(width)](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：宽

</td></tr>
<tr><td>

[toAsync()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

将图元转换为异步图元

</td></tr>
<tr><td>

[toSync()](./ISCH_PrimitiveRectangle.md)

</td><td>

</td><td>

将图元转换为同步图元

</td></tr>
</tbody></table>

---

## 方法详情

### done

# ISCH_PrimitiveRectangle.done() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将对图元的更改应用到画布

## 签名

```typescript
done(): ISCH_PrimitiveRectangle;
```

## 返回值

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象

### getstate_color

# ISCH_PrimitiveRectangle.getState_Color() method

获取属性状态：边框颜色

## 签名

```typescript
getState_Color(): string | null;
```

## 返回值

string \| null

边框颜色

### getstate_cornerradius

# ISCH_PrimitiveRectangle.getState_CornerRadius() method

获取属性状态：圆角半径

## 签名

```typescript
getState_CornerRadius(): number;
```

## 返回值

number

圆角半径

### getstate_fillcolor

# ISCH_PrimitiveRectangle.getState_FillColor() method

获取属性状态：填充颜色

## 签名

```typescript
getState_FillColor(): string | null;
```

## 返回值

string \| null

填充颜色

### getstate_fillstyle

# ISCH_PrimitiveRectangle.getState_FillStyle() method

获取属性状态：填充样式

## 签名

```typescript
getState_FillStyle(): ESCH_PrimitiveFillStyle | null;
```

## 返回值

[ESCH_PrimitiveFillStyle](../enums/ESCH_PrimitiveFillStyle.md) \| null

填充样式

### getstate_height

# ISCH_PrimitiveRectangle.getState_Height() method

获取属性状态：高

## 签名

```typescript
getState_Height(): number;
```

## 返回值

number

高

### getstate_linetype

# ISCH_PrimitiveRectangle.getState_LineType() method

获取属性状态：线型

## 签名

```typescript
getState_LineType(): ESCH_PrimitiveLineType | null;
```

## 返回值

[ESCH_PrimitiveLineType](../enums/ESCH_PrimitiveLineType.md) \| null

线型

### getstate_linewidth

# ISCH_PrimitiveRectangle.getState_LineWidth() method

获取属性状态：线宽

## 签名

```typescript
getState_LineWidth(): number | null;
```

## 返回值

number \| null

线宽

### getstate_primitiveid

# ISCH_PrimitiveRectangle.getState_PrimitiveId() method

获取属性状态：图元 ID

## 签名

```typescript
getState_PrimitiveId(): string;
```

## 返回值

string

图元 ID

### getstate_primitivetype

# ISCH_PrimitiveRectangle.getState_PrimitiveType() method

获取属性状态：图元类型

## 签名

```typescript
getState_PrimitiveType(): ESCH_PrimitiveType;
```

## 返回值

[ESCH_PrimitiveType](../enums/ESCH_PrimitiveType.md)

图元类型

### getstate_rotation

# ISCH_PrimitiveRectangle.getState_Rotation() method

获取属性状态：旋转角度

## 签名

```typescript
getState_Rotation(): number;
```

## 返回值

number

旋转角度

### getstate_topleftx

# ISCH_PrimitiveRectangle.getState_TopLeftX() method

获取属性状态：左上点 X

## 签名

```typescript
getState_TopLeftX(): number;
```

## 返回值

number

左上点 X

### getstate_toplefty

# ISCH_PrimitiveRectangle.getState_TopLeftY() method

获取属性状态：左上点 Y

## 签名

```typescript
getState_TopLeftY(): number;
```

## 返回值

number

左上点 Y

### getstate_width

# ISCH_PrimitiveRectangle.getState_Width() method

获取属性状态：宽

## 签名

```typescript
getState_Width(): number;
```

## 返回值

number

宽

### isasync

# ISCH_PrimitiveRectangle.isAsync() method

查询图元是否为异步图元

## 签名

```typescript
isAsync(): boolean;
```

## 返回值

boolean

是否为异步图元

### reset

# ISCH_PrimitiveRectangle.reset() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将异步图元重置为当前画布状态

## 签名

```typescript
reset(): Promise<ISCH_PrimitiveRectangle>;
```

## 返回值

Promise&lt;[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)<!-- -->&gt;

矩形图元对象

### setstate_color

# ISCH_PrimitiveRectangle.setState_Color() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：边框颜色

## 签名

```typescript
setState_Color(color: string | null): ISCH_PrimitiveRectangle;
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

color

</td><td>

string \| null

</td><td>

边框颜色

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象

### setstate_cornerradius

# ISCH_PrimitiveRectangle.setState_CornerRadius() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：圆角半径

## 签名

```typescript
setState_CornerRadius(cornerRadius: number): ISCH_PrimitiveRectangle;
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

cornerRadius

</td><td>

number

</td><td>

圆角半径

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象

### setstate_fillcolor

# ISCH_PrimitiveRectangle.setState_FillColor() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：填充颜色

## 签名

```typescript
setState_FillColor(fillColor: string | null): ISCH_PrimitiveRectangle;
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

fillColor

</td><td>

string \| null

</td><td>

填充颜色

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象

### setstate_fillstyle

# ISCH_PrimitiveRectangle.setState_FillStyle() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：填充样式

## 签名

```typescript
setState_FillStyle(fillStyle: ESCH_PrimitiveFillStyle | null): ISCH_PrimitiveRectangle;
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

fillStyle

</td><td>

[ESCH_PrimitiveFillStyle](../enums/ESCH_PrimitiveFillStyle.md) \| null

</td><td>

填充样式

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象

### setstate_height

# ISCH_PrimitiveRectangle.setState_Height() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：高

## 签名

```typescript
setState_Height(height: number): ISCH_PrimitiveRectangle;
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

height

</td><td>

number

</td><td>

高

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象

### setstate_linetype

# ISCH_PrimitiveRectangle.setState_LineType() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：线型

## 签名

```typescript
setState_LineType(lineType: ESCH_PrimitiveLineType | null): ISCH_PrimitiveRectangle;
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

lineType

</td><td>

[ESCH_PrimitiveLineType](../enums/ESCH_PrimitiveLineType.md) \| null

</td><td>

线型

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象

### setstate_linewidth

# ISCH_PrimitiveRectangle.setState_LineWidth() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：线宽

## 签名

```typescript
setState_LineWidth(lineWidth: number | null): ISCH_PrimitiveRectangle;
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

lineWidth

</td><td>

number \| null

</td><td>

线宽

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象

### setstate_rotation

# ISCH_PrimitiveRectangle.setState_Rotation() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：旋转角度

## 签名

```typescript
setState_Rotation(rotation: number): ISCH_PrimitiveRectangle;
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

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象

### setstate_topleftx

# ISCH_PrimitiveRectangle.setState_TopLeftX() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：左上点 X

## 签名

```typescript
setState_TopLeftX(topLeftX: number): ISCH_PrimitiveRectangle;
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

topLeftX

</td><td>

number

</td><td>

左上点 X

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象

### setstate_toplefty

# ISCH_PrimitiveRectangle.setState_TopLeftY() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：左上点 Y

## 签名

```typescript
setState_TopLeftY(topLeftY: number): ISCH_PrimitiveRectangle;
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

topLeftY

</td><td>

number

</td><td>

左上点 Y

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象

### setstate_width

# ISCH_PrimitiveRectangle.setState_Width() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：宽

## 签名

```typescript
setState_Width(width: number): ISCH_PrimitiveRectangle;
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

width

</td><td>

number

</td><td>

宽

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象

### toasync

# ISCH_PrimitiveRectangle.toAsync() method

将图元转换为异步图元

## 签名

```typescript
toAsync(): ISCH_PrimitiveRectangle;
```

## 返回值

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象

### tosync

# ISCH_PrimitiveRectangle.toSync() method

将图元转换为同步图元

## 签名

```typescript
toSync(): ISCH_PrimitiveRectangle;
```

## 返回值

[ISCH_PrimitiveRectangle](./ISCH_PrimitiveRectangle.md)

矩形图元对象
