# IPCB_PrimitiveImage class

图像图元

## 签名

```typescript
declare class IPCB_PrimitiveImage implements IPCB_Primitive
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

[done()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

**_(BETA)_** 将对图元的更改应用到画布

</td></tr>
<tr><td>

[getState_ComplexPolygon()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

获取属性状态：图像源数据（复杂多边形）

</td></tr>
<tr><td>

[getState_Height()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

获取属性状态：高

</td></tr>
<tr><td>

[getState_HorizonMirror()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

获取属性状态：是否水平镜像

</td></tr>
<tr><td>

[getState_Layer()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

获取属性状态：层

</td></tr>
<tr><td>

[getState_PrimitiveId()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

获取属性状态：图元 ID

</td></tr>
<tr><td>

[getState_PrimitiveLock()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

获取属性状态：是否锁定

</td></tr>
<tr><td>

[getState_PrimitiveType()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

获取属性状态：图元类型

</td></tr>
<tr><td>

[getState_Rotation()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

获取属性状态：旋转角度

</td></tr>
<tr><td>

[getState_Width()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

获取属性状态：宽

</td></tr>
<tr><td>

[getState_X()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

获取属性状态：BBox 左上点坐标 X

</td></tr>
<tr><td>

[getState_Y()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

获取属性状态：BBox 左上点坐标 Y

</td></tr>
<tr><td>

[isAsync()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

查询图元是否为异步图元

</td></tr>
<tr><td>

[reset()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

**_(BETA)_** 将异步图元重置为当前画布状态

</td></tr>
<tr><td>

[setState_Height(height)](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：高

</td></tr>
<tr><td>

[setState_HorizonMirror(horizonMirror)](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：是否水平镜像

</td></tr>
<tr><td>

[setState_Layer(layer)](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：层

</td></tr>
<tr><td>

[setState_PrimitiveLock(primitiveLock)](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：是否锁定

</td></tr>
<tr><td>

[setState_Rotation(rotation)](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：旋转角度

</td></tr>
<tr><td>

[setState_Width(width)](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：宽

</td></tr>
<tr><td>

[setState_X(x)](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：BBox 左上点坐标 X

</td></tr>
<tr><td>

[setState_Y(y)](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：BBox 左上点坐标 Y

</td></tr>
<tr><td>

[toAsync()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

将图元转换为异步图元

</td></tr>
<tr><td>

[toSync()](./IPCB_PrimitiveImage.md)

</td><td>

</td><td>

将图元转换为同步图元

</td></tr>
</tbody></table>

---

## 方法详情

### done

# IPCB_PrimitiveImage.done() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将对图元的更改应用到画布

## 签名

```typescript
done(): Promise<IPCB_PrimitiveImage>;
```

## 返回值

Promise&lt;[IPCB_PrimitiveImage](./IPCB_PrimitiveImage.md)<!-- -->&gt;

图像图元对象

### getstate_complexpolygon

# IPCB_PrimitiveImage.getState_ComplexPolygon() method

获取属性状态：图像源数据（复杂多边形）

## 签名

```typescript
getState_ComplexPolygon(): TPCB_PolygonSourceArray | Array<TPCB_PolygonSourceArray>;
```

## 返回值

[TPCB_PolygonSourceArray](../types/TPCB_PolygonSourceArray.md) \| Array&lt;[TPCB_PolygonSourceArray](../types/TPCB_PolygonSourceArray.md)<!-- -->&gt;

图像源数据（复杂多边形）

### getstate_height

# IPCB_PrimitiveImage.getState_Height() method

获取属性状态：高

## 签名

```typescript
getState_Height(): number;
```

## 返回值

number

高

### getstate_horizonmirror

# IPCB_PrimitiveImage.getState_HorizonMirror() method

获取属性状态：是否水平镜像

## 签名

```typescript
getState_HorizonMirror(): boolean;
```

## 返回值

boolean

是否水平镜像

### getstate_layer

# IPCB_PrimitiveImage.getState_Layer() method

获取属性状态：层

## 签名

```typescript
getState_Layer(): TPCB_LayersOfImage;
```

## 返回值

[TPCB_LayersOfImage](../types/TPCB_LayersOfImage.md)

层

### getstate_primitiveid

# IPCB_PrimitiveImage.getState_PrimitiveId() method

获取属性状态：图元 ID

## 签名

```typescript
getState_PrimitiveId(): string;
```

## 返回值

string

图元 ID

### getstate_primitivelock

# IPCB_PrimitiveImage.getState_PrimitiveLock() method

获取属性状态：是否锁定

## 签名

```typescript
getState_PrimitiveLock(): boolean;
```

## 返回值

boolean

是否锁定

### getstate_primitivetype

# IPCB_PrimitiveImage.getState_PrimitiveType() method

获取属性状态：图元类型

## 签名

```typescript
getState_PrimitiveType(): EPCB_PrimitiveType;
```

## 返回值

[EPCB_PrimitiveType](../enums/EPCB_PrimitiveType.md)

图元类型

### getstate_rotation

# IPCB_PrimitiveImage.getState_Rotation() method

获取属性状态：旋转角度

## 签名

```typescript
getState_Rotation(): number;
```

## 返回值

number

旋转角度

### getstate_width

# IPCB_PrimitiveImage.getState_Width() method

获取属性状态：宽

## 签名

```typescript
getState_Width(): number;
```

## 返回值

number

宽

### getstate_x

# IPCB_PrimitiveImage.getState_X() method

获取属性状态：BBox 左上点坐标 X

## 签名

```typescript
getState_X(): number;
```

## 返回值

number

BBox 左上点坐标 X

### getstate_y

# IPCB_PrimitiveImage.getState_Y() method

获取属性状态：BBox 左上点坐标 Y

## 签名

```typescript
getState_Y(): number;
```

## 返回值

number

BBox 左上点坐标 Y

### isasync

# IPCB_PrimitiveImage.isAsync() method

查询图元是否为异步图元

## 签名

```typescript
isAsync(): boolean;
```

## 返回值

boolean

是否为异步图元

### reset

# IPCB_PrimitiveImage.reset() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将异步图元重置为当前画布状态

## 签名

```typescript
reset(): Promise<IPCB_PrimitiveImage>;
```

## 返回值

Promise&lt;[IPCB_PrimitiveImage](./IPCB_PrimitiveImage.md)<!-- -->&gt;

图像图元对象

### setstate_height

# IPCB_PrimitiveImage.setState_Height() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：高

## 签名

```typescript
setState_Height(height: number): IPCB_PrimitiveImage;
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

[IPCB_PrimitiveImage](./IPCB_PrimitiveImage.md)

图像图元对象

### setstate_horizonmirror

# IPCB_PrimitiveImage.setState_HorizonMirror() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：是否水平镜像

## 签名

```typescript
setState_HorizonMirror(horizonMirror: boolean): IPCB_PrimitiveImage;
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

horizonMirror

</td><td>

boolean

</td><td>

是否水平镜像

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveImage](./IPCB_PrimitiveImage.md)

图像图元对象

### setstate_layer

# IPCB_PrimitiveImage.setState_Layer() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：层

## 签名

```typescript
setState_Layer(layer: TPCB_LayersOfImage): IPCB_PrimitiveImage;
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

[TPCB_LayersOfImage](../types/TPCB_LayersOfImage.md)

</td><td>

层

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveImage](./IPCB_PrimitiveImage.md)

图像图元对象

### setstate_primitivelock

# IPCB_PrimitiveImage.setState_PrimitiveLock() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：是否锁定

## 签名

```typescript
setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveImage;
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

[IPCB_PrimitiveImage](./IPCB_PrimitiveImage.md)

图像图元对象

### setstate_rotation

# IPCB_PrimitiveImage.setState_Rotation() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：旋转角度

## 签名

```typescript
setState_Rotation(rotation: number): IPCB_PrimitiveImage;
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

[IPCB_PrimitiveImage](./IPCB_PrimitiveImage.md)

图像图元对象

### setstate_width

# IPCB_PrimitiveImage.setState_Width() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：宽

## 签名

```typescript
setState_Width(width: number): IPCB_PrimitiveImage;
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

[IPCB_PrimitiveImage](./IPCB_PrimitiveImage.md)

图像图元对象

### setstate_x

# IPCB_PrimitiveImage.setState_X() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：BBox 左上点坐标 X

## 签名

```typescript
setState_X(x: number): IPCB_PrimitiveImage;
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

BBox 左上点坐标 X

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveImage](./IPCB_PrimitiveImage.md)

图像图元对象

### setstate_y

# IPCB_PrimitiveImage.setState_Y() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：BBox 左上点坐标 Y

## 签名

```typescript
setState_Y(y: number): IPCB_PrimitiveImage;
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

BBox 左上点坐标 Y

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveImage](./IPCB_PrimitiveImage.md)

图像图元对象

### toasync

# IPCB_PrimitiveImage.toAsync() method

将图元转换为异步图元

## 签名

```typescript
toAsync(): IPCB_PrimitiveImage;
```

## 返回值

[IPCB_PrimitiveImage](./IPCB_PrimitiveImage.md)

图像图元对象

### tosync

# IPCB_PrimitiveImage.toSync() method

将图元转换为同步图元

## 签名

```typescript
toSync(): IPCB_PrimitiveImage;
```

## 返回值

[IPCB_PrimitiveImage](./IPCB_PrimitiveImage.md)

图像图元对象
