<script>
	import { enhance } from '$app/forms'
	import p_debounce from 'p-debounce'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'

	/** @type {import('./$types').PageData} */
	export let data

	let display_name = $page.url.searchParams.get('display_name') ?? ''
	let username = $page.url.searchParams.get('username') ?? ''
	let uuid = $page.url.searchParams.get('uuid') ?? ''
	let loading_user = false

	function set_params() {
		const search_params = $page.url.searchParams

		/**
		 * @param {string} name
		 * @param {string} value
		 */
		const set = (name, value) =>
			value ? search_params.set(name, value) : search_params.delete(name)

		set('uuid', uuid)
		set('username', username)
		set('display_name', display_name)

		goto('?' + search_params.toString(), {
			keepFocus: true,
			replaceState: true
		})
	}

	async function autocomplete() {
		const response = await fetch(`/admin/resolve?query=${username}`)
		const data = await response.json()

		uuid = data.uuid
		username = data.username
		display_name = data.display_name

		set_params()

		loading_user = false
	}

	const autocomplete_throttled = p_debounce(autocomplete, 600)

	function on_change_name() {
		loading_user = true
		uuid = ''
		autocomplete_throttled()
	}

	function on_submit() {
		uuid = ''
		username = ''

		set_params()
	}

	$: selected_user = data.bans.find((ban) => ban.uuid === uuid)
</script>

<pre><code>{JSON.stringify(data.bans, null, '\t')}</code></pre>

<form method="POST" use:enhance on:submit={on_submit}>
	<input name="uuid" type="hidden" value={uuid} />

	<label>
		query username
		<br />
		<input
			name="username"
			type="text"
			required
			bind:value={username}
			on:input={on_change_name}
		/>
	</label>

	<br />

	{#if loading_user}
		<p>hold on...</p>
	{/if}

	<br />

	{#if uuid}
		<fieldset>
			{#if selected_user}
				<p>
					{selected_user.username} is BANNED
					{#if selected_user.note}
						for "{selected_user.note}"
					{/if}
				</p>

				<button formaction="?/remove_ban">revoke ban</button>
			{:else if uuid}
				<p>
					<b>
						you are about to enact the banhammer on resident
						<a href="https://world.secondlife.com/resident/{uuid}">
							{username}
							{#if display_name}
								({display_name})
							{/if}
						</a>!
					</b>
				</p>

				<label>
					reason
					<br />
					<input name="note" type="text" placeholder="optional" />
				</label>

				<br />
				<br />

				<label>
					<input name="return_objects" type="checkbox" />
					return objects from this resident
				</label>

				<br />
				<br />
				<button formaction="?/add_ban">ban user</button>
			{/if}
		</fieldset>
	{/if}
</form>
