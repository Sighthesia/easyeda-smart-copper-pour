# TPCB_LayersOfFill type

填充所属层

## 签名

```typescript
type TPCB_LayersOfFill =
	| TPCB_LayersOfCopper
	| TPCB_LayersOfCustom
	| EPCB_LayerId.TOP_SILKSCREEN
	| EPCB_LayerId.TOP_SOLDER_MASK
	| EPCB_LayerId.TOP_PASTE_MASK
	| EPCB_LayerId.TOP_ASSEMBLY
	| EPCB_LayerId.BOTTOM_SILKSCREEN
	| EPCB_LayerId.BOTTOM_SOLDER_MASK
	| EPCB_LayerId.BOTTOM_PASTE_MASK
	| EPCB_LayerId.BOTTOM_ASSEMBLY
	| EPCB_LayerId.DOCUMENT
	| EPCB_LayerId.MECHANICAL
	| EPCB_LayerId.MULTI;
```

## 引用

[TPCB_LayersOfCopper](./TPCB_LayersOfCopper.md)<!-- -->, [TPCB_LayersOfCustom](./TPCB_LayersOfCustom.md)<!-- -->, [EPCB_LayerId.TOP_SILKSCREEN](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.TOP_SOLDER_MASK](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.TOP_PASTE_MASK](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.TOP_ASSEMBLY](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.BOTTOM_SILKSCREEN](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.BOTTOM_SOLDER_MASK](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.BOTTOM_PASTE_MASK](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.BOTTOM_ASSEMBLY](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.DOCUMENT](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.MECHANICAL](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.MULTI](../enums/EPCB_LayerId.md)

## 备注

填充所属层为 [EPCB_LayerId.MULTI](../enums/EPCB_LayerId.md) 时代表挖槽区域
