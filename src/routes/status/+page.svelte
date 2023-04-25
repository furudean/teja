<script>
	import { invalidateAll } from '$app/navigation'
	import { relative_date, since } from '$lib/date'
	import { onMount } from 'svelte'

	/** @type {import('./$types').PageData} */
	export let data

	/**
	 * @template T
	 * @param {T[]} list
	 * @param {(arg0: T) => T[keyof T]} fn
	 */
	function group_by(list, fn) {
		/** @type {Map<T[keyof T], T[]>} */
		const map = new Map()
		list.forEach((item) => {
			const key = fn(item)
			const collection = map.get(key)

			if (!collection) {
				map.set(key, [item])
			} else {
				collection.push(item)
			}
		})

		return map
	}

	$: owner_groups = group_by(data.clients, (client) => client.owner_key)

	onMount(() => {
		const interval = setInterval(() => {
			invalidateAll()
		}, 10000)

		return () => {
			clearInterval(interval)
		}
	})
</script>

<svelte:head>
	<title>teja status</title>
</svelte:head>

<h1>teja status</h1>

<p>updates every 10 sec!</p>

{#each [...owner_groups.entries()] as [_, clients]}
	<h2>
		{clients[0].owner_name}
		<span>({clients[0].owner_key})</span>
	</h2>
	<table>
		<thead>
			<td>object name</td>
			<td>object pos</td>
			<td>region</td>
			<td>last ping</td>
			<td>appeared</td>
		</thead>
		{#each clients as client}
			<tr class:inactive={since(client.last_ping).round('minutes').minutes > 5}>
				<td>{client.object_name}</td>
				<td>{client.position}</td>
				<td>{client.region}</td>
				<td>
					<time datetime={client.last_ping.toISOString()}>
						{relative_date(client.last_ping)}
					</time>
				</td>
				<td>
					<time
						datetime={client.first_ping.toISOString()}
						class:new={since(client.first_ping).round('hours').hours < 24}
					>
						{relative_date(client.first_ping)}
					</time>
				</td>
			</tr>
		{/each}
	</table>
{/each}

<style>
	h2 span {
		font-size: 0.5em;
		opacity: 0.5;
	}

	table {
		min-width: 800px;
	}

	.new {
		background: blue;
		color: white;
	}

	.inactive {
		opacity: 0.5;
	}
</style>
