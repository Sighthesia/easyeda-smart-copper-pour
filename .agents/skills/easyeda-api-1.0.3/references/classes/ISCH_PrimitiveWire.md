# ISCH_PrimitiveWire class

导线图元

## 签名

```typescript
declare class ISCH_PrimitiveWire implements ISCH_Primitive
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

[done()](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

**_(BETA)_** 将对图元的更改应用到画布

</td></tr>
<tr><td>

[getState_Color()](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

获取属性状态：总线颜色

</td></tr>
<tr><td>

[getState_Line()](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

获取属性状态：多段线坐标组

</td></tr>
<tr><td>

[getState_LineType()](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

获取属性状态：线型

</td></tr>
<tr><td>

[getState_LineWidth()](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

获取属性状态：线宽

</td></tr>
<tr><td>

[getState_Net()](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

获取属性状态：网络名称

</td></tr>
<tr><td>

[getState_PrimitiveId()](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

获取属性状态：图元 ID

</td></tr>
<tr><td>

[getState_PrimitiveType()](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

获取属性状态：图元类型

</td></tr>
<tr><td>

[isAsync()](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

查询图元是否为异步图元

</td></tr>
<tr><td>

[setState_Color(color)](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：导线颜色

</td></tr>
<tr><td>

[setState_Line(line)](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：多段线坐标组

</td></tr>
<tr><td>

[setState_LineType(lineType)](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：线型

</td></tr>
<tr><td>

[setState_LineWidth(lineWidth)](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：线宽

</td></tr>
<tr><td>

[setState_Net(net)](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：网络名称

</td></tr>
<tr><td>

[toAsync()](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

将图元转换为异步图元

</td></tr>
<tr><td>

[toSync()](./ISCH_PrimitiveWire.md)

</td><td>

</td><td>

将图元转换为同步图元

</td></tr>
</tbody></table>

---

## 方法详情

### done

# ISCH_PrimitiveWire.done() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将对图元的更改应用到画布

## 签名

```typescript
done(): Promise<ISCH_PrimitiveWire>;
```

## 返回值

Promise&lt;[ISCH_PrimitiveWire](./ISCH_PrimitiveWire.md)<!-- -->&gt;

导线图元对象

### getstate_color

# ISCH_PrimitiveWire.getState_Color() method

获取属性状态：总线颜色

## 签名

```typescript
getState_Color(): string | null;
```

## 返回值

string \| null

总线颜色

### getstate_line

# ISCH_PrimitiveWire.getState_Line() method

获取属性状态：多段线坐标组

## 签名

```typescript
getState_Line(): Array<number> | Array<Array<number>>;
```

## 返回值

Array&lt;number&gt; \| Array&lt;Array&lt;number&gt;&gt;

多段线坐标组

### getstate_linetype

# ISCH_PrimitiveWire.getState_LineType() method

获取属性状态：线型

## 签名

```typescript
getState_LineType(): ESCH_PrimitiveLineType | null;
```

## 返回值

[ESCH_PrimitiveLineType](../enums/ESCH_PrimitiveLineType.md) \| null

线型

### getstate_linewidth

# ISCH_PrimitiveWire.getState_LineWidth() method

获取属性状态：线宽

## 签名

```typescript
getState_LineWidth(): number | null;
```

## 返回值

number \| null

线宽

### getstate_net

# ISCH_PrimitiveWire.getState_Net() method

获取属性状态：网络名称

## 签名

```typescript
getState_Net(): string;
```

## 返回值

string

网络名称

### getstate_primitiveid

# ISCH_PrimitiveWire.getState_PrimitiveId() method

获取属性状态：图元 ID

## 签名

```typescript
getState_PrimitiveId(): string;
```

## 返回值

string

图元 ID

### getstate_primitivetype

# ISCH_PrimitiveWire.getState_PrimitiveType() method

获取属性状态：图元类型

## 签名

```typescript
getState_PrimitiveType(): ESCH_PrimitiveType;
```

## 返回值

[ESCH_PrimitiveType](../enums/ESCH_PrimitiveType.md)

图元类型

### isasync

# ISCH_PrimitiveWire.isAsync() method

查询图元是否为异步图元

## 签名

```typescript
isAsync(): boolean;
```

## 返回值

boolean

是否为异步图元

### setstate_color

# ISCH_PrimitiveWire.setState_Color() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：导线颜色

## 签名

```typescript
setState_Color(color: string | null): ISCH_PrimitiveWire;
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

导线颜色

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveWire](./ISCH_PrimitiveWire.md)

导线图元对象

### setstate_line

# ISCH_PrimitiveWire.setState_Line() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：多段线坐标组

## 签名

```typescript
setState_Line(line: Array<number> | Array<Array<number>>): ISCH_PrimitiveWire;
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

line

</td><td>

Array&lt;number&gt; \| Array&lt;Array&lt;number&gt;&gt;

</td><td>

多段线坐标组

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveWire](./ISCH_PrimitiveWire.md)

导线图元对象

### setstate_linetype

# ISCH_PrimitiveWire.setState_LineType() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：线型

## 签名

```typescript
setState_LineType(lineType: ESCH_PrimitiveLineType | null): ISCH_PrimitiveWire;
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

[ISCH_PrimitiveWire](./ISCH_PrimitiveWire.md)

导线图元对象

### setstate_linewidth

# ISCH_PrimitiveWire.setState_LineWidth() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：线宽

## 签名

```typescript
setState_LineWidth(lineWidth: number | null): ISCH_PrimitiveWire;
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

[ISCH_PrimitiveWire](./ISCH_PrimitiveWire.md)

导线图元对象

### setstate_net

# ISCH_PrimitiveWire.setState_Net() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：网络名称

## 签名

```typescript
setState_Net(net: string): ISCH_PrimitiveWire;
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

[ISCH_PrimitiveWire](./ISCH_PrimitiveWire.md)

导线图元对象

### toasync

# ISCH_PrimitiveWire.toAsync() method

将图元转换为异步图元

## 签名

```typescript
toAsync(): ISCH_PrimitiveWire;
```

## 返回值

[ISCH_PrimitiveWire](./ISCH_PrimitiveWire.md)

导线图元对象

### tosync

# ISCH_PrimitiveWire.toSync() method

将图元转换为同步图元

## 签名

```typescript
toSync(): ISCH_PrimitiveWire;
```

## 返回值

[ISCH_PrimitiveWire](./ISCH_PrimitiveWire.md)

导线图元对象
