import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headerVariants = cva(
	"flex items-center justify-between p-4 border-b border-gray w-full",
	{
		variants: {
			size: {
				default: "h-16",
				sm: "h-12",
				lg: "h-20",
			},
			spacing: {
				default: "p-4",
				sm: "p-2",
				lg: "p-6",
			},
		},
		defaultVariants: {
			size: "default",
			spacing: "default",
		},
	}
);

export interface HeaderProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof headerVariants> {
	icon?: React.ReactNode;
	title?: string;
	subtitle?: string;
	actions?: React.ReactNode;
	titleClassName?: string;
	subtitleClassName?: string;
	leftSideClassName?: string;
	rightSideClassName?: string;
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
	(
		{
			className,
			size,
			spacing,
			icon,
			title,
			subtitle,
			actions,
			titleClassName,
			subtitleClassName,
			leftSideClassName,
			rightSideClassName,
			...props
		},
		ref
	) => {
		return (
			<div
				className={cn(headerVariants({ size, spacing, className }))}
				ref={ref}
				{...props}
			>
				{/* Left Side */}
				<div
					className={cn("flex items-center gap-3", leftSideClassName)}
				>
					{/* Icon */}
					{icon && (
						<div className="flex items-center justify-center">
							{icon}
						</div>
					)}

					{/* Title and Subtitle */}
					{(title || subtitle) && (
						<div className="flex flex-col">
							{title && (
								<h1
									className={cn(
										"text-sm font-medium text-foreground",
										titleClassName
									)}
								>
									{title}
								</h1>
							)}
							{subtitle && (
								<p
									className={cn(
										"text-xs text-muted-foreground",
										subtitleClassName
									)}
								>
									{subtitle}
								</p>
							)}
						</div>
					)}
				</div>

				{/* Right Side Actions */}
				{actions && (
					<div
						className={cn("flex items-center", rightSideClassName)}
					>
						{actions}
					</div>
				)}
			</div>
		);
	}
);
Header.displayName = "Header";

export { Header, headerVariants };
