<script>
	import { browser } from '$app/environment'
	import { enhance } from '$app/forms'
	import p_debounce from 'p-debounce'

	/** @type {import('./$types').PageData} */
	export let data

	let name = ''
	let uuid = ''

	async function autocomplete() {
		const response = await fetch(`/resolve?name=${name}`)

		const data = await response.json()

		uuid = data.uuid
	}

	const autocomplete_throttled = p_debounce(autocomplete, 600)

	$: browser && name && autocomplete_throttled()

	function on_submit() {
		uuid = ''
		name = ''
	}
</script>

<pre><code>{JSON.stringify(data.bans, null, '\t')}</code></pre>

<form method="POST" action="?/add_ban" use:enhance on:submit={on_submit}>
	<input name="uuid" type="hidden" value={uuid} />
	<label>
		name
		<input name="name" type="text" bind:value={name} />
	</label>
	<label>
		note
		<input name="note" type="text" />
	</label>

	{#if uuid}
		<a href="https://world.secondlife.com/resident/{uuid}">{uuid}</a>
	{/if}

	<button disabled={!uuid}>bye</button>
</form>
