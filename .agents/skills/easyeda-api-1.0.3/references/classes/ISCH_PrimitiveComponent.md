# ISCH_PrimitiveComponent class

器件图元

## 签名

```typescript
declare class ISCH_PrimitiveComponent implements ISCH_Primitive
```

**实现自：**[ISCH_Primitive](../interfaces/ISCH_Primitive.md)

## 备注

## 属性

<table><thead><tr><th>

属性名

</th><th>

修饰符

</th><th>

类型

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

[async](./ISCH_PrimitiveComponent.md)

</td><td>

`protected`

</td><td>

boolean

</td><td>

异步

</td></tr>
<tr><td>

[designator?](./ISCH_PrimitiveComponent.md)

</td><td>

`protected`

</td><td>

string

</td><td>

_（可选）_ Component 属性：位号

</td></tr>
<tr><td>

[mirror](./ISCH_PrimitiveComponent.md)

</td><td>

`protected`

</td><td>

boolean

</td><td>

是否镜像

</td></tr>
<tr><td>

[name?](./ISCH_PrimitiveComponent.md)

</td><td>

`protected`

</td><td>

string

</td><td>

_（可选）_ Component 属性：名称

</td></tr>
<tr><td>

[otherProperty?](./ISCH_PrimitiveComponent.md)

</td><td>

`protected`

</td><td>

\{ \[key: string\]: string \| number \| boolean; \}

</td><td>

_（可选）_ 其它参数

</td></tr>
<tr><td>

[primitiveId?](./ISCH_PrimitiveComponent.md)

</td><td>

`protected`

</td><td>

string

</td><td>

_（可选）_ 图元 ID

</td></tr>
<tr><td>

[rotation](./ISCH_PrimitiveComponent.md)

</td><td>

`protected`

</td><td>

number

</td><td>

旋转角度

</td></tr>
<tr><td>

[x](./ISCH_PrimitiveComponent.md)

</td><td>

`protected`

</td><td>

number

</td><td>

坐标 X

</td></tr>
<tr><td>

[y](./ISCH_PrimitiveComponent.md)

</td><td>

`protected`

</td><td>

number

</td><td>

坐标 Y

</td></tr>
</tbody></table>

## 方法

<table><thead><tr><th>

方法名

</th><th>

修饰符

</th><th>

描述

</th></tr></thead>
<tbody><tr><td>

[done()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 将对图元的更改应用到画布

</td></tr>
<tr><td>

[getState_AddIntoBom()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：是否加入 BOM

</td></tr>
<tr><td>

[getState_AddIntoPcb()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：是否转到 PCB

</td></tr>
<tr><td>

[getState_Component()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：关联库器件

</td></tr>
<tr><td>

[getState_ComponentType()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：器件类型

</td></tr>
<tr><td>

[getState_Designator()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：位号

</td></tr>
<tr><td>

[getState_Footprint()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：关联库封装

</td></tr>
<tr><td>

[getState_Manufacturer()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：制造商

</td></tr>
<tr><td>

[getState_ManufacturerId()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：制造商编号

</td></tr>
<tr><td>

[getState_Mirror()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：是否镜像

</td></tr>
<tr><td>

[getState_Name()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：名称

</td></tr>
<tr><td>

[getState_Net()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：网络名称

</td></tr>
<tr><td>

[getState_OtherProperty()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：其它参数

</td></tr>
<tr><td>

[getState_PrimitiveId()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：图元 ID

</td></tr>
<tr><td>

[getState_PrimitiveType()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：图元类型

</td></tr>
<tr><td>

[getState_Rotation()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：旋转角度

</td></tr>
<tr><td>

[getState_SubPartName()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：子图块名称

</td></tr>
<tr><td>

[getState_Supplier()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：供应商

</td></tr>
<tr><td>

[getState_SupplierId()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：供应商编号

</td></tr>
<tr><td>

[getState_Symbol()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：关联库符号

</td></tr>
<tr><td>

[getState_UniqueId()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：唯一 ID

</td></tr>
<tr><td>

[getState_X()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：坐标 X

</td></tr>
<tr><td>

[getState_Y()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：坐标 Y

</td></tr>
<tr><td>

[isAsync()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

查询图元是否为异步图元

</td></tr>
<tr><td>

[reset()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 将异步图元重置为当前画布状态

</td></tr>
<tr><td>

[setState_AddIntoBom(addIntoBom)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：是否加入 BOM

</td></tr>
<tr><td>

[setState_AddIntoPcb(addIntoPcb)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：是否转到 PCB

</td></tr>
<tr><td>

[setState_Designator(designator)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：位号

</td></tr>
<tr><td>

[setState_Manufacturer(manufacturer)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：制造商

</td></tr>
<tr><td>

[setState_ManufacturerId(manufacturerId)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：制造商编号

</td></tr>
<tr><td>

[setState_Mirror(mirror)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：是否镜像

</td></tr>
<tr><td>

[setState_Name(name)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：名称

</td></tr>
<tr><td>

[setState_Net(net)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：网络名称

</td></tr>
<tr><td>

[setState_OtherProperty(otherProperty)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：其它参数

</td></tr>
<tr><td>

[setState_Rotation(rotation)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：旋转角度

</td></tr>
<tr><td>

[setState_Supplier(supplier)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：供应商

</td></tr>
<tr><td>

[setState_SupplierId(supplierId)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：供应商编号

</td></tr>
<tr><td>

[setState_UniqueId(uniqueId)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：唯一 ID

</td></tr>
<tr><td>

[setState_X(x)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：坐标 X

</td></tr>
<tr><td>

[setState_Y(y)](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：坐标 Y

</td></tr>
<tr><td>

[toAsync()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

将图元转换为异步图元

</td></tr>
<tr><td>

[toSync()](./ISCH_PrimitiveComponent.md)

</td><td>

</td><td>

将图元转换为同步图元

</td></tr>
</tbody></table>

---

## 属性详情

### async

# ISCH_PrimitiveComponent.async property

异步

## 签名

```typescript
protected async: boolean;
```

### designator

# ISCH_PrimitiveComponent.designator property

Component 属性：位号

## 签名

```typescript
protected designator?: string;
```

### mirror

# ISCH_PrimitiveComponent.mirror property

是否镜像

## 签名

```typescript
protected mirror: boolean;
```

### name

# ISCH_PrimitiveComponent.name property

Component 属性：名称

## 签名

```typescript
protected name?: string;
```

### otherproperty

# ISCH_PrimitiveComponent.otherProperty property

其它参数

## 签名

```typescript
protected otherProperty?: {
        [key: string]: string | number | boolean;
    };
```

### primitiveid

# ISCH_PrimitiveComponent.primitiveId property

图元 ID

## 签名

```typescript
protected primitiveId?: string;
```

### rotation

# ISCH_PrimitiveComponent.rotation property

旋转角度

## 签名

```typescript
protected rotation: number;
```

### x

# ISCH_PrimitiveComponent.x property

坐标 X

## 签名

```typescript
protected x: number;
```

### y

# ISCH_PrimitiveComponent.y property

坐标 Y

## 签名

```typescript
protected y: number;
```

---

## 方法详情

### done

# ISCH_PrimitiveComponent.done() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将对图元的更改应用到画布

## 签名

```typescript
done(): Promise<ISCH_PrimitiveComponent>;
```

## 返回值

Promise&lt;[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)<!-- -->&gt;

器件图元对象

### getstate_addintobom

# ISCH_PrimitiveComponent.getState_AddIntoBom() method

获取属性状态：是否加入 BOM

## 签名

```typescript
getState_AddIntoBom(): boolean | undefined;
```

## 返回值

boolean \| undefined

是否加入 BOM

### getstate_addintopcb

# ISCH_PrimitiveComponent.getState_AddIntoPcb() method

获取属性状态：是否转到 PCB

## 签名

```typescript
getState_AddIntoPcb(): boolean | undefined;
```

## 返回值

boolean \| undefined

是否转到 PCB

### getstate_component

# ISCH_PrimitiveComponent.getState_Component() method

获取属性状态：关联库器件

## 签名

```typescript
getState_Component(): {
        libraryUuid: string;
        uuid: string;
    };
```

## 返回值

\{ libraryUuid: string; uuid: string; \}

关联库器件

### getstate_componenttype

# ISCH_PrimitiveComponent.getState_ComponentType() method

获取属性状态：器件类型

## 签名

```typescript
getState_ComponentType(): ESCH_PrimitiveComponentType;
```

## 返回值

ESCH_PrimitiveComponentType

器件类型

### getstate_designator

# ISCH_PrimitiveComponent.getState_Designator() method

获取属性状态：位号

## 签名

```typescript
getState_Designator(): string | undefined;
```

## 返回值

string \| undefined

位号

### getstate_footprint

# ISCH_PrimitiveComponent.getState_Footprint() method

获取属性状态：关联库封装

## 签名

```typescript
getState_Footprint(): {
        libraryUuid: string;
        uuid: string;
    } | undefined;
```

## 返回值

{ libraryUuid: string; uuid: string; } \| undefined

关联库封装

### getstate_manufacturer

# ISCH_PrimitiveComponent.getState_Manufacturer() method

获取属性状态：制造商

## 签名

```typescript
getState_Manufacturer(): string | undefined;
```

## 返回值

string \| undefined

制造商

### getstate_manufacturerid

# ISCH_PrimitiveComponent.getState_ManufacturerId() method

获取属性状态：制造商编号

## 签名

```typescript
getState_ManufacturerId(): string | undefined;
```

## 返回值

string \| undefined

制造商编号

### getstate_mirror

# ISCH_PrimitiveComponent.getState_Mirror() method

获取属性状态：是否镜像

## 签名

```typescript
getState_Mirror(): boolean;
```

## 返回值

boolean

是否镜像

### getstate_name

# ISCH_PrimitiveComponent.getState_Name() method

获取属性状态：名称

## 签名

```typescript
getState_Name(): string | undefined;
```

## 返回值

string \| undefined

名称

### getstate_net

# ISCH_PrimitiveComponent.getState_Net() method

获取属性状态：网络名称

## 签名

```typescript
getState_Net(): string | undefined;
```

## 返回值

string \| undefined

网络名称

### getstate_otherproperty

# ISCH_PrimitiveComponent.getState_OtherProperty() method

获取属性状态：其它参数

## 签名

```typescript
getState_OtherProperty(): {
        [key: string]: string | number | boolean;
    } | undefined;
```

## 返回值

{ \[key: string\]: string \| number \| boolean; } \| undefined

其它参数

### getstate_primitiveid

# ISCH_PrimitiveComponent.getState_PrimitiveId() method

获取属性状态：图元 ID

## 签名

```typescript
getState_PrimitiveId(): string;
```

## 返回值

string

图元 ID

### getstate_primitivetype

# ISCH_PrimitiveComponent.getState_PrimitiveType() method

获取属性状态：图元类型

## 签名

```typescript
getState_PrimitiveType(): ESCH_PrimitiveType;
```

## 返回值

[ESCH_PrimitiveType](../enums/ESCH_PrimitiveType.md)

图元类型

### getstate_rotation

# ISCH_PrimitiveComponent.getState_Rotation() method

获取属性状态：旋转角度

## 签名

```typescript
getState_Rotation(): number;
```

## 返回值

number

旋转角度

### getstate_subpartname

# ISCH_PrimitiveComponent.getState_SubPartName() method

获取属性状态：子图块名称

## 签名

```typescript
getState_SubPartName(): string | undefined;
```

## 返回值

string \| undefined

子图块名称

### getstate_supplier

# ISCH_PrimitiveComponent.getState_Supplier() method

获取属性状态：供应商

## 签名

```typescript
getState_Supplier(): string | undefined;
```

## 返回值

string \| undefined

供应商

### getstate_supplierid

# ISCH_PrimitiveComponent.getState_SupplierId() method

获取属性状态：供应商编号

## 签名

```typescript
getState_SupplierId(): string | undefined;
```

## 返回值

string \| undefined

供应商编号

### getstate_symbol

# ISCH_PrimitiveComponent.getState_Symbol() method

获取属性状态：关联库符号

## 签名

```typescript
getState_Symbol(): {
        libraryUuid: string;
        uuid: string;
    } | undefined;
```

## 返回值

{ libraryUuid: string; uuid: string; } \| undefined

关联库符号

### getstate_uniqueid

# ISCH_PrimitiveComponent.getState_UniqueId() method

获取属性状态：唯一 ID

## 签名

```typescript
getState_UniqueId(): string | undefined;
```

## 返回值

string \| undefined

唯一 ID

### getstate_x

# ISCH_PrimitiveComponent.getState_X() method

获取属性状态：坐标 X

## 签名

```typescript
getState_X(): number;
```

## 返回值

number

坐标 X

### getstate_y

# ISCH_PrimitiveComponent.getState_Y() method

获取属性状态：坐标 Y

## 签名

```typescript
getState_Y(): number;
```

## 返回值

number

坐标 Y

### isasync

# ISCH_PrimitiveComponent.isAsync() method

查询图元是否为异步图元

## 签名

```typescript
isAsync(): boolean;
```

## 返回值

boolean

是否为异步图元

### reset

# ISCH_PrimitiveComponent.reset() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将异步图元重置为当前画布状态

## 签名

```typescript
reset(): Promise<ISCH_PrimitiveComponent>;
```

## 返回值

Promise&lt;[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)<!-- -->&gt;

器件图元对象

### setstate_addintobom

# ISCH_PrimitiveComponent.setState_AddIntoBom() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：是否加入 BOM

## 签名

```typescript
setState_AddIntoBom(addIntoBom: boolean | undefined): ISCH_PrimitiveComponent;
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

addIntoBom

</td><td>

boolean \| undefined

</td><td>

是否加入 BOM

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_addintopcb

# ISCH_PrimitiveComponent.setState_AddIntoPcb() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：是否转到 PCB

## 签名

```typescript
setState_AddIntoPcb(addIntoPcb: boolean | undefined): ISCH_PrimitiveComponent;
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

addIntoPcb

</td><td>

boolean \| undefined

</td><td>

是否转到 PCB

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_designator

# ISCH_PrimitiveComponent.setState_Designator() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：位号

## 签名

```typescript
setState_Designator(designator: string | undefined): ISCH_PrimitiveComponent;
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

designator

</td><td>

string \| undefined

</td><td>

位号

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_manufacturer

# ISCH_PrimitiveComponent.setState_Manufacturer() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：制造商

## 签名

```typescript
setState_Manufacturer(manufacturer: string | undefined): ISCH_PrimitiveComponent;
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

manufacturer

</td><td>

string \| undefined

</td><td>

制造商

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_manufacturerid

# ISCH_PrimitiveComponent.setState_ManufacturerId() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：制造商编号

## 签名

```typescript
setState_ManufacturerId(manufacturerId: string | undefined): ISCH_PrimitiveComponent;
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

manufacturerId

</td><td>

string \| undefined

</td><td>

制造商编号

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_mirror

# ISCH_PrimitiveComponent.setState_Mirror() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：是否镜像

## 签名

```typescript
setState_Mirror(mirror: boolean): ISCH_PrimitiveComponent;
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

mirror

</td><td>

boolean

</td><td>

是否镜像

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_name

# ISCH_PrimitiveComponent.setState_Name() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：名称

## 签名

```typescript
setState_Name(name: string | undefined): ISCH_PrimitiveComponent;
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

name

</td><td>

string \| undefined

</td><td>

名称

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_net

# ISCH_PrimitiveComponent.setState_Net() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：网络名称

## 签名

```typescript
setState_Net(net: string | undefined): ISCH_PrimitiveComponent;
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

string \| undefined

</td><td>

网络名称

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_otherproperty

# ISCH_PrimitiveComponent.setState_OtherProperty() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：其它参数

## 签名

```typescript
setState_OtherProperty(otherProperty: {
        [key: string]: string | number | boolean;
    }): ISCH_PrimitiveComponent;
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

otherProperty

</td><td>

\{ \[key: string\]: string \| number \| boolean; \}

</td><td>

其它参数

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_rotation

# ISCH_PrimitiveComponent.setState_Rotation() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：旋转角度

## 签名

```typescript
setState_Rotation(rotation: number): ISCH_PrimitiveComponent;
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

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_supplier

# ISCH_PrimitiveComponent.setState_Supplier() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：供应商

## 签名

```typescript
setState_Supplier(supplier: string | undefined): ISCH_PrimitiveComponent;
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

supplier

</td><td>

string \| undefined

</td><td>

供应商

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_supplierid

# ISCH_PrimitiveComponent.setState_SupplierId() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：供应商编号

## 签名

```typescript
setState_SupplierId(supplierId: string | undefined): ISCH_PrimitiveComponent;
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

supplierId

</td><td>

string \| undefined

</td><td>

供应商编号

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_uniqueid

# ISCH_PrimitiveComponent.setState_UniqueId() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：唯一 ID

## 签名

```typescript
setState_UniqueId(uniqueId: string | undefined): ISCH_PrimitiveComponent;
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

uniqueId

</td><td>

string \| undefined

</td><td>

唯一 ID

</td></tr>
</tbody></table>

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_x

# ISCH_PrimitiveComponent.setState_X() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：坐标 X

## 签名

```typescript
setState_X(x: number): ISCH_PrimitiveComponent;
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

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### setstate_y

# ISCH_PrimitiveComponent.setState_Y() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：坐标 Y

## 签名

```typescript
setState_Y(y: number): ISCH_PrimitiveComponent;
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

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

器件图元对象

### toasync

# ISCH_PrimitiveComponent.toAsync() method

将图元转换为异步图元

## 签名

```typescript
toAsync(): ISCH_PrimitiveComponent;
```

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

圆弧线图元对象

### tosync

# ISCH_PrimitiveComponent.toSync() method

将图元转换为同步图元

## 签名

```typescript
toSync(): ISCH_PrimitiveComponent;
```

## 返回值

[ISCH_PrimitiveComponent](./ISCH_PrimitiveComponent.md)

圆弧线图元对象
