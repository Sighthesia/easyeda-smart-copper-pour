# ISCH_Primitive interface

原理图图元

## 签名

```typescript
interface ISCH_Primitive
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

[create](./ISCH_Primitive.md)

</td><td>

</td><td>

() =&gt; [ISCH_Primitive](./ISCH_Primitive.md) \| Promise&lt;[ISCH_Primitive](./ISCH_Primitive.md)<!-- -->&gt;

</td><td>

</td></tr>
<tr><td>

[done](./ISCH_Primitive.md)

</td><td>

</td><td>

() =&gt; [ISCH_Primitive](./ISCH_Primitive.md) \| Promise&lt;[ISCH_Primitive](./ISCH_Primitive.md)<!-- -->&gt;

</td><td>

</td></tr>
<tr><td>

[getState_PrimitiveId](./ISCH_Primitive.md)

</td><td>

</td><td>

() =&gt; string

</td><td>

</td></tr>
<tr><td>

[getState_PrimitiveType](./ISCH_Primitive.md)

</td><td>

</td><td>

() =&gt; [ESCH_PrimitiveType](../enums/ESCH_PrimitiveType.md)

</td><td>

</td></tr>
<tr><td>

[isAsync](./ISCH_Primitive.md)

</td><td>

</td><td>

() =&gt; boolean

</td><td>

</td></tr>
<tr><td>

[reset](./ISCH_Primitive.md)

</td><td>

</td><td>

() =&gt; [ISCH_Primitive](./ISCH_Primitive.md) \| Promise&lt;[ISCH_Primitive](./ISCH_Primitive.md)<!-- -->&gt;

</td><td>

</td></tr>
<tr><td>

[toAsync](./ISCH_Primitive.md)

</td><td>

</td><td>

() =&gt; [ISCH_Primitive](./ISCH_Primitive.md)

</td><td>

</td></tr>
<tr><td>

[toSync](./ISCH_Primitive.md)

</td><td>

</td><td>

() =&gt; [ISCH_Primitive](./ISCH_Primitive.md)

</td><td>

</td></tr>
</tbody></table>

---

## 属性详情

### create

# ISCH_Primitive.create property

## 签名

```typescript
create: () => ISCH_Primitive | Promise<ISCH_Primitive>;
```

### done

# ISCH_Primitive.done property

## 签名

```typescript
done: () => ISCH_Primitive | Promise<ISCH_Primitive>;
```

### getstate_primitiveid

# ISCH_Primitive.getState_PrimitiveId property

## 签名

```typescript
getState_PrimitiveId: () => string;
```

### getstate_primitivetype

# ISCH_Primitive.getState_PrimitiveType property

## 签名

```typescript
getState_PrimitiveType: () => ESCH_PrimitiveType;
```

### isasync

# ISCH_Primitive.isAsync property

## 签名

```typescript
isAsync: () => boolean;
```

### reset

# ISCH_Primitive.reset property

## 签名

```typescript
reset: () => ISCH_Primitive | Promise<ISCH_Primitive>;
```

### toasync

# ISCH_Primitive.toAsync property

## 签名

```typescript
toAsync: () => ISCH_Primitive;
```

### tosync

# ISCH_Primitive.toSync property

## 签名

```typescript
toSync: () => ISCH_Primitive;
```
