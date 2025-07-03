"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ExecutionStatus {
	isRunning: boolean;
	currentSubnet?: string;
	completedSubnets?: string[];
	subnetStatuses?: Record<
		string,
		"idle" | "processing" | "completed" | "failed"
	>;
}

interface ExecutionStatusContextType {
	executionStatus: ExecutionStatus;
	updateExecutionStatus: (status: Partial<ExecutionStatus>) => void;
	resetExecutionStatus: () => void;
	stopExecution: () => void;
}

const ExecutionStatusContext = createContext<
	ExecutionStatusContextType | undefined
>(undefined);

export function ExecutionStatusProvider({ children }: { children: ReactNode }) {
	const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>({
		isRunning: false,
		currentSubnet: undefined,
		completedSubnets: [],
		subnetStatuses: {},
	});

	const updateExecutionStatus = (status: Partial<ExecutionStatus>) => {
		setExecutionStatus((prev) => ({
			...prev,
			...status,
		}));
	};

	const resetExecutionStatus = () => {
		setExecutionStatus({
			isRunning: false,
			currentSubnet: undefined,
			completedSubnets: [],
			subnetStatuses: {},
		});
	};

	// Stop execution but preserve completed states
	const stopExecution = () => {
		setExecutionStatus((prev) => ({
			...prev,
			isRunning: false,
			currentSubnet: undefined,
			// Keep completed subnets and their statuses
		}));
	};

	return (
		<ExecutionStatusContext.Provider
			value={{
				executionStatus,
				updateExecutionStatus,
				resetExecutionStatus,
				stopExecution,
			}}
		>
			{children}
		</ExecutionStatusContext.Provider>
	);
}

export function useExecutionStatus() {
	const context = useContext(ExecutionStatusContext);
	if (context === undefined) {
		throw new Error(
			"useExecutionStatus must be used within an ExecutionStatusProvider"
		);
	}
	return context;
}
