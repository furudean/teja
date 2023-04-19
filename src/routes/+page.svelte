<script>
	import { enhance } from '$app/forms'

	/** @type {import('./$types').PageData} */
	export let data
</script>

<pre><code>{JSON.stringify(data.bans, null, '\t')}</code></pre>

<form method="POST" action="?/ban" use:enhance>
	<label>
		uuid
		<input name="uuid" type="tex" />
	</label>
	<label>
		uname
		<input name="uname" type="tex" />
	</label>
	<label>
		note
		<input name="note" type="text" />
	</label>
	<button>bye</button>
</form>
