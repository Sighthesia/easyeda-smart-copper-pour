# IPCB_PrimitivePolyline class

折线图元

## 签名

```typescript
declare class IPCB_PrimitivePolyline implements IPCB_Primitive
```

**实现自：**[IPCB_Primitive](../interfaces/IPCB_Primitive.md)

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

[convertToFill()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

**_(BETA)_** 转换到：填充图元

</td></tr>
<tr><td>

[convertToPour()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

**_(BETA)_** 转换到：覆铜边框图元

</td></tr>
<tr><td>

[convertToRegion()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

**_(BETA)_** 转换到：区域图元

</td></tr>
<tr><td>

[done()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

**_(BETA)_** 将对图元的更改应用到画布

</td></tr>
<tr><td>

[getState_Layer()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

获取属性状态：层

</td></tr>
<tr><td>

[getState_LineWidth()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

获取属性状态：线宽

</td></tr>
<tr><td>

[getState_Net()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

获取属性状态：网络名称

</td></tr>
<tr><td>

[getState_Polygon()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

获取属性状态：单多边形

</td></tr>
<tr><td>

[getState_PrimitiveId()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

获取属性状态：图元 ID

</td></tr>
<tr><td>

[getState_PrimitiveLock()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

获取属性状态：是否锁定

</td></tr>
<tr><td>

[getState_PrimitiveType()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

获取属性状态：图元类型

</td></tr>
<tr><td>

[isAsync()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

查询图元是否为异步图元

</td></tr>
<tr><td>

[reset()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

**_(BETA)_** 将异步图元重置为当前画布状态

</td></tr>
<tr><td>

[setState_Layer(layer)](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：层

</td></tr>
<tr><td>

[setState_LineWidth(lineWidth)](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：线宽

</td></tr>
<tr><td>

[setState_Net(net)](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：网络名称

</td></tr>
<tr><td>

[setState_Polygon(polygon)](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：单多边形

</td></tr>
<tr><td>

[setState_PrimitiveLock(primitiveLock)](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：是否锁定

</td></tr>
<tr><td>

[toAsync()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

将图元转换为异步图元

</td></tr>
<tr><td>

[toSync()](./IPCB_PrimitivePolyline.md)

</td><td>

</td><td>

将图元转换为同步图元

</td></tr>
</tbody></table>

---

## 方法详情

### converttofill

# IPCB_PrimitivePolyline.convertToFill() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

转换到：填充图元

## 签名

```typescript
convertToFill(): Promise<IPCB_PrimitiveFill>;
```

## 返回值

Promise&lt;[IPCB_PrimitiveFill](./IPCB_PrimitiveFill.md)<!-- -->&gt;

填充图元对象

### converttopour

# IPCB_PrimitivePolyline.convertToPour() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

转换到：覆铜边框图元

## 签名

```typescript
convertToPour(): Promise<IPCB_PrimitivePour>;
```

## 返回值

Promise&lt;[IPCB_PrimitivePour](./IPCB_PrimitivePour.md)<!-- -->&gt;

覆铜边框图元对象

### converttoregion

# IPCB_PrimitivePolyline.convertToRegion() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

转换到：区域图元

## 签名

```typescript
convertToRegion(): Promise<IPCB_PrimitiveRegion>;
```

## 返回值

Promise&lt;[IPCB_PrimitiveRegion](./IPCB_PrimitiveRegion.md)<!-- -->&gt;

区域图元对象

### done

# IPCB_PrimitivePolyline.done() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将对图元的更改应用到画布

## 签名

```typescript
done(): Promise<IPCB_PrimitivePolyline>;
```

## 返回值

Promise&lt;[IPCB_PrimitivePolyline](./IPCB_PrimitivePolyline.md)<!-- -->&gt;

折线图元对象

### getstate_layer

# IPCB_PrimitivePolyline.getState_Layer() method

获取属性状态：层

## 签名

```typescript
getState_Layer(): TPCB_LayersOfLine;
```

## 返回值

[TPCB_LayersOfLine](../types/TPCB_LayersOfLine.md)

层

### getstate_linewidth

# IPCB_PrimitivePolyline.getState_LineWidth() method

获取属性状态：线宽

## 签名

```typescript
getState_LineWidth(): number;
```

## 返回值

number

线宽

### getstate_net

# IPCB_PrimitivePolyline.getState_Net() method

获取属性状态：网络名称

## 签名

```typescript
getState_Net(): string;
```

## 返回值

string

网络名称

### getstate_polygon

# IPCB_PrimitivePolyline.getState_Polygon() method

获取属性状态：单多边形

## 签名

```typescript
getState_Polygon(): IPCB_Polygon;
```

## 返回值

[IPCB_Polygon](./IPCB_Polygon.md)

单多边形

### getstate_primitiveid

# IPCB_PrimitivePolyline.getState_PrimitiveId() method

获取属性状态：图元 ID

## 签名

```typescript
getState_PrimitiveId(): string;
```

## 返回值

string

图元 ID

### getstate_primitivelock

# IPCB_PrimitivePolyline.getState_PrimitiveLock() method

获取属性状态：是否锁定

## 签名

```typescript
getState_PrimitiveLock(): boolean;
```

## 返回值

boolean

是否锁定

### getstate_primitivetype

# IPCB_PrimitivePolyline.getState_PrimitiveType() method

获取属性状态：图元类型

## 签名

```typescript
getState_PrimitiveType(): EPCB_PrimitiveType;
```

## 返回值

[EPCB_PrimitiveType](../enums/EPCB_PrimitiveType.md)

图元类型

### isasync

# IPCB_PrimitivePolyline.isAsync() method

查询图元是否为异步图元

## 签名

```typescript
isAsync(): boolean;
```

## 返回值

boolean

是否为异步图元

### reset

# IPCB_PrimitivePolyline.reset() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将异步图元重置为当前画布状态

## 签名

```typescript
reset(): Promise<IPCB_PrimitivePolyline>;
```

## 返回值

Promise&lt;[IPCB_PrimitivePolyline](./IPCB_PrimitivePolyline.md)<!-- -->&gt;

折线图元对象

### setstate_layer

# IPCB_PrimitivePolyline.setState_Layer() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：层

## 签名

```typescript
setState_Layer(layer: TPCB_LayersOfLine): IPCB_PrimitivePolyline;
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

[IPCB_PrimitivePolyline](./IPCB_PrimitivePolyline.md)

折线图元对象

### setstate_linewidth

# IPCB_PrimitivePolyline.setState_LineWidth() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：线宽

## 签名

```typescript
setState_LineWidth(lineWidth: number): IPCB_PrimitivePolyline;
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

[IPCB_PrimitivePolyline](./IPCB_PrimitivePolyline.md)

折线图元对象

### setstate_net

# IPCB_PrimitivePolyline.setState_Net() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：网络名称

## 签名

```typescript
setState_Net(net: string): IPCB_PrimitivePolyline;
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

[IPCB_PrimitivePolyline](./IPCB_PrimitivePolyline.md)

折线图元对象

### setstate_polygon

# IPCB_PrimitivePolyline.setState_Polygon() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：单多边形

## 签名

```typescript
setState_Polygon(polygon: IPCB_Polygon): IPCB_PrimitivePolyline;
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

polygon

</td><td>

[IPCB_Polygon](./IPCB_Polygon.md)

</td><td>

单多边形

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitivePolyline](./IPCB_PrimitivePolyline.md)

折线图元对象

### setstate_primitivelock

# IPCB_PrimitivePolyline.setState_PrimitiveLock() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：是否锁定

## 签名

```typescript
setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitivePolyline;
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

[IPCB_PrimitivePolyline](./IPCB_PrimitivePolyline.md)

折线图元对象

### toasync

# IPCB_PrimitivePolyline.toAsync() method

将图元转换为异步图元

## 签名

```typescript
toAsync(): IPCB_PrimitivePolyline;
```

## 返回值

[IPCB_PrimitivePolyline](./IPCB_PrimitivePolyline.md)

折线图元对象

### tosync

# IPCB_PrimitivePolyline.toSync() method

将图元转换为同步图元

## 签名

```typescript
toSync(): IPCB_PrimitivePolyline;
```

## 返回值

[IPCB_PrimitivePolyline](./IPCB_PrimitivePolyline.md)

折线图元对象
