# ISCH_PrimitiveArc class

圆弧图元

## 签名

```typescript
declare class ISCH_PrimitiveArc implements ISCH_Primitive
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

[done()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

**_(BETA)_** 将对图元的更改应用到画布

</td></tr>
<tr><td>

[getState_Color()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

获取属性状态：颜色

</td></tr>
<tr><td>

[getState_EndX()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

获取属性状态：终止点 X

</td></tr>
<tr><td>

[getState_EndY()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

获取属性状态：终止点 Y

</td></tr>
<tr><td>

[getState_FillColor()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

获取属性状态：填充颜色

</td></tr>
<tr><td>

[getState_LineType()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

获取属性状态：线型

</td></tr>
<tr><td>

[getState_LineWidth()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

获取属性状态：线宽

</td></tr>
<tr><td>

[getState_PrimitiveId()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

获取属性状态：图元 ID

</td></tr>
<tr><td>

[getState_PrimitiveType()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

获取属性状态：图元类型

</td></tr>
<tr><td>

[getState_ReferenceX()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

获取属性状态：参考点 X

</td></tr>
<tr><td>

[getState_ReferenceY()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

获取属性状态：参考点 Y

</td></tr>
<tr><td>

[getState_StartX()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

获取属性状态：起始点 X

</td></tr>
<tr><td>

[getState_StartY()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

获取属性状态：起始点 Y

</td></tr>
<tr><td>

[isAsync()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

查询图元是否为异步图元

</td></tr>
<tr><td>

[reset()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

**_(BETA)_** 将异步图元重置为当前画布状态

</td></tr>
<tr><td>

[setState_Color(color)](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：颜色

</td></tr>
<tr><td>

[setState_EndX(endX)](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：终止点 X

</td></tr>
<tr><td>

[setState_EndY(endY)](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：终止点 Y

</td></tr>
<tr><td>

[setState_FillColor(fillColor)](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：填充颜色

</td></tr>
<tr><td>

[setState_LineType(lineType)](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：线型

</td></tr>
<tr><td>

[setState_LineWidth(lineWidth)](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：线宽

</td></tr>
<tr><td>

[setState_ReferenceX(referenceX)](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：参考点 X

</td></tr>
<tr><td>

[setState_ReferenceY(referenceY)](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：参考点 Y

</td></tr>
<tr><td>

[setState_StartX(startX)](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：起始点 X

</td></tr>
<tr><td>

[setState_StartY(startY)](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：起始点 Y

</td></tr>
<tr><td>

[toAsync()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

将图元转换为异步图元

</td></tr>
<tr><td>

[toSync()](./ISCH_PrimitiveArc.md)

</td><td>

</td><td>

将图元转换为同步图元

</td></tr>
</tbody></table>

---

## 方法详情

### done

# ISCH_PrimitiveArc.done() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将对图元的更改应用到画布

## 签名

```typescript
done(): Promise<ISCH_PrimitiveArc>;
```

## 返回值

Promise&lt;[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)<!-- -->&gt;

圆弧图元对象

### getstate_color

# ISCH_PrimitiveArc.getState_Color() method

获取属性状态：颜色

## 签名

```typescript
getState_Color(): string | null;
```

## 返回值

string \| null

颜色

### getstate_endx

# ISCH_PrimitiveArc.getState_EndX() method

获取属性状态：终止点 X

## 签名

```typescript
getState_EndX(): number;
```

## 返回值

number

终止点 X

### getstate_endy

# ISCH_PrimitiveArc.getState_EndY() method

获取属性状态：终止点 Y

## 签名

```typescript
getState_EndY(): number;
```

## 返回值

number

终止点 Y

### getstate_fillcolor

# ISCH_PrimitiveArc.getState_FillColor() method

获取属性状态：填充颜色

## 签名

```typescript
getState_FillColor(): string | null;
```

## 返回值

string \| null

填充颜色

### getstate_linetype

# ISCH_PrimitiveArc.getState_LineType() method

获取属性状态：线型

## 签名

```typescript
getState_LineType(): ESCH_PrimitiveLineType | null;
```

## 返回值

[ESCH_PrimitiveLineType](../enums/ESCH_PrimitiveLineType.md) \| null

线型

### getstate_linewidth

# ISCH_PrimitiveArc.getState_LineWidth() method

获取属性状态：线宽

## 签名

```typescript
getState_LineWidth(): number | null;
```

## 返回值

number \| null

线宽

### getstate_primitiveid

# ISCH_PrimitiveArc.getState_PrimitiveId() method

获取属性状态：图元 ID

## 签名

```typescript
getState_PrimitiveId(): string;
```

## 返回值

string

图元 ID

### getstate_primitivetype

# ISCH_PrimitiveArc.getState_PrimitiveType() method

获取属性状态：图元类型

## 签名

```typescript
getState_PrimitiveType(): ESCH_PrimitiveType;
```

## 返回值

[ESCH_PrimitiveType](../enums/ESCH_PrimitiveType.md)

图元类型

### getstate_referencex

# ISCH_PrimitiveArc.getState_ReferenceX() method

获取属性状态：参考点 X

## 签名

```typescript
getState_ReferenceX(): number;
```

## 返回值

number

参考点 X

### getstate_referencey

# ISCH_PrimitiveArc.getState_ReferenceY() method

获取属性状态：参考点 Y

## 签名

```typescript
getState_ReferenceY(): number;
```

## 返回值

number

参考点 Y

### getstate_startx

# ISCH_PrimitiveArc.getState_StartX() method

获取属性状态：起始点 X

## 签名

```typescript
getState_StartX(): number;
```

## 返回值

number

起始点 X

### getstate_starty

# ISCH_PrimitiveArc.getState_StartY() method

获取属性状态：起始点 Y

## 签名

```typescript
getState_StartY(): number;
```

## 返回值

number

起始点 Y

### isasync

# ISCH_PrimitiveArc.isAsync() method

查询图元是否为异步图元

## 签名

```typescript
isAsync(): boolean;
```

## 返回值

boolean

是否为异步图元

### reset

# ISCH_PrimitiveArc.reset() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将异步图元重置为当前画布状态

## 签名

```typescript
reset(): Promise<ISCH_PrimitiveArc>;
```

## 返回值

Promise&lt;[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)<!-- -->&gt;

圆弧图元对象

### setstate_color

# ISCH_PrimitiveArc.setState_Color() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：颜色

## 签名

```typescript
setState_Color(color: string | null): ISCH_PrimitiveArc;
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

[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)

圆弧图元对象

### setstate_endx

# ISCH_PrimitiveArc.setState_EndX() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：终止点 X

## 签名

```typescript
setState_EndX(endX: number): ISCH_PrimitiveArc;
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

endX

</td><td>

number

</td><td>

终止点 X

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)

圆弧图元对象

### setstate_endy

# ISCH_PrimitiveArc.setState_EndY() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：终止点 Y

## 签名

```typescript
setState_EndY(endY: number): ISCH_PrimitiveArc;
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

endY

</td><td>

number

</td><td>

终止点 Y

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)

圆弧图元对象

### setstate_fillcolor

# ISCH_PrimitiveArc.setState_FillColor() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：填充颜色

## 签名

```typescript
setState_FillColor(fillColor: string | null): ISCH_PrimitiveArc;
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

[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)

圆弧图元对象

### setstate_linetype

# ISCH_PrimitiveArc.setState_LineType() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：线型

## 签名

```typescript
setState_LineType(lineType: ESCH_PrimitiveLineType | null): ISCH_PrimitiveArc;
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

[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)

圆弧图元对象

### setstate_linewidth

# ISCH_PrimitiveArc.setState_LineWidth() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：线宽

## 签名

```typescript
setState_LineWidth(lineWidth: number | null): ISCH_PrimitiveArc;
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

[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)

圆弧图元对象

### setstate_referencex

# ISCH_PrimitiveArc.setState_ReferenceX() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：参考点 X

## 签名

```typescript
setState_ReferenceX(referenceX: number): ISCH_PrimitiveArc;
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

referenceX

</td><td>

number

</td><td>

参考点 X

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)

圆弧图元对象

### setstate_referencey

# ISCH_PrimitiveArc.setState_ReferenceY() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：参考点 Y

## 签名

```typescript
setState_ReferenceY(referenceY: number): ISCH_PrimitiveArc;
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

referenceY

</td><td>

number

</td><td>

参考点 Y

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)

圆弧图元对象

### setstate_startx

# ISCH_PrimitiveArc.setState_StartX() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：起始点 X

## 签名

```typescript
setState_StartX(startX: number): ISCH_PrimitiveArc;
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

startX

</td><td>

number

</td><td>

起始点 X

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)

圆弧图元对象

### setstate_starty

# ISCH_PrimitiveArc.setState_StartY() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：起始点 Y

## 签名

```typescript
setState_StartY(startY: number): ISCH_PrimitiveArc;
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

startY

</td><td>

number

</td><td>

起始点 Y

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)

圆弧图元对象

### toasync

# ISCH_PrimitiveArc.toAsync() method

将图元转换为异步图元

## 签名

```typescript
toAsync(): ISCH_PrimitiveArc;
```

## 返回值

[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)

圆弧图元对象

### tosync

# ISCH_PrimitiveArc.toSync() method

将图元转换为同步图元

## 签名

```typescript
toSync(): ISCH_PrimitiveArc;
```

## 返回值

[ISCH_PrimitiveArc](./ISCH_PrimitiveArc.md)

圆弧图元对象
