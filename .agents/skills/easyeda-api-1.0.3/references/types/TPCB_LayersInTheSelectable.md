# TPCB_LayersInTheSelectable type

可选中图层

## 签名

```typescript
type TPCB_LayersInTheSelectable =
	| TPCB_LayersOfInner
	| TPCB_LayersOfCustom
	| EPCB_LayerId.TOP
	| EPCB_LayerId.TOP_SILKSCREEN
	| EPCB_LayerId.TOP_SOLDER_MASK
	| EPCB_LayerId.TOP_PASTE_MASK
	| EPCB_LayerId.TOP_ASSEMBLY
	| EPCB_LayerId.TOP_STIFFENER
	| EPCB_LayerId.BOTTOM
	| EPCB_LayerId.BOTTOM_SILKSCREEN
	| EPCB_LayerId.BOTTOM_SOLDER_MASK
	| EPCB_LayerId.BOTTOM_PASTE_MASK
	| EPCB_LayerId.BOTTOM_ASSEMBLY
	| EPCB_LayerId.BOTTOM_STIFFENER
	| EPCB_LayerId.BOARD_OUTLINE
	| EPCB_LayerId.MULTI
	| EPCB_LayerId.DOCUMENT
	| EPCB_LayerId.MECHANICAL
	| EPCB_LayerId.DRILL_DRAWING
	| EPCB_LayerId.RATLINE
	| EPCB_LayerId.COMPONENT_SHAPE
	| EPCB_LayerId.COMPONENT_MARKING
	| EPCB_LayerId.PIN_SOLDERING
	| EPCB_LayerId.PIN_FLOATING
	| EPCB_LayerId.SHELL_3D_OUTLINE
	| EPCB_LayerId.SHELL_3D_TOP
	| EPCB_LayerId.SHELL_3D_BOTTOM;
```

## 引用

[TPCB_LayersOfInner](./TPCB_LayersOfInner.md)<!-- -->, [TPCB_LayersOfCustom](./TPCB_LayersOfCustom.md)<!-- -->, [EPCB_LayerId.TOP](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.TOP_SILKSCREEN](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.TOP_SOLDER_MASK](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.TOP_PASTE_MASK](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.TOP_ASSEMBLY](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.TOP_STIFFENER](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.BOTTOM](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.BOTTOM_SILKSCREEN](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.BOTTOM_SOLDER_MASK](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.BOTTOM_PASTE_MASK](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.BOTTOM_ASSEMBLY](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.BOTTOM_STIFFENER](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.BOARD_OUTLINE](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.MULTI](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.DOCUMENT](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.MECHANICAL](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.DRILL_DRAWING](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.RATLINE](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.COMPONENT_SHAPE](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.COMPONENT_MARKING](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.PIN_SOLDERING](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.PIN_FLOATING](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.SHELL_3D_OUTLINE](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.SHELL_3D_TOP](../enums/EPCB_LayerId.md)<!-- -->, [EPCB_LayerId.SHELL_3D_BOTTOM](../enums/EPCB_LayerId.md)

## 备注

此处为所有在编辑器图层菜单中可以选中并设置可见性的图层
