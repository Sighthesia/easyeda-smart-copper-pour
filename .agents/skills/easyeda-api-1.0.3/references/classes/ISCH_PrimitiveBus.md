# ISCH_PrimitiveBus class

总线图元

## 签名

```typescript
declare class ISCH_PrimitiveBus implements ISCH_Primitive
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

[done()](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

**_(BETA)_** 将对图元的更改应用到画布

</td></tr>
<tr><td>

[getState_BusName()](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

获取属性状态：总线名称

</td></tr>
<tr><td>

[getState_Color()](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

获取属性状态：总线颜色

</td></tr>
<tr><td>

[getState_Line()](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

获取属性状态：多段线坐标组

</td></tr>
<tr><td>

[getState_LineType()](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

获取属性状态：线型

</td></tr>
<tr><td>

[getState_LineWidth()](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

获取属性状态：线宽

</td></tr>
<tr><td>

[getState_PrimitiveId()](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

获取属性状态：图元 ID

</td></tr>
<tr><td>

[getState_PrimitiveType()](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

获取属性状态：图元类型

</td></tr>
<tr><td>

[isAsync()](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

查询图元是否为异步图元

</td></tr>
<tr><td>

[setState_BusName(busName)](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：总线名称

</td></tr>
<tr><td>

[setState_Color(color)](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：总线颜色

</td></tr>
<tr><td>

[setState_Line(line)](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：多段线坐标组

</td></tr>
<tr><td>

[setState_LineType(lineType)](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：线型

</td></tr>
<tr><td>

[setState_LineWidth(lineWidth)](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：线宽

</td></tr>
<tr><td>

[toAsync()](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

将图元转换为异步图元

</td></tr>
<tr><td>

[toSync()](./ISCH_PrimitiveBus.md)

</td><td>

</td><td>

将图元转换为同步图元

</td></tr>
</tbody></table>

---

## 方法详情

### done

# ISCH_PrimitiveBus.done() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将对图元的更改应用到画布

## 签名

```typescript
done(): Promise<ISCH_PrimitiveBus>;
```

## 返回值

Promise&lt;[ISCH_PrimitiveBus](./ISCH_PrimitiveBus.md)<!-- -->&gt;

总线图元对象

### getstate_busname

# ISCH_PrimitiveBus.getState_BusName() method

获取属性状态：总线名称

## 签名

```typescript
getState_BusName(): string;
```

## 返回值

string

总线名称

### getstate_color

# ISCH_PrimitiveBus.getState_Color() method

获取属性状态：总线颜色

## 签名

```typescript
getState_Color(): string | null;
```

## 返回值

string \| null

总线颜色

### getstate_line

# ISCH_PrimitiveBus.getState_Line() method

获取属性状态：多段线坐标组

## 签名

```typescript
getState_Line(): Array<number> | Array<Array<number>>;
```

## 返回值

Array&lt;number&gt; \| Array&lt;Array&lt;number&gt;&gt;

多段线坐标组

### getstate_linetype

# ISCH_PrimitiveBus.getState_LineType() method

获取属性状态：线型

## 签名

```typescript
getState_LineType(): ESCH_PrimitiveLineType | null;
```

## 返回值

[ESCH_PrimitiveLineType](../enums/ESCH_PrimitiveLineType.md) \| null

线型

### getstate_linewidth

# ISCH_PrimitiveBus.getState_LineWidth() method

获取属性状态：线宽

## 签名

```typescript
getState_LineWidth(): number | null;
```

## 返回值

number \| null

线宽

### getstate_primitiveid

# ISCH_PrimitiveBus.getState_PrimitiveId() method

获取属性状态：图元 ID

## 签名

```typescript
getState_PrimitiveId(): string;
```

## 返回值

string

图元 ID

### getstate_primitivetype

# ISCH_PrimitiveBus.getState_PrimitiveType() method

获取属性状态：图元类型

## 签名

```typescript
getState_PrimitiveType(): ESCH_PrimitiveType;
```

## 返回值

[ESCH_PrimitiveType](../enums/ESCH_PrimitiveType.md)

图元类型

### isasync

# ISCH_PrimitiveBus.isAsync() method

查询图元是否为异步图元

## 签名

```typescript
isAsync(): boolean;
```

## 返回值

boolean

是否为异步图元

### setstate_busname

# ISCH_PrimitiveBus.setState_BusName() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：总线名称

## 签名

```typescript
setState_BusName(busName: string): ISCH_PrimitiveBus;
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

busName

</td><td>

string

</td><td>

总线名称

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveBus](./ISCH_PrimitiveBus.md)

总线图元对象

### setstate_color

# ISCH_PrimitiveBus.setState_Color() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：总线颜色

## 签名

```typescript
setState_Color(color: string | null): ISCH_PrimitiveBus;
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

总线颜色

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveBus](./ISCH_PrimitiveBus.md)

总线图元对象

### setstate_line

# ISCH_PrimitiveBus.setState_Line() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：多段线坐标组

## 签名

```typescript
setState_Line(line: Array<number> | Array<Array<number>>): ISCH_PrimitiveBus;
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

[ISCH_PrimitiveBus](./ISCH_PrimitiveBus.md)

总线图元对象

### setstate_linetype

# ISCH_PrimitiveBus.setState_LineType() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：线型

## 签名

```typescript
setState_LineType(lineType: ESCH_PrimitiveLineType | null): ISCH_PrimitiveBus;
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

[ISCH_PrimitiveBus](./ISCH_PrimitiveBus.md)

总线图元对象

### setstate_linewidth

# ISCH_PrimitiveBus.setState_LineWidth() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：线宽

## 签名

```typescript
setState_LineWidth(lineWidth: number | null): ISCH_PrimitiveBus;
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

[ISCH_PrimitiveBus](./ISCH_PrimitiveBus.md)

总线图元对象

### toasync

# ISCH_PrimitiveBus.toAsync() method

将图元转换为异步图元

## 签名

```typescript
toAsync(): ISCH_PrimitiveBus;
```

## 返回值

[ISCH_PrimitiveBus](./ISCH_PrimitiveBus.md)

总线图元对象

### tosync

# ISCH_PrimitiveBus.toSync() method

将图元转换为同步图元

## 签名

```typescript
toSync(): ISCH_PrimitiveBus;
```

## 返回值

[ISCH_PrimitiveBus](./ISCH_PrimitiveBus.md)

总线图元对象
