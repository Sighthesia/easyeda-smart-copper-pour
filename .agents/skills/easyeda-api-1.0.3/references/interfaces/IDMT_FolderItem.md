# IDMT_FolderItem interface

文件夹属性

## 签名

```typescript
interface IDMT_FolderItem
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

[childrenFoldersUuid?](./IDMT_FolderItem.md)

</td><td>

</td><td>

Array&lt;string&gt;

</td><td>

_（可选）_ 子文件夹 UUID 列表

</td></tr>
<tr><td>

[description?](./IDMT_FolderItem.md)

</td><td>

</td><td>

string

</td><td>

_（可选）_ 文件夹描述

</td></tr>
<tr><td>

[itemType](./IDMT_FolderItem.md)

</td><td>

`readonly`

</td><td>

[EDMT_ItemType.FOLDER](../enums/EDMT_ItemType.md)

</td><td>

项目类型

</td></tr>
<tr><td>

[name](./IDMT_FolderItem.md)

</td><td>

</td><td>

string

</td><td>

文件夹名称

</td></tr>
<tr><td>

[parentFolderUuid](./IDMT_FolderItem.md)

</td><td>

</td><td>

string

</td><td>

父文件夹 UUID

</td></tr>
<tr><td>

[teamUuid](./IDMT_FolderItem.md)

</td><td>

</td><td>

string

</td><td>

所属团队 UUID

</td></tr>
<tr><td>

[uuid](./IDMT_FolderItem.md)

</td><td>

</td><td>

string

</td><td>

文件夹 UUID

</td></tr>
</tbody></table>

---

## 属性详情

### childrenfoldersuuid

# IDMT_FolderItem.childrenFoldersUuid property

子文件夹 UUID 列表

## 签名

```typescript
childrenFoldersUuid?: Array<string>;
```

### description

# IDMT_FolderItem.description property

文件夹描述

## 签名

```typescript
description?: string;
```

### itemtype

# IDMT_FolderItem.itemType property

项目类型

## 签名

```typescript
readonly itemType: EDMT_ItemType.FOLDER;
```

### name

# IDMT_FolderItem.name property

文件夹名称

## 签名

```typescript
name: string;
```

### parentfolderuuid

# IDMT_FolderItem.parentFolderUuid property

父文件夹 UUID

## 签名

```typescript
parentFolderUuid: string;
```

### teamuuid

# IDMT_FolderItem.teamUuid property

所属团队 UUID

## 签名

```typescript
teamUuid: string;
```

### uuid

# IDMT_FolderItem.uuid property

文件夹 UUID

## 签名

```typescript
uuid: string;
```
