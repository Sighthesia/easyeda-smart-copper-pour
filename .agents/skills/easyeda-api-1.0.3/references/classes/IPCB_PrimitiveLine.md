# IPCB_PrimitiveLine class

直线图元

## 签名

```typescript
declare class IPCB_PrimitiveLine implements IPCB_Primitive
```

**实现自：**[IPCB_Primitive](../interfaces/IPCB_Primitive.md)

## 备注

直线和圆弧线均为导线，对应画布的线条走线和圆弧走线

## 方法

<table><thead><tr><th>

方法名

</th><th>

修饰符

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

[done()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

**_(BETA)_** 将对图元的更改应用到画布

</td></tr>
<tr><td>

[getAdjacentPrimitives()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

**_(BETA)_** 获取相邻的图元对象

</td></tr>
<tr><td>

[getEntireTrack(includeVias)](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

**_(BETA)_** 获取整段导线

</td></tr>
<tr><td>

[getEntireTrack(includeVias)](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

**_(BETA)_** 获取整段导线

</td></tr>
<tr><td>

[getState_EndX()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

获取属性状态：终止位置 X

</td></tr>
<tr><td>

[getState_EndY()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

获取属性状态：终止位置 Y

</td></tr>
<tr><td>

[getState_Layer()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

获取属性状态：层

</td></tr>
<tr><td>

[getState_LineWidth()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

获取属性状态：线宽

</td></tr>
<tr><td>

[getState_Net()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

获取属性状态：网络名称

</td></tr>
<tr><td>

[getState_PrimitiveId()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

获取属性状态：图元 ID

</td></tr>
<tr><td>

[getState_PrimitiveLock()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

获取属性状态：是否锁定

</td></tr>
<tr><td>

[getState_PrimitiveType()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

获取属性状态：图元类型

</td></tr>
<tr><td>

[getState_StartX()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

获取属性状态：起始位置 X

</td></tr>
<tr><td>

[getState_StartY()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

获取属性状态：起始位置 Y

</td></tr>
<tr><td>

[isAsync()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

查询图元是否为异步图元

</td></tr>
<tr><td>

[reset()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

**_(BETA)_** 将异步图元重置为当前画布状态

</td></tr>
<tr><td>

[setState_EndX(endX)](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：终止位置 X

</td></tr>
<tr><td>

[setState_EndY(endY)](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：终止位置 Y

</td></tr>
<tr><td>

[setState_Layer(layer)](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：层

</td></tr>
<tr><td>

[setState_LineWidth(lineWidth)](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：线宽

</td></tr>
<tr><td>

[setState_Net(net)](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：网络名称

</td></tr>
<tr><td>

[setState_PrimitiveLock(primitiveLock)](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：是否锁定

</td></tr>
<tr><td>

[setState_StartX(startX)](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：起始位置 X

</td></tr>
<tr><td>

[setState_StartY(startY)](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：起始位置 Y

</td></tr>
<tr><td>

[toAsync()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

将图元转换为异步图元

</td></tr>
<tr><td>

[toSync()](./IPCB_PrimitiveLine.md)

</td><td>

</td><td>

将图元转换为同步图元

</td></tr>
</tbody></table>

---

## 方法详情

### done

# IPCB_PrimitiveLine.done() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将对图元的更改应用到画布

## 签名

```typescript
done(): Promise<IPCB_PrimitiveLine>;
```

## 返回值

Promise&lt;[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md)<!-- -->&gt;

直线图元对象

### getadjacentprimitives

# IPCB_PrimitiveLine.getAdjacentPrimitives() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

获取相邻的图元对象

## 签名

```typescript
getAdjacentPrimitives(): Promise<Array<IPCB_PrimitiveLine | IPCB_PrimitiveVia | IPCB_PrimitiveArc>>;
```

## 返回值

Promise&lt;Array&lt;[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md) \| [IPCB_PrimitiveVia](./IPCB_PrimitiveVia.md) \| [IPCB_PrimitiveArc](./IPCB_PrimitiveArc.md)<!-- -->&gt;&gt;

相邻的直线、过孔、圆弧线图元对象

## 备注

将会获取与直线两端直接相连的直线、过孔、圆弧线图元对象

### getentiretrack

# IPCB_PrimitiveLine.getEntireTrack() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

获取整段导线

## 签名

```typescript
getEntireTrack(includeVias: false): Promise<Array<IPCB_PrimitiveLine | IPCB_PrimitiveArc>>;
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

includeVias

</td><td>

false

</td><td>

是否包含导线两端的过孔

</td></tr>
</tbody></table>

## 返回值

Promise&lt;Array&lt;[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md) \| [IPCB_PrimitiveArc](./IPCB_PrimitiveArc.md)<!-- -->&gt;&gt;

整段导线内的所有直线和圆弧线

### getentiretrack_1

# IPCB_PrimitiveLine.getEntireTrack() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

获取整段导线

## 签名

```typescript
getEntireTrack(includeVias: true): Promise<Array<IPCB_PrimitiveLine | IPCB_PrimitiveArc | IPCB_PrimitiveVia>>;
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

includeVias

</td><td>

true

</td><td>

是否包含导线两端的过孔

</td></tr>
</tbody></table>

## 返回值

Promise&lt;Array&lt;[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md) \| [IPCB_PrimitiveArc](./IPCB_PrimitiveArc.md) \| [IPCB_PrimitiveVia](./IPCB_PrimitiveVia.md)<!-- -->&gt;&gt;

整段导线内的所有直线、圆弧线，以及两端连接的过孔（如果有）

### getstate_endx

# IPCB_PrimitiveLine.getState_EndX() method

获取属性状态：终止位置 X

## 签名

```typescript
getState_EndX(): number;
```

## 返回值

number

终止位置 X

### getstate_endy

# IPCB_PrimitiveLine.getState_EndY() method

获取属性状态：终止位置 Y

## 签名

```typescript
getState_EndY(): number;
```

## 返回值

number

终止位置 Y

### getstate_layer

# IPCB_PrimitiveLine.getState_Layer() method

获取属性状态：层

## 签名

```typescript
getState_Layer(): TPCB_LayersOfLine;
```

## 返回值

[TPCB_LayersOfLine](../types/TPCB_LayersOfLine.md)

层

### getstate_linewidth

# IPCB_PrimitiveLine.getState_LineWidth() method

获取属性状态：线宽

## 签名

```typescript
getState_LineWidth(): number;
```

## 返回值

number

线宽

### getstate_net

# IPCB_PrimitiveLine.getState_Net() method

获取属性状态：网络名称

## 签名

```typescript
getState_Net(): string;
```

## 返回值

string

网络名称

### getstate_primitiveid

# IPCB_PrimitiveLine.getState_PrimitiveId() method

获取属性状态：图元 ID

## 签名

```typescript
getState_PrimitiveId(): string;
```

## 返回值

string

图元 ID

### getstate_primitivelock

# IPCB_PrimitiveLine.getState_PrimitiveLock() method

获取属性状态：是否锁定

## 签名

```typescript
getState_PrimitiveLock(): boolean;
```

## 返回值

boolean

是否锁定

### getstate_primitivetype

# IPCB_PrimitiveLine.getState_PrimitiveType() method

获取属性状态：图元类型

## 签名

```typescript
getState_PrimitiveType(): EPCB_PrimitiveType;
```

## 返回值

[EPCB_PrimitiveType](../enums/EPCB_PrimitiveType.md)

图元类型

### getstate_startx

# IPCB_PrimitiveLine.getState_StartX() method

获取属性状态：起始位置 X

## 签名

```typescript
getState_StartX(): number;
```

## 返回值

number

起始位置 X

### getstate_starty

# IPCB_PrimitiveLine.getState_StartY() method

获取属性状态：起始位置 Y

## 签名

```typescript
getState_StartY(): number;
```

## 返回值

number

起始位置 Y

### isasync

# IPCB_PrimitiveLine.isAsync() method

查询图元是否为异步图元

## 签名

```typescript
isAsync(): boolean;
```

## 返回值

boolean

是否为异步图元

### reset

# IPCB_PrimitiveLine.reset() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将异步图元重置为当前画布状态

## 签名

```typescript
reset(): Promise<IPCB_PrimitiveLine>;
```

## 返回值

Promise&lt;[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md)<!-- -->&gt;

直线图元对象

### setstate_endx

# IPCB_PrimitiveLine.setState_EndX() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：终止位置 X

## 签名

```typescript
setState_EndX(endX: number): IPCB_PrimitiveLine;
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

终止位置 X

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md)

直线图元对象

### setstate_endy

# IPCB_PrimitiveLine.setState_EndY() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：终止位置 Y

## 签名

```typescript
setState_EndY(endY: number): IPCB_PrimitiveLine;
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

终止位置 Y

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md)

直线图元对象

### setstate_layer

# IPCB_PrimitiveLine.setState_Layer() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：层

## 签名

```typescript
setState_Layer(layer: TPCB_LayersOfLine): IPCB_PrimitiveLine;
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

layer

</td><td>

[TPCB_LayersOfLine](../types/TPCB_LayersOfLine.md)

</td><td>

层

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md)

直线图元对象

### setstate_linewidth

# IPCB_PrimitiveLine.setState_LineWidth() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：线宽

## 签名

```typescript
setState_LineWidth(lineWidth: number): IPCB_PrimitiveLine;
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

number

</td><td>

线宽

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md)

直线图元对象

### setstate_net

# IPCB_PrimitiveLine.setState_Net() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：网络名称

## 签名

```typescript
setState_Net(net: string): IPCB_PrimitiveLine;
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

net

</td><td>

string

</td><td>

网络名称

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md)

直线图元对象

### setstate_primitivelock

# IPCB_PrimitiveLine.setState_PrimitiveLock() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：是否锁定

## 签名

```typescript
setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveLine;
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

primitiveLock

</td><td>

boolean

</td><td>

是否锁定

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md)

直线图元对象

### setstate_startx

# IPCB_PrimitiveLine.setState_StartX() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：起始位置 X

## 签名

```typescript
setState_StartX(startX: number): IPCB_PrimitiveLine;
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

起始位置 X

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md)

直线图元对象

### setstate_starty

# IPCB_PrimitiveLine.setState_StartY() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：起始位置 Y

## 签名

```typescript
setState_StartY(startY: number): IPCB_PrimitiveLine;
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

起始位置 Y

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md)

直线图元对象

### toasync

# IPCB_PrimitiveLine.toAsync() method

将图元转换为异步图元

## 签名

```typescript
toAsync(): IPCB_PrimitiveLine;
```

## 返回值

[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md)

直线图元对象

### tosync

# IPCB_PrimitiveLine.toSync() method

将图元转换为同步图元

## 签名

```typescript
toSync(): IPCB_PrimitiveLine;
```

## 返回值

[IPCB_PrimitiveLine](./IPCB_PrimitiveLine.md)

直线图元对象
