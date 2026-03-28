# ISCH_PrimitiveCircle class

圆图元

## 签名

```typescript
declare class ISCH_PrimitiveCircle implements ISCH_Primitive
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

[done()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

**_(BETA)_** 将对图元的更改应用到画布

</td></tr>
<tr><td>

[getState_CenterX()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

获取属性状态：圆心 X

</td></tr>
<tr><td>

[getState_CenterY()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

获取属性状态：圆心 Y

</td></tr>
<tr><td>

[getState_Color()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

获取属性状态：颜色

</td></tr>
<tr><td>

[getState_FillColor()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

获取属性状态：填充颜色

</td></tr>
<tr><td>

[getState_FillStyle()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

获取属性状态：填充样式

</td></tr>
<tr><td>

[getState_LineType()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

获取属性状态：线型

</td></tr>
<tr><td>

[getState_LineWidth()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

获取属性状态：线宽

</td></tr>
<tr><td>

[getState_PrimitiveId()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

获取属性状态：图元 ID

</td></tr>
<tr><td>

[getState_PrimitiveType()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

获取属性状态：图元类型

</td></tr>
<tr><td>

[getState_Radius()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

获取属性状态：半径

</td></tr>
<tr><td>

[isAsync()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

查询图元是否为异步图元

</td></tr>
<tr><td>

[reset()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

**_(BETA)_** 将异步图元重置为当前画布状态

</td></tr>
<tr><td>

[setState_CenterX(centerX)](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：圆心 X

</td></tr>
<tr><td>

[setState_CenterY(centerY)](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：圆心 Y

</td></tr>
<tr><td>

[setState_Color(color)](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：颜色

</td></tr>
<tr><td>

[setState_FillColor(fillColor)](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：填充颜色

</td></tr>
<tr><td>

[setState_FillStyle(fillStyle)](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：填充样式

</td></tr>
<tr><td>

[setState_LineType(lineType)](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：线型

</td></tr>
<tr><td>

[setState_LineWidth(lineWidth)](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：线宽

</td></tr>
<tr><td>

[setState_Radius(radius)](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：半径

</td></tr>
<tr><td>

[toAsync()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

将图元转换为异步图元

</td></tr>
<tr><td>

[toSync()](./ISCH_PrimitiveCircle.md)

</td><td>

</td><td>

将图元转换为同步图元

</td></tr>
</tbody></table>

---

## 方法详情

### done

# ISCH_PrimitiveCircle.done() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将对图元的更改应用到画布

## 签名

```typescript
done(): ISCH_PrimitiveCircle;
```

## 返回值

[ISCH_PrimitiveCircle](./ISCH_PrimitiveCircle.md)

圆图元对象

### getstate_centerx

# ISCH_PrimitiveCircle.getState_CenterX() method

获取属性状态：圆心 X

## 签名

```typescript
getState_CenterX(): number;
```

## 返回值

number

圆心 X

### getstate_centery

# ISCH_PrimitiveCircle.getState_CenterY() method

获取属性状态：圆心 Y

## 签名

```typescript
getState_CenterY(): number;
```

## 返回值

number

圆心 Y

### getstate_color

# ISCH_PrimitiveCircle.getState_Color() method

获取属性状态：颜色

## 签名

```typescript
getState_Color(): string | null;
```

## 返回值

string \| null

颜色

### getstate_fillcolor

# ISCH_PrimitiveCircle.getState_FillColor() method

获取属性状态：填充颜色

## 签名

```typescript
getState_FillColor(): string | null;
```

## 返回值

string \| null

填充颜色

### getstate_fillstyle

# ISCH_PrimitiveCircle.getState_FillStyle() method

获取属性状态：填充样式

## 签名

```typescript
getState_FillStyle(): ESCH_PrimitiveFillStyle | null;
```

## 返回值

[ESCH_PrimitiveFillStyle](../enums/ESCH_PrimitiveFillStyle.md) \| null

填充样式

### getstate_linetype

# ISCH_PrimitiveCircle.getState_LineType() method

获取属性状态：线型

## 签名

```typescript
getState_LineType(): ESCH_PrimitiveLineType | null;
```

## 返回值

[ESCH_PrimitiveLineType](../enums/ESCH_PrimitiveLineType.md) \| null

线型

### getstate_linewidth

# ISCH_PrimitiveCircle.getState_LineWidth() method

获取属性状态：线宽

## 签名

```typescript
getState_LineWidth(): number | null;
```

## 返回值

number \| null

线宽

### getstate_primitiveid

# ISCH_PrimitiveCircle.getState_PrimitiveId() method

获取属性状态：图元 ID

## 签名

```typescript
getState_PrimitiveId(): string;
```

## 返回值

string

图元 ID

### getstate_primitivetype

# ISCH_PrimitiveCircle.getState_PrimitiveType() method

获取属性状态：图元类型

## 签名

```typescript
getState_PrimitiveType(): ESCH_PrimitiveType;
```

## 返回值

[ESCH_PrimitiveType](../enums/ESCH_PrimitiveType.md)

图元类型

### getstate_radius

# ISCH_PrimitiveCircle.getState_Radius() method

获取属性状态：半径

## 签名

```typescript
getState_Radius(): number;
```

## 返回值

number

半径

### isasync

# ISCH_PrimitiveCircle.isAsync() method

查询图元是否为异步图元

## 签名

```typescript
isAsync(): boolean;
```

## 返回值

boolean

是否为异步图元

### reset

# ISCH_PrimitiveCircle.reset() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将异步图元重置为当前画布状态

## 签名

```typescript
reset(): Promise<ISCH_PrimitiveCircle>;
```

## 返回值

Promise&lt;[ISCH_PrimitiveCircle](./ISCH_PrimitiveCircle.md)<!-- -->&gt;

圆图元对象

### setstate_centerx

# ISCH_PrimitiveCircle.setState_CenterX() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：圆心 X

## 签名

```typescript
setState_CenterX(centerX: number): ISCH_PrimitiveCircle;
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

centerX

</td><td>

number

</td><td>

圆心 X

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveCircle](./ISCH_PrimitiveCircle.md)

圆图元对象

### setstate_centery

# ISCH_PrimitiveCircle.setState_CenterY() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：圆心 Y

## 签名

```typescript
setState_CenterY(centerY: number): ISCH_PrimitiveCircle;
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

centerY

</td><td>

number

</td><td>

圆心 Y

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveCircle](./ISCH_PrimitiveCircle.md)

圆图元对象

### setstate_color

# ISCH_PrimitiveCircle.setState_Color() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：颜色

## 签名

```typescript
setState_Color(color: string | null): ISCH_PrimitiveCircle;
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

颜色

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveCircle](./ISCH_PrimitiveCircle.md)

圆图元对象

### setstate_fillcolor

# ISCH_PrimitiveCircle.setState_FillColor() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：填充颜色

## 签名

```typescript
setState_FillColor(fillColor: string | null): ISCH_PrimitiveCircle;
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

[ISCH_PrimitiveCircle](./ISCH_PrimitiveCircle.md)

圆图元对象

### setstate_fillstyle

# ISCH_PrimitiveCircle.setState_FillStyle() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：填充样式

## 签名

```typescript
setState_FillStyle(fillStyle: ESCH_PrimitiveFillStyle | null): ISCH_PrimitiveCircle;
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

[ISCH_PrimitiveCircle](./ISCH_PrimitiveCircle.md)

圆图元对象

### setstate_linetype

# ISCH_PrimitiveCircle.setState_LineType() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：线型

## 签名

```typescript
setState_LineType(lineType: ESCH_PrimitiveLineType | null): ISCH_PrimitiveCircle;
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

[ISCH_PrimitiveCircle](./ISCH_PrimitiveCircle.md)

圆图元对象

### setstate_linewidth

# ISCH_PrimitiveCircle.setState_LineWidth() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：线宽

## 签名

```typescript
setState_LineWidth(lineWidth: number | null): ISCH_PrimitiveCircle;
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

[ISCH_PrimitiveCircle](./ISCH_PrimitiveCircle.md)

圆图元对象

### setstate_radius

# ISCH_PrimitiveCircle.setState_Radius() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：半径

## 签名

```typescript
setState_Radius(radius: number): ISCH_PrimitiveCircle;
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

radius

</td><td>

number

</td><td>

半径

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveCircle](./ISCH_PrimitiveCircle.md)

圆图元对象

### toasync

# ISCH_PrimitiveCircle.toAsync() method

将图元转换为异步图元

## 签名

```typescript
toAsync(): ISCH_PrimitiveCircle;
```

## 返回值

[ISCH_PrimitiveCircle](./ISCH_PrimitiveCircle.md)

圆图元对象

### tosync

# ISCH_PrimitiveCircle.toSync() method

将图元转换为同步图元

## 签名

```typescript
toSync(): ISCH_PrimitiveCircle;
```

## 返回值

[ISCH_PrimitiveCircle](./ISCH_PrimitiveCircle.md)

圆图元对象
