# IPCB_PrimitiveComponent class

器件图元

## 签名

```typescript
declare class IPCB_PrimitiveComponent implements IPCB_Primitive
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

[done()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 将对图元的更改应用到画布

</td></tr>
<tr><td>

[getAllPins()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 获取器件关联的所有焊盘

</td></tr>
<tr><td>

[getState_AddIntoBom()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：是否加入 BOM

</td></tr>
<tr><td>

[getState_Component()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：关联库器件

</td></tr>
<tr><td>

[getState_Designator()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：位号

</td></tr>
<tr><td>

[getState_Footprint()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：关联库封装

</td></tr>
<tr><td>

[getState_Layer()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：层

</td></tr>
<tr><td>

[getState_Manufacturer()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：制造商

</td></tr>
<tr><td>

[getState_ManufacturerId()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：制造商编号

</td></tr>
<tr><td>

[getState_Model3D()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：关联库 3D 模型

</td></tr>
<tr><td>

[getState_Name()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：名称

</td></tr>
<tr><td>

[getState_OtherProperty()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：其它参数

</td></tr>
<tr><td>

[getState_Pads()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：焊盘

</td></tr>
<tr><td>

[getState_PrimitiveId()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：图元 ID

</td></tr>
<tr><td>

[getState_PrimitiveLock()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：是否锁定

</td></tr>
<tr><td>

[getState_PrimitiveType()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：图元类型

</td></tr>
<tr><td>

[getState_Rotation()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：旋转角度

</td></tr>
<tr><td>

[getState_Supplier()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：供应商

</td></tr>
<tr><td>

[getState_SupplierId()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：供应商编号

</td></tr>
<tr><td>

[getState_UniqueId()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：唯一 ID

</td></tr>
<tr><td>

[getState_X()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：坐标 X

</td></tr>
<tr><td>

[getState_Y()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

获取属性状态：坐标 Y

</td></tr>
<tr><td>

[isAsync()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

查询图元是否为异步图元

</td></tr>
<tr><td>

[reset()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 将异步图元重置为当前画布状态

</td></tr>
<tr><td>

[setState_AddIntoBom(addIntoBom)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：是否加入 BOM

</td></tr>
<tr><td>

[setState_Designator(designator)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：位号

</td></tr>
<tr><td>

[setState_Layer(layer)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：层

</td></tr>
<tr><td>

[setState_Manufacturer(manufacturer)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：制造商

</td></tr>
<tr><td>

[setState_ManufacturerId(manufacturerId)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：制造商编号

</td></tr>
<tr><td>

[setState_Name(name)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：名称

</td></tr>
<tr><td>

[setState_OtherProperty(otherProperty)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：其它参数

</td></tr>
<tr><td>

[setState_PrimitiveLock(primitiveLock)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：是否锁定

</td></tr>
<tr><td>

[setState_Rotation(rotation)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：旋转角度

</td></tr>
<tr><td>

[setState_Supplier(supplier)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：供应商

</td></tr>
<tr><td>

[setState_SupplierId(supplierId)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：供应商编号

</td></tr>
<tr><td>

[setState_UniqueId(uniqueId)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：唯一 ID

</td></tr>
<tr><td>

[setState_X(x)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：坐标 X

</td></tr>
<tr><td>

[setState_Y(y)](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

**_(BETA)_** 设置属性状态：坐标 Y

</td></tr>
<tr><td>

[toAsync()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

将图元转换为异步图元

</td></tr>
<tr><td>

[toSync()](./IPCB_PrimitiveComponent.md)

</td><td>

</td><td>

将图元转换为同步图元

</td></tr>
</tbody></table>

---

## 方法详情

### done

# IPCB_PrimitiveComponent.done() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将对图元的更改应用到画布

## 签名

```typescript
done(): Promise<IPCB_PrimitiveComponent>;
```

## 返回值

Promise&lt;[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)<!-- -->&gt;

器件图元对象

### getallpins

# IPCB_PrimitiveComponent.getAllPins() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

获取器件关联的所有焊盘

## 签名

```typescript
getAllPins(): Promise<Array<IPCB_PrimitiveComponentPad>>;
```

## 返回值

Promise&lt;Array&lt;[IPCB_PrimitiveComponentPad](./IPCB_PrimitiveComponentPad.md)<!-- -->&gt;&gt;

器件焊盘图元数组

### getstate_addintobom

# IPCB_PrimitiveComponent.getState_AddIntoBom() method

获取属性状态：是否加入 BOM

## 签名

```typescript
getState_AddIntoBom(): boolean;
```

## 返回值

boolean

是否加入 BOM

### getstate_component

# IPCB_PrimitiveComponent.getState_Component() method

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

### getstate_designator

# IPCB_PrimitiveComponent.getState_Designator() method

获取属性状态：位号

## 签名

```typescript
getState_Designator(): string | undefined;
```

## 返回值

string \| undefined

位号

### getstate_footprint

# IPCB_PrimitiveComponent.getState_Footprint() method

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

### getstate_layer

# IPCB_PrimitiveComponent.getState_Layer() method

获取属性状态：层

## 签名

```typescript
getState_Layer(): TPCB_LayersOfComponent;
```

## 返回值

[TPCB_LayersOfComponent](../types/TPCB_LayersOfComponent.md)

层

### getstate_manufacturer

# IPCB_PrimitiveComponent.getState_Manufacturer() method

获取属性状态：制造商

## 签名

```typescript
getState_Manufacturer(): string | undefined;
```

## 返回值

string \| undefined

制造商

### getstate_manufacturerid

# IPCB_PrimitiveComponent.getState_ManufacturerId() method

获取属性状态：制造商编号

## 签名

```typescript
getState_ManufacturerId(): string | undefined;
```

## 返回值

string \| undefined

制造商编号

### getstate_model3d

# IPCB_PrimitiveComponent.getState_Model3D() method

获取属性状态：关联库 3D 模型

## 签名

```typescript
getState_Model3D(): {
        libraryUuid: string;
        uuid: string;
    } | undefined;
```

## 返回值

{ libraryUuid: string; uuid: string; } \| undefined

关联库 3D 模型

### getstate_name

# IPCB_PrimitiveComponent.getState_Name() method

获取属性状态：名称

## 签名

```typescript
getState_Name(): string | undefined;
```

## 返回值

string \| undefined

名称

### getstate_otherproperty

# IPCB_PrimitiveComponent.getState_OtherProperty() method

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

### getstate_pads

# IPCB_PrimitiveComponent.getState_Pads() method

获取属性状态：焊盘

## 签名

```typescript
getState_Pads(): Array<{
        primitiveId: string;
        net: string;
        padNumber: string;
    }> | undefined;
```

## 返回值

Array&lt;{ primitiveId: string; net: string; padNumber: string; }&gt; \| undefined

焊盘

### getstate_primitiveid

# IPCB_PrimitiveComponent.getState_PrimitiveId() method

获取属性状态：图元 ID

## 签名

```typescript
getState_PrimitiveId(): string;
```

## 返回值

string

图元 ID

### getstate_primitivelock

# IPCB_PrimitiveComponent.getState_PrimitiveLock() method

获取属性状态：是否锁定

## 签名

```typescript
getState_PrimitiveLock(): boolean;
```

## 返回值

boolean

是否锁定

### getstate_primitivetype

# IPCB_PrimitiveComponent.getState_PrimitiveType() method

获取属性状态：图元类型

## 签名

```typescript
getState_PrimitiveType(): EPCB_PrimitiveType;
```

## 返回值

[EPCB_PrimitiveType](../enums/EPCB_PrimitiveType.md)

图元类型

### getstate_rotation

# IPCB_PrimitiveComponent.getState_Rotation() method

获取属性状态：旋转角度

## 签名

```typescript
getState_Rotation(): number;
```

## 返回值

number

旋转角度

### getstate_supplier

# IPCB_PrimitiveComponent.getState_Supplier() method

获取属性状态：供应商

## 签名

```typescript
getState_Supplier(): string | undefined;
```

## 返回值

string \| undefined

供应商

### getstate_supplierid

# IPCB_PrimitiveComponent.getState_SupplierId() method

获取属性状态：供应商编号

## 签名

```typescript
getState_SupplierId(): string | undefined;
```

## 返回值

string \| undefined

供应商编号

### getstate_uniqueid

# IPCB_PrimitiveComponent.getState_UniqueId() method

获取属性状态：唯一 ID

## 签名

```typescript
getState_UniqueId(): string | undefined;
```

## 返回值

string \| undefined

唯一 ID

### getstate_x

# IPCB_PrimitiveComponent.getState_X() method

获取属性状态：坐标 X

## 签名

```typescript
getState_X(): number;
```

## 返回值

number

坐标 X

### getstate_y

# IPCB_PrimitiveComponent.getState_Y() method

获取属性状态：坐标 Y

## 签名

```typescript
getState_Y(): number;
```

## 返回值

number

坐标 Y

### isasync

# IPCB_PrimitiveComponent.isAsync() method

查询图元是否为异步图元

## 签名

```typescript
isAsync(): boolean;
```

## 返回值

boolean

是否为异步图元

### reset

# IPCB_PrimitiveComponent.reset() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

将异步图元重置为当前画布状态

## 签名

```typescript
reset(): Promise<IPCB_PrimitiveComponent>;
```

## 返回值

Promise&lt;[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)<!-- -->&gt;

器件图元对象

### setstate_addintobom

# IPCB_PrimitiveComponent.setState_AddIntoBom() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：是否加入 BOM

## 签名

```typescript
setState_AddIntoBom(addIntoBom: boolean): IPCB_PrimitiveComponent;
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

boolean

</td><td>

是否加入 BOM

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### setstate_designator

# IPCB_PrimitiveComponent.setState_Designator() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：位号

## 签名

```typescript
setState_Designator(designator: string | undefined): IPCB_PrimitiveComponent;
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

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### setstate_layer

# IPCB_PrimitiveComponent.setState_Layer() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：层

## 签名

```typescript
setState_Layer(layer: TPCB_LayersOfComponent): IPCB_PrimitiveComponent;
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

[TPCB_LayersOfComponent](../types/TPCB_LayersOfComponent.md)

</td><td>

层

</td></tr>
</tbody></table>

## 返回值

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### setstate_manufacturer

# IPCB_PrimitiveComponent.setState_Manufacturer() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：制造商

## 签名

```typescript
setState_Manufacturer(manufacturer: string | undefined): IPCB_PrimitiveComponent;
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

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### setstate_manufacturerid

# IPCB_PrimitiveComponent.setState_ManufacturerId() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：制造商编号

## 签名

```typescript
setState_ManufacturerId(manufacturerId: string | undefined): IPCB_PrimitiveComponent;
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

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### setstate_name

# IPCB_PrimitiveComponent.setState_Name() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：名称

## 签名

```typescript
setState_Name(name: string | undefined): IPCB_PrimitiveComponent;
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

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### setstate_otherproperty

# IPCB_PrimitiveComponent.setState_OtherProperty() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：其它参数

## 签名

```typescript
setState_OtherProperty(otherProperty: {
        [key: string]: string | number | boolean;
    }): IPCB_PrimitiveComponent;
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

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### setstate_primitivelock

# IPCB_PrimitiveComponent.setState_PrimitiveLock() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：是否锁定

## 签名

```typescript
setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveComponent;
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

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### setstate_rotation

# IPCB_PrimitiveComponent.setState_Rotation() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：旋转角度

## 签名

```typescript
setState_Rotation(rotation: number): IPCB_PrimitiveComponent;
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

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### setstate_supplier

# IPCB_PrimitiveComponent.setState_Supplier() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：供应商

## 签名

```typescript
setState_Supplier(supplier: string | undefined): IPCB_PrimitiveComponent;
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

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### setstate_supplierid

# IPCB_PrimitiveComponent.setState_SupplierId() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：供应商编号

## 签名

```typescript
setState_SupplierId(supplierId: string | undefined): IPCB_PrimitiveComponent;
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

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### setstate_uniqueid

# IPCB_PrimitiveComponent.setState_UniqueId() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：唯一 ID

## 签名

```typescript
setState_UniqueId(uniqueId: string | undefined): IPCB_PrimitiveComponent;
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

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### setstate_x

# IPCB_PrimitiveComponent.setState_X() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：坐标 X

## 签名

```typescript
setState_X(x: number): IPCB_PrimitiveComponent;
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

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### setstate_y

# IPCB_PrimitiveComponent.setState_Y() method

> 此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。

设置属性状态：坐标 Y

## 签名

```typescript
setState_Y(y: number): IPCB_PrimitiveComponent;
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

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### toasync

# IPCB_PrimitiveComponent.toAsync() method

将图元转换为异步图元

## 签名

```typescript
toAsync(): IPCB_PrimitiveComponent;
```

## 返回值

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象

### tosync

# IPCB_PrimitiveComponent.toSync() method

将图元转换为同步图元

## 签名

```typescript
toSync(): IPCB_PrimitiveComponent;
```

## 返回值

[IPCB_PrimitiveComponent](./IPCB_PrimitiveComponent.md)

器件图元对象
