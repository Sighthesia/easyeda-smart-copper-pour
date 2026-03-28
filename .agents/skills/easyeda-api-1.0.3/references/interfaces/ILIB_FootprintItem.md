# ILIB_FootprintItem interface

封装属性

## 签名

```typescript
interface ILIB_FootprintItem
```

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

[classification?](./ILIB_FootprintItem.md)

</td><td>

</td><td>

[ILIB_ClassificationIndex](./ILIB_ClassificationIndex.md) \| Array&lt;string&gt;

</td><td>

_（可选）_ 分类

</td></tr>
<tr><td>

[description?](./ILIB_FootprintItem.md)

</td><td>

</td><td>

string

</td><td>

_（可选）_ 描述

</td></tr>
<tr><td>

[libraryType](./ILIB_FootprintItem.md)

</td><td>

`readonly`

</td><td>

[ELIB_LibraryType.FOOTPRINT](../enums/ELIB_LibraryType.md)

</td><td>

库类型

</td></tr>
<tr><td>

[libraryUuid](./ILIB_FootprintItem.md)

</td><td>

</td><td>

string

</td><td>

所属库 UUID

</td></tr>
<tr><td>

[name](./ILIB_FootprintItem.md)

</td><td>

</td><td>

string

</td><td>

封装名称

</td></tr>
<tr><td>

[uuid](./ILIB_FootprintItem.md)

</td><td>

</td><td>

string

</td><td>

封装 UUID

</td></tr>
</tbody></table>

---

## 属性详情

### classification

# ILIB_FootprintItem.classification property

分类

## 签名

```typescript
classification?: ILIB_ClassificationIndex | Array<string>;
```

### description

# ILIB_FootprintItem.description property

描述

## 签名

```typescript
description?: string;
```

### librarytype

# ILIB_FootprintItem.libraryType property

库类型

## 签名

```typescript
readonly libraryType: ELIB_LibraryType.FOOTPRINT;
```

### libraryuuid

# ILIB_FootprintItem.libraryUuid property

所属库 UUID

## 签名

```typescript
libraryUuid: string;
```

### name

# ILIB_FootprintItem.name property

封装名称

## 签名

```typescript
name: string;
```

### uuid

# ILIB_FootprintItem.uuid property

封装 UUID

## 签名

```typescript
uuid: string;
```
