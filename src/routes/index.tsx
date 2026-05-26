import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div className="min-h-screen bg-stone-50 px-6 py-16 text-stone-950">
			<main className="mx-auto flex max-w-4xl flex-col gap-8">
				<p className="font-medium text-sm uppercase tracking-[0.25em] text-emerald-700">
					Recipe Pantry Manager
				</p>
				<section className="space-y-6">
					<h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
						Plan recipes, track pantry items, and build smarter grocery lists.
					</h1>
					<p className="max-w-2xl text-lg leading-8 text-stone-700">
						Save the meals you want to cook, compare ingredients against what
						you already have, and see exactly what still needs to be bought.
					</p>
				</section>
				<div className="flex flex-wrap gap-3">
					<a
						className="rounded-full bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800"
						href="/signup"
					>
						Create account
					</a>
					<a
						className="rounded-full border border-stone-300 px-5 py-3 font-semibold transition hover:border-stone-950"
						href="/login"
					>
						Log in
					</a>
				</div>
			</main>
		</div>
	);
}
