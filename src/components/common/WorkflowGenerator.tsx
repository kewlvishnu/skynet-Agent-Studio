"use client";

import React, { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import { AppCryptoContext } from "@/providers/AppCryptoProvider";
import { Web3Context, isConnectedState } from "@/providers/Web3ContextProvider";
import {
	generateAgentWithValidation,
	fetchNfts,
	logAPICall,
	validateAPIPayload,
} from "@/utils/skynetHelper";

interface WorkflowGeneratorProps {
	onWorkflowGenerated?: (workflow: any) => void;
	className?: string;
}

export default function WorkflowGenerator({
	onWorkflowGenerated,
	className,
}: WorkflowGeneratorProps) {
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { skyBrowser } = useContext(AppCryptoContext);
	const web3Context = useContext(Web3Context);

	const validatePrompt = (prompt: string) => {
		if (!prompt.trim())
			return { valid: false, error: "Prompt is required" };
		if (prompt.length > 5000)
			return {
				valid: false,
				error: "Prompt too long (max 5000 characters)",
			};
		if (prompt.length < 5)
			return {
				valid: false,
				error: "Prompt too short (min 5 characters)",
			};
		return { valid: true };
	};

	const handleGenerateWorkflow = async () => {
		if (!prompt.trim()) {
			toast.error("Please enter a prompt");
			return;
		}

		const promptValidation = validatePrompt(prompt);
		if (!promptValidation.valid) {
			toast.error(promptValidation.error || "Invalid prompt");
			return;
		}

		setError(null);

		try {
			// 1. Validate skyBrowser
			if (!skyBrowser) {
				console.error("SkyBrowser not initialized");
				toast.error("Please login again");
				return;
			}

			if (!isConnectedState(web3Context)) {
				toast.error("Please connect your wallet first");
				return;
			}

			console.log("Starting workflow generation...");
			setIsGenerating(true);

			// 2. Get and validate authentication
			console.log("Getting authentication...");
			const signatureResp = await skyBrowser.appManager.getUrsulaAuth();
			console.log("Auth response:", signatureResp);

			if (!signatureResp?.success) {
				console.error("Authentication failed:", signatureResp);
				throw new Error(
					"Authentication failed - please try refreshing your wallet connection"
				);
			}

			if (
				!signatureResp.data?.userAddress ||
				!signatureResp.data?.signature ||
				!signatureResp.data?.message
			) {
				console.error(
					"Invalid auth payload structure:",
					signatureResp.data
				);
				throw new Error("Invalid authentication payload structure");
			}

			// 3. Get valid NFT ID
			console.log("Fetching user NFTs...");
			const userNfts = await fetchNfts(
				skyBrowser.contractService.selectedAccount,
				skyBrowser
			);
			const validNftId = userNfts.length > 0 ? userNfts[0] : "0";
			console.log("Using NFT ID:", validNftId);

			if (validNftId === "0" && userNfts.length === 0) {
				console.warn("No NFTs found, using fallback NFT ID");
				toast.error(
					"No NFTs found in your wallet. Please mint an NFT first."
				);
				return;
			}

			// 4. Prepare and validate payload
			const payload = {
				prompt: prompt.trim(),
				userAuthPayload: signatureResp.data,
				nftId: validNftId,
			};

			console.log("Request payload prepared:", {
				promptLength: payload.prompt.length,
				userAddress: payload.userAuthPayload.userAddress,
				nftId: payload.nftId,
				hasValidAuth: !!(
					payload.userAuthPayload.signature &&
					payload.userAuthPayload.message
				),
			});

			// Validate payload structure
			validateAPIPayload(payload);

			// 5. Make API call with enhanced error handling using axios
			console.log("Making API request to workflow generation service...");
			const response = await axios.post(
				"https://skyintel-c0n1.stackos.io/natural-request",
				payload,
				{
					headers: {
						"Content-Type": "application/json",
					},
					timeout: 60000, // 60 second timeout
				}
			);

			console.log("Response status:", response.status);
			console.log("Response headers:", response.headers);
			console.log("Success response:", response.data);

			// Log the API call for debugging
			logAPICall(
				"https://skyintel-c0n1.stackos.io/natural-request",
				payload,
				response.data
			);

			toast.success("Workflow generated successfully!");

			// Call the callback with the generated workflow
			onWorkflowGenerated?.(response.data);
		} catch (error) {
			console.error("Complete error object:", error);
			const axiosError = error as AxiosError;

			let errorMessage = "Failed to generate workflow";

			if (axiosError.response) {
				// Server responded with error status
				const status = axiosError.response.status;
				const errorData = axiosError.response.data;

				console.error("API Error Response:", {
					status,
					data: errorData,
					headers: axiosError.response.headers,
				});

				// Provide specific error messages based on status code
				if (status === 400) {
					errorMessage =
						"Invalid request - please check your authentication and try again";
				} else if (status === 401) {
					errorMessage =
						"Authentication failed - please refresh your wallet connection";
				} else if (status === 403) {
					errorMessage =
						"Access denied - please check your NFT ownership";
				} else if (status >= 500) {
					errorMessage = "Server error - please try again later";
				}

				// Try to extract more detailed error message
				const detailedMessage =
					typeof errorData === "string"
						? errorData
						: (errorData as any)?.message ||
						  JSON.stringify(errorData);

				errorMessage += `: ${detailedMessage}`;
			} else if (axiosError.request) {
				// Network error
				console.error("Network error:", axiosError.message);
				errorMessage = `Network error: ${axiosError.message}`;
			} else if (error instanceof Error) {
				// Other error
				console.error("Error stack:", error.stack);
				errorMessage = error.message;
			}

			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Wand2 className="w-5 h-5" />
					Workflow Generator
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="workflow-prompt">
						Describe your workflow
					</Label>
					<Textarea
						id="workflow-prompt"
						placeholder="e.g., Create a customer support workflow that processes incoming emails, analyzes sentiment, and routes to appropriate departments..."
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						className="min-h-[120px] resize-none"
						disabled={isGenerating}
					/>
					<div className="text-xs text-muted-foreground">
						{prompt.length}/5000 characters
					</div>
				</div>

				{error && (
					<div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
						<AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
						<div className="text-sm text-destructive">{error}</div>
					</div>
				)}

				<Button
					onClick={handleGenerateWorkflow}
					disabled={isGenerating || !prompt.trim()}
					className="w-full"
				>
					{isGenerating ? (
						<>
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							Generating Workflow...
						</>
					) : (
						<>
							<Wand2 className="w-4 h-4 mr-2" />
							Generate Workflow
						</>
					)}
				</Button>

				{!skyBrowser && (
					<div className="text-xs text-muted-foreground text-center">
						Please connect your wallet to generate workflows
					</div>
				)}
			</CardContent>
		</Card>
	);
}
