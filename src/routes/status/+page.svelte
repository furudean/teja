<script>
	import { invalidateAll } from '$app/navigation'
	import { relative_date, since } from '$lib/date'
	import { onMount } from 'svelte'
	import SLMap from '$lib/Map.svelte'
	import { local_to_lat_long, region_to_lat_long, translate } from '$lib/map'

	const PERMISSION_RETURN_OBJECTS = 65536

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

	/** @param {import(".prisma/client").Client} client */
	const is_stale = (client) => {
		return since(client.last_ping).round('minutes').minutes > 5
	}

	$: owner_groups = group_by(data.clients, (client) => client.owner_key)
	$: points = data.clients
		.filter((client) => !is_stale(client))
		.map(({ position, region }) =>
			translate(region_to_lat_long(region), local_to_lat_long(position))
		)

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

<SLMap {points} />

{#each [...owner_groups.entries()] as [owner_key, clients] (owner_key)}
	<h2>
		{clients[0].owner_name}
		<span>({owner_key})</span>
	</h2>
	<table>
		<thead>
			<td>object name</td>
			<td>object pos</td>
			<td>region</td>
			<td>last ping</td>
			<td>appeared</td>
			<td>script ver</td>
			<td>obj return</td>
		</thead>
		{#each clients as client (client.object_key)}
			<tr class:inactive={is_stale(client)}>
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
				<td>
					{client.script_version || '1.0'}
				</td>
				<td>
					{Boolean(PERMISSION_RETURN_OBJECTS & client.permissions_mask)}
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
		min-width: 1000px;
	}

	.new {
		background: blue;
		color: white;
	}

	.inactive {
		opacity: 0.5;
	}
</style>
