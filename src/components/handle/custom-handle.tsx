import { Handle, HandleProps, Position } from "@xyflow/react";

interface CustomHandleProps extends Omit<HandleProps, "style"> {
	customStyle?: React.CSSProperties;
}

export const CustomHandle = ({
	customStyle,
	...handleProps
}: CustomHandleProps) => (
	<Handle
		{...handleProps}
		style={{
			background: "#B8C1CC",
			border: "1px solid #B8C1CC",
			width:
				handleProps.position === Position.Top ||
				handleProps.position === Position.Bottom
					? "45px"
					: "8px",
			height:
				handleProps.position === Position.Top ||
				handleProps.position === Position.Bottom
					? "8px"
					: "45px",
			borderRadius: "0%",
			position: "absolute",
			zIndex: 10,
			transform:
				handleProps.position === Position.Top ||
				handleProps.position === Position.Bottom
					? "translateX(-50%)"
					: "translateY(-50%)",
			...(handleProps.position === Position.Right && { right: "-8px" }),
			...(handleProps.position === Position.Left && { left: "-8px" }),
			...(handleProps.position === Position.Bottom && { bottom: "-8px" }),
			...(handleProps.position === Position.Top && { top: "-8px" }),
			...customStyle,
		}}
	/>
);
