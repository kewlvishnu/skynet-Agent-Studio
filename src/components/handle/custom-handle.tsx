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
			width: "8px",
			height: "45px",
			borderRadius: "0%",
			position: "absolute",
			transform: "translateX(50%, -50%)",
			[handleProps.position === Position.Right
				? "right"
				: handleProps.position === Position.Left
				? "left"
				: "top"]:
				handleProps.position === Position.Right ? "-2.5px" : "-2.7px",
			...customStyle,
		}}
	/>
);
