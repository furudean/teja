<script>
	import { relative_date, since } from '$lib/date'

	/** @type {import('./$types').PageData['bans']} */
	export let bans
</script>

<table>
	<thead>
		<td>username</td>
		<td>note</td>
		<td>return obj</td>
		<td>last mod</td>
		<td>uuid</td>
	</thead>
	{#each bans as ban (ban.uuid)}
		<tr class:revoked={ban.revoked}>
			<td class="str">
				<a href="?uuid={ban.uuid}&username={ban.username}">{ban.username}</a>
			</td>
			<td>{ban.note || '-'}</td>
			<td>
				<input type="checkbox" checked={ban.return_objects} readonly />
			</td>
			<td>
				<time
					datetime={ban.last_modified.toISOString()}
					class:new={since(ban.last_modified).round('days').days < 14}
				>
					{relative_date(ban.last_modified)}
				</time>
			</td>
			<td class="ms">{ban.uuid}</td>
		</tr>
	{/each}
</table>

<style>
	.new {
		background: blue;
		color: white;
	}

	.revoked {
		opacity: 0.5;
	}

	.revoked .str {
		text-decoration: line-through;
	}
</style>
