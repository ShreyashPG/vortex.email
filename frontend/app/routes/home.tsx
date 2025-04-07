import { Copy, CopyCheck, Inbox, LoaderCircle, RefreshCcw } from "lucide-react";

import * as Accordion from "@radix-ui/react-accordion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useState } from "react";

import Email from "~/components/home/email";
import { getRandomEmail, type Email as EmailType } from "~/utils/main";

export function meta() {
	return [
		{ title: "Vortex - Free, disposable email addresses" },
		{
			name: "description",
			content:
				"Free, disposable email addresses for annoying newsletters, websites, and everything in between! Protect your privacy and avoid spam with temporary email addresses.",
		},
	];
}

export default function Home() {
	const [email] = useLocalStorage("email", getRandomEmail());

	const queryClient = useQueryClient();
	const { isPending, error, data } = useQuery<EmailType[]>({
		queryKey: ["emails", email],
		queryFn: () => {
			return fetch(`${import.meta.env.VITE_API_ENDPOINT}/emails/${email}`)
				.then((res) => res.json() as Promise<EmailType[]>)
				.then((emails) =>
					emails.sort(
						(a, b) =>
							new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
					),
				);
		},
		refetchInterval: 5000,
	});

	return (
		<>
			<div className="my-12 mx-3 md:mx-6">
				<div className="space-y-2 text-center md:w-[65%] mx-auto">
					<h1 className="text-4xl font-semibold">
						Free, disposable email addresses
					</h1>
					<p className="text-lg text-text/80">
						For annoying newsletters, websites, and everything in between!
						Protect your privacy and avoid spam with temporary email addresses.
					</p>
				</div>

				<div className="bg-mantle rounded border border-surface0 px-8 py-6 mt-6 w-full md:w-1/2 mx-auto">
					<p className="font-semibold text-lg text-center mb-2">
						Your email address:
					</p>

					<div className="flex justify-center items-center border border-surface0 bg-surface0/30 px-4 py-3 rounded mb-2.5">
						{email}
					</div>
					<div className="flex gap-4 text-blue justify-center items-center mt-4">
						<CopyButton email={email} highlightOnCopy />
						<GenerateButton />
					</div>
				</div>

				<div className="mt-6">
					{isPending && (
						<LoaderCircle
							className="my-8 text-blue animate-spin mx-auto"
							size={32}
						/>
					)}
					{error && (
						<p className="text-center py-5 bg-red-500 text-base">
							Error: {error.message}
						</p>
					)}
					{data && data.length > 0 ? (
						<div className="w-full md:w-1/2 mx-auto">
							<Accordion.Root type="multiple">
								{data.map((email) => (
									<Email key={email.email.id} email={email} />
								))}
							</Accordion.Root>
							<div className="mb-4" />
							<button
								className="text-center border border-surface0 rounded bg-surface0/30 hover:bg-red-500 px-4 py-2 w-full transition duration-350 font-semibold"
								onClick={async () => {
									await fetch(
										`${import.meta.env.VITE_API_ENDPOINT}/emails/${email}/clear`,
										{
											method: "DELETE",
										},
									);
									queryClient.setQueryData(["emails", email], []);
								}}
							>
								Clear all emails
							</button>
						</div>
					) : (
						!isPending && (
							<div className="flex justify-center items-center gap-4 border border-surface0 bg-surface0/30 px-4 py-6 rounded w-full md:w-1/2 xl:w-1/3 mx-auto">
								<Inbox
									size={64}
									strokeWidth={1.25}
									className="w-1/4 md:w-1/5 min-w-1/4"
								/>
								<div className="flex flex-col gap-0.5 w-3/4 md:w-4/5 min-w-3/4">
									<h2 className="sm:text-xl font-medium">
										No emails found for {email}
									</h2>
									<p className="text-sm sm:text-base sm:text-text/80 text-text/80">
										Copy your email address and start using it to receive
										messages
									</p>
								</div>
							</div>
						)
					)}
				</div>
			</div>
		</>
	);
}

function CopyButton({
	email,
	highlightOnCopy = false,
}: {
	email: string;
	highlightOnCopy?: boolean;
}) {
	const [copied, setCopied] = useState(false);

	return (
		<button
			type="button"
			className={`flex items-center space-x-2 ${copied && highlightOnCopy ? "text-green" : ""}`}
			onClick={() => {
				navigator.clipboard.writeText(email);
				setCopied(true);
				setTimeout(() => {
					setCopied(false);
				}, 1000);
			}}
		>
			{copied ? <CopyCheck size={16} /> : <Copy size={16} />}
			<span>{copied ? "Copied!" : "Copy email"}</span>
		</button>
	);
}

function GenerateButton() {
	const [_, setEmail] = useLocalStorage("email", getRandomEmail());
	const queryClient = useQueryClient();

	return (
		<button
			type="button"
			className="flex items-center space-x-2"
			onClick={() => {
				const newEmail = getRandomEmail();
				queryClient.setQueryData(["emails", newEmail], []);
				setEmail(newEmail);
			}}
		>
			<RefreshCcw size={16} />
			<span>Generate new email</span>
		</button>
	);
}
